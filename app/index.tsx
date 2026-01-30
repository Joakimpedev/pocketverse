import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { isOnboardingComplete } from '../src/services/onboarding';

/**
 * Root index route - handles onboarding and authentication flow
 */
export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkAndNavigate = async () => {
      if (authLoading) {
        return; // Wait for auth to finish loading
      }

      try {
        // Check onboarding status first
        const onboardingComplete = await isOnboardingComplete();
        
        if (!onboardingComplete) {
          // Onboarding not complete - go to onboarding flow
          router.replace('/onboarding');
          setIsCheckingOnboarding(false);
          return;
        }

        if (!user) {
          // No user - go to sign in (which has onboarding cards)
          router.replace('/signin');
        } else {
          // User is signed in - go to main app
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking navigation:', error);
        // On error, check onboarding first
        const onboardingComplete = await isOnboardingComplete().catch(() => false);
        if (!onboardingComplete) {
          router.replace('/onboarding');
        } else if (!user) {
          router.replace('/signin');
        } else {
          router.replace('/(tabs)');
        }
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkAndNavigate();
  }, [user, authLoading]);

  // Show loading while checking
  if (authLoading || isCheckingOnboarding) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8F6240" />
      </View>
    );
  }

  return <View />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F1E9',
  },
});
