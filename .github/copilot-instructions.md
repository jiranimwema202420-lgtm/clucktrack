# CluckTrack Copilot Instructions

## Commands

- `npm run dev` starts the Next.js development server on its default port (3000). Use `npm run dev -- -p 9002` to run it on port 9002.
- `npm run build` creates a production build with webpack in a POSIX shell; on Windows, use `npx next build --webpack` because the script's `NODE_ENV=production` prefix is not cross-platform. `npm run start` serves the build.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run genkit:watch` starts the Genkit developer UI (normally port 4000); use `npm run genkit:dev` for a non-watching process.
- There is no test runner, test script, or test suite configured, so no single-test command exists.
- `npm run lint` is present in `package.json`, but it calls `next lint`, which is not available in Next.js 16. Do not rely on it until the lint script is updated.

Use Node.js 18 or newer and `npm install`. Genkit flows require `GEMINI_API_KEY` in `.env.local`.

## Architecture

- This is a TypeScript Next.js App Router application. Page routes under `src/app/` are mostly client components (`'use client'`) and are wrapped by `src/app/layout.tsx`.
- The root layout initializes Firebase through `FirebaseClientProvider`, applies the theme and toast providers, and enforces client-side access: `/` and `/login` are public; the remaining routes require an authenticated user and render within the sidebar/header shell.
- Firebase is the backend. `src/firebase/index.ts` initializes using App Hosting's no-argument `initializeApp()` first, then falls back to `src/firebase/config.ts` for local development. Keep that initialization order intact.
- Domain data is stored in user-scoped Firestore subcollections (`users/{uid}/flocks`, `sales`, `expenditures`, `contacts`, and `sensorData`). The `feeds` collection is shared and read-only for ordinary signed-in users. `firestore.rules` is the source of truth for this access model.
- Authentication profiles are represented by both Firebase Auth and `users/{uid}`. New email/password and Google users must create the profile document with an `id` equal to the authenticated UID, as required by Firestore rules.
- `src/lib/types.ts` defines both domain interfaces and Zod form schemas. Services in `src/services/` serialize form `Date` values to Firestore `Timestamp`s and compute persisted totals such as sale `total` and expenditure `amount`.
- Firestore reads use the real-time `useCollection`/`useDoc` hooks. AI screens call server-side Genkit flows in `src/ai/flows/`; each flow defines its input/output Zod schemas and uses the shared `ai` instance from `src/ai/genkit.ts`.

## Repository Conventions

- Import application code through the `@/` alias, which maps to `src/`.
- Memoize every Firestore collection reference or query passed to `useCollection` or `useDoc`, usually with `useMemo` and `[firestore, user]`. The hooks subscribe with `onSnapshot`; passing a newly created reference on each render resubscribes continuously.
- Obtain `firestore` and `user` with `useFirebase()` before creating user-scoped references. Return `null` from the memoized reference while the user is unavailable.
- Route Firestore mutations through the corresponding functions in `src/services/`, which in turn use the `*DocumentNonBlocking` helpers. Those helpers publish permission failures to the global Firebase error listener instead of requiring per-page `catch` handling.
- For direct profile-document writes, use `setDocumentNonBlocking(..., { merge: true })` so the required profile fields and previously saved farm settings remain intact. Use awaited Firebase Auth calls when the UI must display authentication failure feedback.
- Read failures from `useCollection` and `useDoc`, as well as failures from non-blocking writes, are transformed into `FirestorePermissionError` events and surfaced by `FirebaseErrorListener` in development. Preserve that error-emitter path rather than adding duplicate per-screen permission handling.
- Convert Firestore `Timestamp`s to `Date` before setting form defaults, and convert submitted `Date`s back to `Timestamp`s in the service layer. Do not store client `Date` objects directly.
- Reuse Zod schemas from `src/lib/types.ts` with `zodResolver` for forms. Values derived from inputs, including sale totals and expenditure amounts, are recomputed in services rather than trusted from the form.
- UI is built from local shadcn/Radix primitives in `src/components/ui/`, Tailwind CSS, CSS variables, and Lucide icons. Follow `components.json` aliases and use the existing `cn` utility for conditional classes.
- Pages that subscribe to Firebase data export `dynamic = 'force-dynamic'`; retain this for new data-backed route pages.
