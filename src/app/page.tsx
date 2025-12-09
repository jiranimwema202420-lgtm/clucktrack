import { redirect } from 'next/navigation'

export default function Home() {
  // The root layout now handles redirection logic based on auth state.
  // This page can simply redirect to the main dashboard.
  redirect('/dashboard')
}
