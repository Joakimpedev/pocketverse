import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import type { PurchasesOffering } from 'react-native-purchases';
import { usePremium } from '../src/contexts/PremiumContext';
import { LoadingSpinner } from '../src/components/LoadingSpinner';
import { showPaymentError, showSuccessAlert, showErrorAlert } from '../src/utils/errorHandler';
import { invalidateCustomerInfoCache, getOfferings, getCachedOffering, setCachedOffering } from '../src/services/purchases';
import { X } from 'react-native-feather';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { trackSeenPaywall as trackPostHogSeenPaywall } from '../src/services/posthog';
import { trackSeenPaywall as trackTikTokSeenPaywall } from '../src/services/tiktok';
import { trackPurchased as trackPostHogPurchased } from '../src/services/posthog';
import { trackPurchased as trackTikTokPurchased } from '../src/services/tiktok';

export default function PaywallScreen() {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { restore, refreshPremiumStatus } = usePremium();

  const fetchOfferings = useCallback(async () => {
    setLoadError(false);
    const cached = await getCachedOffering();
    if (cached) {
      setOffering(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      await invalidateCustomerInfoCache();
      await refreshPremiumStatus();
      await trackPostHogSeenPaywall();
      await trackTikTokSeenPaywall();

      const fresh = await getOfferings();
      if (fresh) {
        setOffering(fresh);
        await setCachedOffering(fresh);
      } else if (!cached) {
        setLoadError(true);
      }
    } catch (error: any) {
      console.error('Error fetching offerings:', error);
      if (!cached) setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [refreshPremiumStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchOfferings();
    }, [fetchOfferings])
  );

  const handleDismiss = useCallback(async () => {
    await refreshPremiumStatus();
    router.back();
  }, [refreshPremiumStatus]);

  const handlePurchaseCompleted = useCallback(
    async ({ customerInfo }: { customerInfo: any }) => {
      const isEntitled = customerInfo?.entitlements?.active?.premium != null;
      if (isEntitled) {
        await trackPostHogPurchased();
        await trackTikTokPurchased();
      }
      await refreshPremiumStatus();
      router.back();
    },
    [refreshPremiumStatus]
  );

  const handleRestoreCompleted = useCallback(
    async ({ customerInfo }: { customerInfo: any }) => {
      const isEntitled = customerInfo?.entitlements?.active?.premium != null;
      if (isEntitled) {
        showSuccessAlert('Your purchases have been restored!', 'Success', () => router.back());
      } else {
        Alert.alert('No Purchases Found', 'We could not find any previous purchases to restore.');
      }
      await refreshPremiumStatus();
      if (isEntitled) router.back();
    },
    [refreshPremiumStatus]
  );

  const handlePurchaseError = useCallback(({ error }: { error: any }) => {
    console.error('Paywall purchase error:', error);
    showPaymentError(error);
  }, []);

  const handleRestore = async () => {
    try {
      const restored = await restore();
      if (restored) {
        showSuccessAlert('Your purchases have been restored!', 'Success', () => router.back());
      } else {
        Alert.alert('No Purchases Found', 'We could not find any previous purchases to restore.');
      }
      await refreshPremiumStatus();
      if (restored) router.back();
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
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore purchases</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loadError || !offering) {
    return (
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X width={closeIconSize} height={closeIconSize} color="#3E3A36" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>
              Unable to load subscription options. This can happen after canceling a plan.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchOfferings}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore purchases</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.paywallWrapper}>
        <RevenueCatUI.Paywall
          style={styles.paywall}
          options={{
            offering,
            displayCloseButton: false,
          }}
          onDismiss={handleDismiss}
          onPurchaseCompleted={handlePurchaseCompleted}
          onPurchaseError={handlePurchaseError}
          onPurchaseCancelled={() => {}}
          onRestoreCompleted={handleRestoreCompleted}
          onRestoreError={({ error }: { error: any }) => showPaymentError(error)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E9',
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
    zIndex: 10,
  },
  paywallWrapper: {
    flex: 1,
  },
  paywall: {
    flex: 1,
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
    marginBottom: scaleSpacing(16),
  },
  retryButton: {
    paddingVertical: scaleSpacing(12),
    paddingHorizontal: scaleSpacing(24),
    backgroundColor: '#5C3A1E',
    borderRadius: scaleSpacing(12),
  },
  retryText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#F5F1E9',
  },
  restoreButton: {
    alignSelf: 'center',
    marginBottom: scaleSpacing(20),
    padding: scaleSpacing(10),
  },
  restoreButtonBottom: {
    alignSelf: 'center',
    marginBottom: scaleSpacing(20),
    padding: scaleSpacing(10),
  },
  restoreText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#5C3A1E',
    textDecorationLine: 'underline',
  },
});
