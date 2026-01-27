import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  deleteUser as firebaseDeleteUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { resetIfNewDay } from '../services/usageTracker';
import { createUserDocument, deleteUserData } from '../services/firestore';
import { Platform } from 'react-native';
import { identifyUser as identifyPostHogUser, resetUser as resetPostHogUser, trackSignedIn as trackPostHogSignedIn } from '../services/posthog';
import { identifyUser as identifyTikTokUser, resetUser as resetTikTokUser, trackSignedIn as trackTikTokSignedIn } from '../services/tiktok';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signInWithApple: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
  deleteAccount: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset usage tracker on app open
    resetIfNewDay();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Ensure user document exists in Firestore
        try {
          await createUserDocument(currentUser.uid);
        } catch (error) {
          console.error('Error creating user document:', error);
        }
        setIsLoading(false);
      } else {
        // Don't auto-sign in anonymously anymore - user must sign in explicitly
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign In is only available on iOS');
    }

    // Lazy load Apple Authentication module (only when needed)
    let AppleAuthentication: any;
    try {
      AppleAuthentication = require('expo-apple-authentication');
    } catch (error) {
      throw new Error('Apple Sign In is not available. Please rebuild the app with native code (npx expo prebuild or EAS Build).');
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = credential;
      if (!identityToken) {
        throw new Error('Apple Sign In failed: No identity token');
      }

      // Create OAuth provider and credential
      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({
        idToken: identityToken,
        rawNonce: credential.nonce || undefined,
      });

      // Sign in with Firebase
      const userCredential = await signInWithCredential(auth, firebaseCredential);
      setUser(userCredential.user);
      
      // Create user document in Firestore
      await createUserDocument(userCredential.user.uid);
      
      // Track sign in event and identify user in analytics
      const userProperties = {
        email: userCredential.user.email,
        provider: 'apple',
      };
      
      // PostHog
      await identifyPostHogUser(userCredential.user.uid, userProperties);
      await trackPostHogSignedIn('apple');
      
      // TikTok SDK
      await identifyTikTokUser(userCredential.user.uid, userProperties);
      await trackTikTokSignedIn('apple');
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled, don't throw error
        return;
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string, isSignUp: boolean) => {
    try {
      let userCredential;
      
      if (isSignUp) {
        // Create new account
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Sign in existing account
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      setUser(userCredential.user);
      
      // Ensure user document exists in Firestore (createUserDocument checks if it exists)
      await createUserDocument(userCredential.user.uid);
      
      // Track sign in event and identify user in analytics
      const userProperties = {
        email: userCredential.user.email,
        provider: 'email',
      };
      
      // PostHog
      await identifyPostHogUser(userCredential.user.uid, userProperties);
      await trackPostHogSignedIn('email');
      
      // TikTok SDK
      await identifyTikTokUser(userCredential.user.uid, userProperties);
      await trackTikTokSignedIn('email');
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      // Reset user in analytics
      await resetPostHogUser();
      await resetTikTokUser();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      throw new Error('No user to delete');
    }

    try {
      const uid = user.uid;
      
      // Delete user data from Firestore
      await deleteUserData(uid);
      
      // Delete Firebase Auth account
      await firebaseDeleteUser(user);
      
      setUser(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signInWithApple, 
      signInWithEmail, 
      signOut, 
      deleteAccount 
    }}>
      {children}
    </AuthContext.Provider>
  );
};



