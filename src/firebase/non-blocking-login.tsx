'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

/**
 * Creates a user profile document in Firestore if one doesn't already exist.
 * This is useful for saving user data upon their first sign-in, including social logins.
 */
async function createUserProfile(firestore: Firestore, user: User) {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    // Document doesn't exist, create it.
    const newUserProfile = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'New Farmer',
      farmName: 'My Farm',
    };
    // Use setDoc to create the document non-blockingly
    setDoc(userDocRef, newUserProfile, { merge: true }).catch((error) => {
      // The error handling for setDoc is managed by non-blocking-updates.ts
      // which uses the global error emitter. We can log here if needed,
      // but the user-facing error will be handled by the global listener.
      console.error('Failed to create user profile:', error);
    });
  }
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  return signInAnonymously(authInstance).then(() => {});
}

/** Initiate email/password sign-up and create a user profile (non-blocking). */
export async function initiateEmailSignUp(
  authInstance: Auth,
  firestore: Firestore,
  email: string,
  password: string
): Promise<void> {
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
  await createUserProfile(firestore, userCredential.user);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): Promise<void> {
  return signInWithEmailAndPassword(authInstance, email, password).then(() => {});
}

/** Initiate Google Sign-In and create a user profile if needed (non-blocking). */
export async function initiateGoogleSignIn(authInstance: Auth, firestore: Firestore): Promise<void> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(authInstance, provider);
    // After successful sign-in, ensure a user profile exists.
    await createUserProfile(firestore, result.user);
  } catch (error: any) {
    // Handle specific errors, like user closing the popup
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('Google Sign-In popup closed by user.');
      // We can re-throw or handle this gracefully without showing a scary error.
      return Promise.resolve(); // Resolve silently
    }
    // Re-throw other errors to be caught by the calling function's try-catch block
    throw error;
  }
}
