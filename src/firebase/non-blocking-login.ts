'use client';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, Firestore, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


/** Initiate Google sign-in (non-blocking). */
export async function initiateGoogleSignIn(auth: Auth, firestore: Firestore): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            const newUserProfile: UserProfile = {
                id: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
            };
            await setDoc(userDocRef, newUserProfile);
        }
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
}


/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(auth: Auth, firestore: Firestore, email: string, password: string): Promise<void> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(firestore, 'users', user.uid);

        const newUserProfile: UserProfile = {
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || email.split('@')[0],
        };
        await setDoc(userDocRef, newUserProfile);

    } catch (error) {
        console.error("Email Sign-Up Error:", error);
        throw error;
    }
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}
