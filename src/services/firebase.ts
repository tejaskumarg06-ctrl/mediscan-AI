import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with settings to handle restrictive network environments (like iframes)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

/**
 * Validates connection to Firestore with a timeout.
 */
async function testConnection() {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Handshake timeout')), 5000)
  );

  try {
    // Attempt to fetch a document from a 'test' collection to verify connection
    // Use getDocFromServer to force a round-trip and bypass local cache
    await Promise.race([
      getDocFromServer(doc(db, 'system', 'connection-test')),
      timeoutPromise
    ]);
    console.log("Firebase connection established successfully.");
  } catch (error: any) {
    if (error?.message === 'Handshake timeout') {
       console.warn("Firestore handshake delayed. Check database status at: https://console.firebase.google.com/project/" + firebaseConfig.projectId);
    } else if (error?.code === 'unavailable') {
      console.error("Firestore is currently unavailable. This may be due to regional network restrictions or database provisioning status.");
    } else {
      // It's okay if the document doesn't exist (404), as long as the service responded
      console.log("Firestore reachability confirmed.");
    }
  }
}

testConnection();

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  const authInfo = auth.currentUser ? {
    userId: auth.currentUser.uid,
    email: auth.currentUser.email || '',
    emailVerified: auth.currentUser.emailVerified,
    isAnonymous: auth.currentUser.isAnonymous,
    providerInfo: auth.currentUser.providerData.map(p => ({
      providerId: p.providerId,
      displayName: p.displayName || '',
      email: p.email || '',
    }))
  } : {
    userId: 'unauthenticated',
    email: '',
    emailVerified: false,
    isAnonymous: true,
    providerInfo: []
  };

  const errorInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo
  };

  throw new Error(JSON.stringify(errorInfo));
}
