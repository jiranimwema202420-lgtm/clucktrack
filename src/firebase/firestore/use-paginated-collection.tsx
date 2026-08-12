'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CollectionReference,
  DocumentData,
  DocumentSnapshot,
  FirestoreError,
  Query,
  getDocs,
  limit,
  onSnapshot,
  query,
  startAfter,
} from 'firebase/firestore';

import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type PaginatedWithId<T> = T & {
  id: string;
};

export interface UsePaginatedCollectionResult<T> {
  data: PaginatedWithId<T>[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  error: FirestoreError | Error | null;
}

export function usePaginatedCollection<T = DocumentData>(
  targetRefOrQuery:
    | CollectionReference<DocumentData>
    | Query<DocumentData>
    | null
    | undefined,
  pageSize = 50,
): UsePaginatedCollectionResult<T> {
  const [data, setData] = useState<PaginatedWithId<T>[]>([]);
  const [lastDocument, setLastDocument] =
    useState<DocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const initialQuery = useMemo(() => {
    if (!targetRefOrQuery) {
      return null;
    }

    return query(targetRefOrQuery, limit(pageSize));
  }, [targetRefOrQuery, pageSize]);

  useEffect(() => {
    if (!initialQuery) {
      setData([]);
      setLastDocument(null);
      setHasMore(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      initialQuery,
      (snapshot) => {
        const results = snapshot.docs.map((document) => ({
          ...(document.data() as T),
          id: document.id,
        }));

        setData(results);

        setLastDocument(
          snapshot.docs[snapshot.docs.length - 1] ?? null,
        );

        setHasMore(snapshot.docs.length === pageSize);
        setIsLoading(false);
      },
      (serverError: FirestoreError) => {
        const permissionError = new FirestorePermissionError(
          {
            path: 'firestore-query',
            operation: 'list',
          },
          serverError,
        );

        errorEmitter.emit(
          'permission-error',
          permissionError,
        );

        setError(permissionError);
        setData([]);
        setLastDocument(null);
        setHasMore(false);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [initialQuery, pageSize]);

  const loadMore = useCallback(async () => {
    if (
      !targetRefOrQuery ||
      !lastDocument ||
      !hasMore ||
      isLoading ||
      isLoadingMore
    ) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextQuery = query(
        targetRefOrQuery,
        startAfter(lastDocument),
        limit(pageSize),
      );

      const snapshot = await getDocs(nextQuery);

      const results = snapshot.docs.map((document) => ({
        ...(document.data() as T),
        id: document.id,
      }));

      setData((current) => {
        const existingIds = new Set(
          current.map((item) => item.id),
        );

        const uniqueResults = results.filter(
          (item) => !existingIds.has(item.id),
        );

        return [...current, ...uniqueResults];
      });

      if (snapshot.docs.length > 0) {
        setLastDocument(
          snapshot.docs[snapshot.docs.length - 1],
        );
      }

      setHasMore(snapshot.docs.length === pageSize);
    } catch (serverError) {
      const firestoreError =
        serverError as FirestoreError;

      const permissionError =
        new FirestorePermissionError(
          {
            path: 'firestore-query',
            operation: 'list',
          },
          firestoreError,
        );

      errorEmitter.emit(
        'permission-error',
        permissionError,
      );

      setError(permissionError);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    targetRefOrQuery,
    lastDocument,
    hasMore,
    isLoading,
    isLoadingMore,
    pageSize,
  ]);

  return {
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
  };
}