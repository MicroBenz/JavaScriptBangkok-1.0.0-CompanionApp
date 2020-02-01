import getEnvName from './getEnvName';
import useFetcher from '../hooks/useFetcher';
import {
  FetchResult,
  isFetchingCompleted,
  isFetchingFailed
} from '../../interfaces/Commons';
import { useState, useEffect } from 'react';

export async function getFirebase() {
  return import(/* webpackChunkName: "firebase" */ './firebase');
}

export { getEnvName };

export type FirebaseModule = typeof import('../../commons/firebase/firebase');
export type User = import('firebase').User;
export type FirestoreReference = import('firebase').firestore.DocumentReference;
export type FirestoreSnapshot = import('firebase').firestore.DocumentSnapshot;

export function useFirebase() {
  return useFetcher(getFirebase);
}

export function useFirestoreSnapshot(
  getRef: (firebase: FirebaseModule) => FirestoreReference
): FetchResult<FirestoreSnapshot> {
  const firebaseFetchResult = useFirebase();

  const [snapshot, setSnapshot] = useState<FirestoreSnapshot | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isFetchingCompleted(firebaseFetchResult)) {
      return () => {};
    }
    const firebase = firebaseFetchResult.data;
    return getRef(firebase).onSnapshot(setSnapshot, setError);
  }, [firebaseFetchResult, getRef]);

  if (isFetchingFailed(firebaseFetchResult)) {
    return { status: 'error', error: firebaseFetchResult.error };
  }
  if (!isFetchingCompleted(firebaseFetchResult)) {
    return { status: 'loading' };
  }
  if (error) {
    return { status: 'error', error: error };
  }
  if (!snapshot) {
    return { status: 'loading' };
  }
  return { status: 'completed', data: snapshot };
}
