import React, { createContext, useContext, useEffect, useState } from 'react';
import { checkPremiumStatus, restorePurchases, initializePurchases } from '../services/purchases';
import { useAuth } from './AuthContext';
import { setPurchasesUserId, logoutPurchases } from '../services/purchases';
import { getDevModePremium } from '../services/devmode';
import { initializeNotifications } from '../services/notifications';
import { trackPurchased as trackPostHogPurchased } from '../services/posthog';
import { trackPurchased as trackTikTokPurchased } from '../services/tiktok';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  checkPremium: () => Promise<void>;
  restore: () => Promise<boolean>;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  isLoading: true,
  checkPremium: async () => {},
  restore: async () => false,
  refreshPremiumStatus: async () => {},
});

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

interface PremiumProviderProps {
  children: React.ReactNode;
}

export const PremiumProvider: React.FC<PremiumProviderProps> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const prevPremiumRef = React.useRef(false);

  // Refresh premium status
  const refreshPremiumStatus = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Check devmode override first (only if user is logged in)
      if (user) {
        const devmodePremium = await getDevModePremium(user.uid);
        if (devmodePremium) {
          setIsPremium(true);
          // Initialize notifications (will cancel for premium users)
          await initializeNotifications(true);
          setIsLoading(false);
          return;
        }
      }
      // If no devmode override, check RevenueCat
      const premium = await checkPremiumStatus();
      const wasPremium = prevPremiumRef.current;
      setIsPremium(premium);
      
      // Track purchase event if premium status changed from false to true
      if (!wasPremium && premium) {
        await trackPostHogPurchased();
        await trackTikTokPurchased();
      }
      
      prevPremiumRef.current = premium;
      // Initialize notifications based on premium status
      await initializeNotifications(premium);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
      // Initialize notifications for free users
      await initializeNotifications(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize RevenueCat on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializePurchases();
        // Check premium status after initialization
        await refreshPremiumStatus();
      } catch (error) {
        // RevenueCat initialization failed (e.g., in Expo Go)
        // Premium status will remain false
        console.error('Failed to initialize RevenueCat:', error);
      }
    };

    init();
  }, []);

  // Set RevenueCat user ID when auth user changes
  useEffect(() => {
    const setUserId = async () => {
      if (user) {
        try {
          await setPurchasesUserId(user.uid);
          // Refresh premium status after setting user ID
          await refreshPremiumStatus();
        } catch (error) {
          console.error('Error setting RevenueCat user ID:', error);
        }
      } else {
        // Log out from RevenueCat if user logs out
        try {
          await logoutPurchases();
          setIsPremium(false);
          // Initialize notifications for free users (user logged out)
          await initializeNotifications(false);
        } catch (error) {
          console.error('Error logging out from RevenueCat:', error);
        }
      }
    };

    setUserId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Check premium status (public method)
  const checkPremium = async (): Promise<void> => {
    await refreshPremiumStatus();
  };

  // Restore purchases
  const restore = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      await restorePurchases();
      // Refresh premium status after restore and return the updated status
      await refreshPremiumStatus();
      // Check premium status again to return the current value
      const premium = await checkPremiumStatus();
      return premium;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        checkPremium,
        restore,
        refreshPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

