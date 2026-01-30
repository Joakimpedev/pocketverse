import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme } from '../src/contexts/ThemeContext';
import Svg, { Path } from 'react-native-svg';
import { getOfferings } from '../src/services/purchases';
import { trackOnboardingPaywallViewed } from '../src/services/posthog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Onboarding Screen 13: Paywall - Trial Offer
 * First paywall screen in onboarding flow
 */
export default function OnboardingPaywall1Screen() {
  const insets = useSafeAreaInsets();
  const { currentTheme, colors } = useTheme();
  const [buttonText, setButtonText] = useState('Try now for free');
  const [loadingPrice, setLoadingPrice] = useState(true);

  // Get the book logo based on current theme
  const getBookLogo = () => {
    switch (currentTheme) {
      case 'classic':
        return require('../assets/book_logo/classic.png');
      case 'forest':
        return require('../assets/book_logo/forest.png');
      case 'night':
        return require('../assets/book_logo/night.png');
      case 'rose':
      default:
        return require('../assets/book_logo/rose.png');
    }
  };

  useEffect(() => {
    trackOnboardingPaywallViewed(1);
  }, []);

  const handleContinue = () => {
    // Navigate to next paywall screen (Screen 14)
    router.push('/onboarding-paywall-2');
  };

  const logoSize = scaleIconSize(130);

  // Fetch price from RevenueCat
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const offering = await getOfferings();
        if (offering && offering.availablePackages.length > 0) {
          // Prioritize yearly/annual package (since that's the one with free trial)
          // Then monthly, then fallback to first available
          const packageToShow = 
            offering.availablePackages.find(
              (pkg) => pkg.identifier.toLowerCase().includes('yearly') ||
                       pkg.identifier.toLowerCase().includes('annual')
            ) ||
            offering.availablePackages.find(
              (pkg) => pkg.identifier.toLowerCase().includes('monthly')
            ) ||
            offering.availablePackages[0];

          if (packageToShow?.product) {
            const currencyCode = packageToShow.product.currencyCode;
            
            // Format as "Try now for [currency]0.00"
            // For free trial, the price is always 0.00
            // RevenueCat will show 0.00 if the subscription has a free trial configured
            const formattedPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currencyCode,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(0);

            setButtonText(`Try now for ${formattedPrice}`);
          }
        }
      } catch (error) {
        console.error('Error fetching price:', error);
        // Keep fallback text "Try now for free" on error
        setButtonText('Try now for free');
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPrice();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Section - Theme Color Background with Logo */}
      <View style={[styles.topSection, { backgroundColor: colors.primary, paddingTop: Math.max(insets.top + scaleSpacing(40), scaleSpacing(60)) }]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoGlow} />
          <Image
            source={getBookLogo()}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />
        </View>
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

      {/* Bottom Section - Cream Background with Text and Button */}
      <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, scaleSpacing(20)) }]}>
        {/* Headline with highlighted "3 days" */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText}>We offer </Text>
          <Text style={[styles.headlineHighlight, { color: colors.primary }]}>3 days</Text>
          <Text style={styles.headlineText}> of premium access, just for you</Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Reassurance - Above button */}
        <View style={styles.reassuranceContainer}>
          <Text style={[styles.reassuranceCheckmark, { color: colors.primary }]}>✓</Text>
          <Text style={styles.reassuranceText}>No Payment Due Now</Text>
        </View>

        {/* CTA Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { shadowColor: colors.primary, borderColor: colors.primary }]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>
              {loadingPrice ? 'Loading...' : buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8', // Cream background
  },
  topSection: {
    flex: 0.4, // 40% of screen
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSpacing(24),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: scaleIconSize(160),
    height: scaleIconSize(160),
    borderRadius: scaleIconSize(80),
    backgroundColor: 'rgba(245, 240, 232, 1)', // Cream color with 60% opacity
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    zIndex: 1,
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
    flex: 0.6, // 60% of screen
    backgroundColor: '#F5F0E8', // Cream background
    paddingHorizontal: scaleSpacing(24),
    justifyContent: 'space-between',
  },
  headlineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: scaleSpacing(30),
    paddingHorizontal: scaleSpacing(20),
  },
  headlineText: {
    fontSize: scaleFontSize(22, 20),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
    textAlign: 'center',
  },
  headlineHighlight: {
    fontSize: scaleFontSize(22, 20),
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
  reassuranceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scaleSpacing(16),
  },
  reassuranceCheckmark: {
    fontSize: scaleFontSize(18, 16),
    fontWeight: 'bold',
    marginRight: scaleSpacing(8),
  },
  reassuranceText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
  },
  spacer: {
    flex: 1,
    minHeight: scaleSpacing(20),
  },
  buttonContainer: {
    width: '100%',
    marginBottom: scaleSpacing(8),
  },
  button: {
    backgroundColor: '#F5F0E8', // Cream background
    borderRadius: scaleSpacing(12),
    paddingVertical: scaleSpacing(16),
    paddingHorizontal: scaleSpacing(24),
    alignItems: 'center',
    borderWidth: 0.4, // Theme color stroke - borderColor is set dynamically in component
    // Shadow properties - shadowColor is set dynamically in component
    shadowOffset: {
      width: 0,
      height: 4, // Increase for more depth (vertical offset)
    },
    shadowOpacity: 0.4, // Increase for more visible shadow (0.0 to 1.0)
    shadowRadius: 4, // Increase for softer, larger shadow blur
    elevation: 6, // Android shadow (increase for more depth)
  },
  buttonText: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Nunito_600SemiBold',
  },
});
