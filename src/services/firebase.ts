import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../config/firebase.config';

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Initialize auth with AsyncStorage persistence for React Native
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    // If auth is already initialized (can happen in hot reload scenarios), get the existing instance
    // Check error message or code for 'already-initialized' or similar
    if (error.code === 'auth/already-initialized' || error.message?.includes('already-initialized')) {
      auth = getAuth(app);
    } else {
      // For any other error, fall back to getAuth (which uses default persistence)
      // This ensures the app continues to work even if AsyncStorage persistence fails
      console.warn('Could not initialize auth with AsyncStorage persistence, using default:', error);
      auth = getAuth(app);
    }
  }
  firestore = getFirestore(app);

  // Optional: Connect to emulators in development
  // Uncomment these lines if using Firebase emulators
  // if (__DEV__) {
  //   connectAuthEmulator(auth, 'http://localhost:9099');
  //   connectFirestoreEmulator(firestore, 'localhost', 8080);
  // }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
}

export { app, auth, firestore };



