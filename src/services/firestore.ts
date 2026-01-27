import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';

// User document type
export interface UserData {
  createdAt: Timestamp;
  isPremium: boolean;
}

// Saved verse document type
export interface SavedVerse {
  id: string;
  verseReference: string;
  verseText: string;
  explanation: string;
  originalInput?: string; // The user's original input that generated this verse
  savedAt: Timestamp;
}

// Feedback document type
export interface FeedbackData {
  id?: string;
  userId: string;
  feedback: string;
  email?: string;
  submittedAt: Timestamp;
}

/**
 * Creates a user document if it doesn't exist
 * @param uid - User ID from Firebase Auth
 */
export const createUserDocument = async (uid: string): Promise<void> => {
  const userRef = doc(firestore, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      createdAt: Timestamp.now(),
      isPremium: false,
    });
  }
};

/**
 * Gets user data from Firestore
 * @param uid - User ID from Firebase Auth
 * @returns User document data or null if not found
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  const userRef = doc(firestore, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  }
  return null;
};

/**
 * Saves a verse to the user's savedVerses collection
 * @param uid - User ID from Firebase Auth
 * @param verseData - Verse data to save
 * @returns The ID of the newly created document
 */
export const saveVerse = async (
  uid: string,
  verseData: {
    verseReference: string;
    verseText: string;
    explanation: string;
    originalInput?: string;
  }
): Promise<string> => {
  // Ensure user document exists first
  await createUserDocument(uid);

  const savedVersesRef = collection(firestore, 'users', uid, 'savedVerses');
  const docData: any = {
    verseReference: verseData.verseReference,
    verseText: verseData.verseText,
    explanation: verseData.explanation,
    savedAt: Timestamp.now(),
  };
  
  // Include originalInput if provided
  if (verseData.originalInput) {
    docData.originalInput = verseData.originalInput;
  }

  const docRef = await addDoc(savedVersesRef, docData);

  return docRef.id;
};

/**
 * Gets all saved verses for a user, ordered by most recent first
 * @param uid - User ID from Firebase Auth
 * @returns Array of saved verses
 */
export const getSavedVerses = async (uid: string): Promise<SavedVerse[]> => {
  const savedVersesRef = collection(firestore, 'users', uid, 'savedVerses');
  const q = query(savedVersesRef, orderBy('savedAt', 'desc'));

  const querySnapshot = await getDocs(q);
  const verses: SavedVerse[] = [];

  querySnapshot.forEach((docSnapshot) => {
    const verseData = docSnapshot.data();
    verses.push({
      id: docSnapshot.id,
      verseReference: verseData.verseReference,
      verseText: verseData.verseText,
      explanation: verseData.explanation,
      originalInput: verseData.originalInput || '',
      savedAt: verseData.savedAt,
    });
  });

  return verses;
};

/**
 * Deletes a saved verse
 * @param uid - User ID from Firebase Auth
 * @param verseId - ID of the verse document to delete
 */
export const deleteVerse = async (uid: string, verseId: string): Promise<void> => {
  const verseRef = doc(firestore, 'users', uid, 'savedVerses', verseId);
  await deleteDoc(verseRef);
};

/**
 * Submits user feedback to Firestore
 * @param uid - User ID from Firebase Auth
 * @param feedbackText - The feedback content
 * @param email - Optional email for follow-up
 * @returns The ID of the newly created feedback document
 */
export const submitFeedback = async (
  uid: string,
  feedbackText: string,
  email?: string
): Promise<string> => {
  const feedbackRef = collection(firestore, 'feedback');
  
  const feedbackData: Omit<FeedbackData, 'id'> = {
    userId: uid,
    feedback: feedbackText,
    submittedAt: Timestamp.now(),
  };

  // Only include email if provided
  if (email && email.trim()) {
    feedbackData.email = email.trim();
  }

  const docRef = await addDoc(feedbackRef, feedbackData);
  return docRef.id;
};

/**
 * Deletes all user data from Firestore
 * @param uid - User ID from Firebase Auth
 */
export const deleteUserData = async (uid: string): Promise<void> => {
  // Delete all saved verses
  const savedVersesRef = collection(firestore, 'users', uid, 'savedVerses');
  const versesSnapshot = await getDocs(savedVersesRef);
  
  const deletePromises = versesSnapshot.docs.map((docSnapshot) => 
    deleteDoc(docSnapshot.ref)
  );
  
  await Promise.all(deletePromises);
  
  // Delete user document
  const userRef = doc(firestore, 'users', uid);
  await deleteDoc(userRef);
};

