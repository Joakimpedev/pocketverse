import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme } from '../src/contexts/ThemeContext';
import { X, Lock, Bell, Star } from 'react-native-feather';
import Svg, { Path } from 'react-native-svg';
import { getOfferings } from '../src/services/purchases';
import { purchasePackage } from '../src/services/purchases';
import { usePremium } from '../src/contexts/PremiumContext';
import { setOnboardingComplete } from '../src/services/onboarding';
import { trackOnboardingPaywallViewed, trackOnboardingPaywallDismissed, trackPurchased, trackOnboardingCompleted } from '../src/services/posthog';
import { trackPurchased as trackTikTokPurchased } from '../src/services/tiktok';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Onboarding Screen 15: Paywall - How It Works
 * Final paywall screen in onboarding flow
 */
export default function OnboardingPaywall3Screen() {
  const insets = useSafeAreaInsets();
  const { currentTheme, colors } = useTheme();
  const { refreshPremiumStatus } = usePremium();
  const [buttonText, setButtonText] = useState('Try for free');
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [priceInfo, setPriceInfo] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    trackOnboardingPaywallViewed(3);
  }, []);

  const handleDismiss = async () => {
    await trackOnboardingPaywallDismissed(3);
    await trackOnboardingCompleted();
    // Mark onboarding as complete and navigate to free experience
    await setOnboardingComplete();
    router.push('/(tabs)');
  };

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      const offering = await getOfferings();
      if (offering && offering.availablePackages.length > 0) {
        // Find yearly/annual package
        const packageToPurchase = 
          offering.availablePackages.find(
            (pkg) => pkg.identifier.toLowerCase().includes('yearly') ||
                     pkg.identifier.toLowerCase().includes('annual')
          ) || offering.availablePackages[0];

        if (packageToPurchase) {
          await purchasePackage(packageToPurchase);
          await trackPurchased(packageToPurchase.identifier, packageToPurchase.product?.price, true);
          await trackTikTokPurchased();
          await trackOnboardingCompleted();
          await refreshPremiumStatus();
          await setOnboardingComplete();
          // Navigate to main app
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (!error.message?.includes('cancelled') && !error.message?.includes('Cancelled')) {
        // Show error but don't block navigation
        // User can try again later
      }
      // Still mark onboarding complete and navigate
      await trackOnboardingCompleted();
      await setOnboardingComplete();
      router.push('/(tabs)');
    } finally {
      setPurchasing(false);
    }
  };

  // Fetch price from RevenueCat
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const offering = await getOfferings();
        console.log('RevenueCat offering:', offering);
        
        if (offering && offering.availablePackages.length > 0) {
          // Find yearly/annual package
          const packageToShow = 
            offering.availablePackages.find(
              (pkg) => pkg.identifier.toLowerCase().includes('yearly') ||
                       pkg.identifier.toLowerCase().includes('annual')
            ) || offering.availablePackages[0];

          console.log('Package to show:', packageToShow?.identifier, packageToShow?.product);

          if (packageToShow?.product) {
            const currencyCode = packageToShow.product.currencyCode;
            const price = packageToShow.product.price;
            const priceString = packageToShow.product.priceString;
            
            console.log('Price data:', { currencyCode, price, priceString });

            setButtonText(`Try for free`);
            
            // Set price info for display below button
            // Format: "NOK 25,83/month, billed yearly as 310,00 kr/year"
            // We'll use the actual price string from RevenueCat
            if (priceString && price) {
              // Extract yearly price and calculate monthly equivalent
              const yearlyPrice = price;
              const monthlyPrice = yearlyPrice / 12;
              
              // Use device locale for proper currency formatting
              // This will format according to user's device settings
              const monthlyFormatted = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(monthlyPrice);
              
              // Extract just the numeric part from priceString to match format
              // RevenueCat priceString is already properly formatted for locale
              const formattedPriceInfo = `${monthlyFormatted}/month, billed yearly as ${priceString}/year`;
              console.log('Setting price info:', formattedPriceInfo);
              setPriceInfo(formattedPriceInfo);
            } else {
              console.warn('Missing priceString or price:', { priceString, price });
            }
          } else {
            console.warn('Package product not available');
          }
        } else {
          console.warn('No offerings or packages available. This is normal in Expo Go.');
          // Set a fallback message for development/Expo Go
          setPriceInfo('Price will be shown when available');
        }
      } catch (error) {
        console.error('Error fetching price:', error);
        setButtonText('Try for free');
        // Set fallback for error case
        setPriceInfo('Price will be shown when available');
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPrice();
  }, []);

  const closeIconSize = scaleIconSize(24);
  const stepIconSize = scaleIconSize(24);

  return (
    <View style={styles.container}>
      {/* X Button (Top Right) - Absolute positioned */}
      <View style={[styles.closeButtonContainer, { paddingTop: Math.max(insets.top, scaleSpacing(20)) }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          activeOpacity={0.7}
        >
          <X width={closeIconSize} height={closeIconSize} color="#F5F0E8" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section - Theme Color Background */}
        <View style={[styles.topSection, { backgroundColor: colors.primary }]}>
          {/* Empty space for visual balance */}
        </View>

        {/* Circular Divider - SVG Arc */}
        <View style={[styles.dividerContainer, { backgroundColor: colors.primary }]}>
          <Svg width={SCREEN_WIDTH} height={scaleSpacing(120)} style={styles.dividerSvg}>
            <Path
              d={`M 0 ${scaleSpacing(120)} Q ${SCREEN_WIDTH / 2} ${-scaleSpacing(40)} ${SCREEN_WIDTH} ${scaleSpacing(120)} L ${SCREEN_WIDTH} ${scaleSpacing(120)} L 0 ${scaleSpacing(120)} Z`}
              fill="#F5F0E8"
            />
          </Svg>
        </View>

        {/* Bottom Section - Cream Background with Content */}
        <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, scaleSpacing(20)) }]}>
          {/* Title */}
          <Text style={styles.title}>How your free trial works</Text>
          <Text style={styles.subtitle}>Nothing will be charged today</Text>

          {/* Timeline Steps */}
          <View style={styles.timelineContainer}>
            {/* Continuous connector line behind all icons */}
            <View style={[styles.continuousLine, { backgroundColor: colors.primary }]} />
            
            {/* Step 1 */}
            <View style={styles.stepContainer}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
                <Lock width={stepIconSize} height={stepIconSize} color="#F5F0E8" strokeWidth={2.5} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Today - Begin your journey</Text>
                <Text style={styles.stepDescription}>3 days of full access, completely free</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.stepContainer}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
                <Bell width={stepIconSize} height={stepIconSize} color="#F5F0E8" strokeWidth={2.5} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Day 2 - Trial reminder</Text>
                <Text style={styles.stepDescription}>Your trial ends soon, we'll remind you with a notification</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.stepContainer}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
                <Star width={stepIconSize} height={stepIconSize} color="#F5F0E8" strokeWidth={2.5} fill="#F5F0E8" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Day 3 - Stay blessed</Text>
                <Text style={styles.stepDescription}>Continue with full access or cancel anytime</Text>
              </View>
            </View>
          </View>

          {/* CTA Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { shadowColor: colors.primary, borderColor: colors.primary }]}
              onPress={handlePurchase}
              activeOpacity={0.8}
              disabled={purchasing || loadingPrice}
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>
                {purchasing ? 'Processing...' : (loadingPrice ? 'Loading...' : buttonText)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price Disclosure */}
          <Text style={styles.priceInfo}>
            {priceInfo || (loadingPrice ? 'Loading price...' : 'Price will be shown when available')}
          </Text>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
              <Text style={styles.footerLink}>Restore Purchases</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}> • </Text>
            <TouchableOpacity onPress={() => router.push('/terms')}>
              <Text style={styles.footerLink}>Terms</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}> • </Text>
            <TouchableOpacity onPress={() => router.push('/privacy')}>
              <Text style={styles.footerLink}>Privacy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8', // Cream background
  },
  scrollContent: {
    flexGrow: 1,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    paddingRight: scaleSpacing(20),
  },
  closeButton: {
    padding: scaleSpacing(8),
  },
  topSection: {
    height: scaleSpacing(100), // Smaller top section for this screen
  },
  dividerContainer: {
    height: scaleSpacing(120),
    overflow: 'hidden',
  },
  dividerSvg: {
    position: 'absolute',
    bottom: 0,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#F5F0E8', // Cream background
    paddingHorizontal: scaleSpacing(24),
    paddingTop: scaleSpacing(30),
  },
  title: {
    fontSize: scaleFontSize(28, 24),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    textAlign: 'center',
    marginBottom: scaleSpacing(8),
  },
  subtitle: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: scaleSpacing(40),
  },
  timelineContainer: {
    marginBottom: scaleSpacing(40),
    position: 'relative',
  },
  continuousLine: {
    position: 'absolute',
    width: 10,
    left: scaleSpacing(19), // Align with icon center (48/2 - 3/2 = 22.5)
    top: scaleSpacing(40), // Start from center of first icon (icon is 48px, so center is at 24px)
    height: scaleSpacing(146), // Height to span from first icon center to last icon center (2 * 24 spacing + 48 icon = 96)
    opacity: 0.3, // Lighter color
    zIndex: 0, // Behind the icons
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: scaleSpacing(24),
    position: 'relative',
    zIndex: 1, // Above the line
  },
  stepIcon: {
    width: scaleSpacing(48),
    height: scaleSpacing(48),
    borderRadius: scaleSpacing(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleSpacing(16),
    position: 'relative',
    zIndex: 2, // Above the line
  },
  stepContent: {
    flex: 1,
    paddingTop: scaleSpacing(4),
  },
  stepTitle: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    marginBottom: scaleSpacing(4),
  },
  stepDescription: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    lineHeight: scaleFontSize(22, 18),
  },
  buttonContainer: {
    width: '100%',
    marginBottom: scaleSpacing(12),
  },
  button: {
    backgroundColor: '#F5F0E8', // Cream background
    borderRadius: scaleSpacing(12),
    paddingVertical: scaleSpacing(16),
    paddingHorizontal: scaleSpacing(24),
    alignItems: 'center',
    borderWidth: 0.4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonText: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_600SemiBold',
  },
  priceInfo: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: scaleSpacing(24),
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerLink: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    textDecorationLine: 'underline',
  },
  footerSeparator: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    marginHorizontal: scaleSpacing(8),
  },
});

