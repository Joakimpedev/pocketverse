import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';

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
        if (!user) {
          // No user - go to sign in (which has onboarding cards)
          router.replace('/signin');
        } else {
          // User is signed in - go to main app
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking navigation:', error);
        if (!user) {
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
