import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import { usePremium } from '../src/contexts/PremiumContext';
import { LoadingSpinner } from '../src/components/LoadingSpinner';
import { showPaymentError, showSuccessAlert, showErrorAlert } from '../src/utils/errorHandler';
import { X } from 'react-native-feather';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { trackSeenPaywall as trackPostHogSeenPaywall } from '../src/services/posthog';
import { trackSeenPaywall as trackTikTokSeenPaywall } from '../src/services/tiktok';

export default function PaywallScreen() {
  const [loading, setLoading] = useState(true);
  const { restore, refreshPremiumStatus } = usePremium();

  useEffect(() => {
    presentPaywall();
  }, []);

  const presentPaywall = async () => {
    setLoading(true);
    try {
      // Track that user has seen the paywall
      await trackPostHogSeenPaywall();
      await trackTikTokSeenPaywall();
      
      // Present RevenueCat paywall
      // The paywall configuration is done in the RevenueCat dashboard
      // Make sure you have created a paywall and assigned it to your offering
      await RevenueCatUI.presentPaywall();
      
      // After paywall is dismissed, refresh premium status to check if purchase was made
      // RevenueCat handles the purchase automatically
      await refreshPremiumStatus();
      
      // Navigate back after paywall is dismissed
      router.back();
    } catch (error: any) {
      console.error('Error presenting paywall:', error);
      
      // Handle specific error cases
      if (error.code === 'PAYWALL_NOT_CONFIGURED' || error.message?.includes('paywall')) {
        showErrorAlert(error, {
          title: 'Paywall Not Configured',
          defaultMessage: 'The paywall is not configured yet. Please set up a paywall in your RevenueCat dashboard and assign it to your offering.',
        });
      } else if (!error.userCancelled && !error.code?.includes('CANCELLED')) {
        // Only show error if user didn't cancel
        showPaymentError(error);
      }
      
      // Navigate back on error (user can try again later)
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      const restored = await restore();
      if (restored) {
        showSuccessAlert('Your purchases have been restored!', 'Success', () => router.back());
      } else {
        Alert.alert('No Purchases Found', 'We could not find any previous purchases to restore.');
      }
    } catch (error: any) {
      showPaymentError(error);
    }
  };

  const closeIconSize = scaleIconSize(24);
  
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X width={closeIconSize} height={closeIconSize} color="#3E3A36" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.loadingContainer}>
            <LoadingSpinner message="Loading subscription options..." />
          </View>
          {/* Restore purchases link - still accessible during loading */}
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore purchases</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // This should not be reached as we navigate back after paywall,
  // but included as fallback
  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X width={closeIconSize} height={closeIconSize} color="#3E3A36" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Unable to load paywall. Please try again later.</Text>
        </View>
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E9', // Warm parchment background
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: scaleSpacing(20),
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: scaleSpacing(20),
    padding: scaleSpacing(10),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
    textAlign: 'center',
    paddingHorizontal: scaleSpacing(20),
  },
  restoreButton: {
    alignSelf: 'center',
    marginBottom: scaleSpacing(20),
    padding: scaleSpacing(10),
  },
  restoreText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#5C3A1E', // Darker burnt umber (links, secondary text)
    textDecorationLine: 'underline',
  },
});
