'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect, useRef } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth, User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * Production-hardened FirebaseProvider
 * - Ensures the `user` value is the actual Firebase Auth User
 * - Provides lightweight auth helpers (signOut)
 * - Moves FirebaseErrorListener before children so it can catch render-time errors
 * - Makes `useMemoFirebase` non-mutating and documented for Firestore refs
 * - Provides clear runtime errors when services are misconfigured
 */

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  // Auth state
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  // Helpers
  signOut: (() => Promise<void>) | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  signOut: () => Promise<void>;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children, firebaseApp, firestore, auth }) => {
  // Track auth state coming directly from the provided `auth` instance
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  // Keep a ref to the current auth instance to avoid re-subscribing if identical
  const prevAuthRef = useRef<Auth | null>(null);

  useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error('Auth service not provided') });
      prevAuthRef.current = null;
      return;
    }

    // Avoid re-subscribing when the same auth instance is passed
    if (prevAuthRef.current === auth) return;
    prevAuthRef.current = auth;

    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Always set the canonical firebase auth user here
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error('FirebaseProvider: onAuthStateChanged error:', error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error as Error });
      }
    );

    return () => {
      try {
        unsubscribe();
      } catch (e) {
        // Defensive: guard against unsubscribe errors
        console.warn('Failed to unsubscribe onAuthStateChanged:', e);
      }
    };
  }, [auth]);

  // Helper: sign out if auth is present
  const signOut = useMemo(() => {
    if (!auth) return null;
    return async () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      return auth.signOut();
    };
  }, [auth]);

  // More robust check for services availability
  const servicesAvailable = useMemo(() => {
    return !!(firebaseApp && firestore && auth);
  }, [firebaseApp, firestore, auth]);

  const contextValue = useMemo<FirebaseContextState>(() => ({
    areServicesAvailable: servicesAvailable,
    firebaseApp: servicesAvailable ? firebaseApp : null,
    firestore: servicesAvailable ? firestore : null,
    auth: servicesAvailable ? auth : null,
    user: userAuthState.user,
    isUserLoading: userAuthState.isUserLoading,
    userError: userAuthState.userError,
    signOut,
  }), [servicesAvailable, firebaseApp, firestore, auth, userAuthState, signOut]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {/* Place the error listener first so it can catch issues during child render */}
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Main hook for consuming Firebase services and the canonical Firebase Auth user.
 * Throws clear errors if used outside the provider or if services are missing.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services are not available. Ensure FirebaseProvider received valid firebaseApp, firestore and auth instances.');
  }

  if (!context.signOut) {
    // Should not happen when services are available, but keep the contract strict
    throw new Error('Internal invariant: signOut helper missing on Firebase context.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    signOut: context.signOut,
  };
};

/** Convenience hooks */
export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useSignOut = () => useFirebase().signOut;

export const useAuthUser = () => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};

type MemoizedObject = {
  __memo?: boolean;
}

/**
 * Lightweight memo helper intended for Firestore references (Query/DocRef).
 * This wrapper returns a stable reference produced by `useMemo` and adds
 * a `__memo` flag to it for runtime checks in `useCollection` and `useDoc`.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
    const memoized = useMemo(factory, deps);

    if (memoized && typeof memoized === 'object') {
        (memoized as MemoizedObject).__memo = true;
    }

    return memoized;
}
