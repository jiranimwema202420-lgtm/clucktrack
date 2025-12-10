'use client';

import React, { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';
import { X } from 'lucide-react';

const isDevelopment = process.env.NODE_ENV === 'development';

export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (e: FirestorePermissionError) => {
      console.error('Firestore Permission Error Caught:', e.toString());
      setError(e);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  if (!isDevelopment || !error) {
    return null;
  }

  const denyReason =
    error.rulesDenyReason ||
    'Your request was denied by Firestore Security Rules.';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: '1.6',
      }}
    >
      <div
        style={{
          backgroundColor: '#1E1E1E',
          border: '1px solid #FF5252',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '80%',
          maxHeight: '90%',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setError(null)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <h1 style={{ color: '#FF5252', fontSize: '1.5rem', marginBottom: '1rem' }}>
          Firestore Security Rule Error
        </h1>
        <p style={{ color: '#FFCDD2', marginBottom: '1.5rem' }}>{denyReason}</p>

        <div style={{ background: '#2D2D2D', padding: '1rem', borderRadius: '4px' }}>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {error.toString()}
          </pre>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h2 style={{ color: '#82B1FF', marginBottom: '0.5rem' }}>
            How to fix this:
          </h2>
          <ol style={{ paddingLeft: '1.5rem', margin: 0, listStyle: 'decimal' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              Check your Firestore rules in{' '}
              <code style={{ background: '#333', padding: '2px 4px', borderRadius: '3px' }}>
                firestore.rules
              </code>
              .
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Ensure the rule for path{' '}
              <code style={{ background: '#333', padding: '2px 4px', borderRadius: '3px' }}>
                {error.context.path}
              </code>{' '}
              allows the <strong>{error.context.operation}</strong> operation.
            </li>
            <li>
              Verify that the authenticated user (if any) meets the rule's conditions.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
