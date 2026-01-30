import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme } from '../src/contexts/ThemeContext';
import Svg, { Path } from 'react-native-svg';
import { trackOnboardingPaywallViewed } from '../src/services/posthog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Onboarding Screen 14: Paywall - Reminder
 * Second paywall screen in onboarding flow
 */
export default function OnboardingPaywall2Screen() {
  const insets = useSafeAreaInsets();
  const { currentTheme, colors } = useTheme();

  React.useEffect(() => {
    trackOnboardingPaywallViewed(2);
  }, []);

  const handleContinue = () => {
    // Navigate to next paywall screen (Screen 15)
    router.push('/onboarding-paywall-3');
  };

  const bellIconSize = scaleIconSize(100);

  return (
    <View style={styles.container}>
      {/* Top Section - Theme Color Background with Bell Icon */}
      <View style={[styles.topSection, { backgroundColor: colors.primary, paddingTop: Math.max(insets.top + scaleSpacing(40), scaleSpacing(60)) }]}>
        <View style={styles.iconContainer}>
          <View style={styles.iconGlow} />
          <Text style={[styles.bellEmoji, { fontSize: bellIconSize }]}>🔔</Text>
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
        {/* Main Text */}
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>We'll send you a reminder</Text>
          <View style={styles.highlightContainer}>
            <Text style={[styles.highlightText, { color: colors.primary }]}>1 day</Text>
            <Text style={styles.regularText}> before your trial ends</Text>
          </View>
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
            <Text style={[styles.buttonText, { color: colors.primary }]}>Continue for FREE</Text>
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
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: scaleIconSize(160),
    height: scaleIconSize(160),
    borderRadius: scaleIconSize(80),
    backgroundColor: 'rgba(245, 240, 232, 1)', // Cream color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  bellEmoji: {
    zIndex: 1,
    position: 'relative',
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
  textContainer: {
    alignItems: 'center',
    paddingTop: scaleSpacing(30),
    paddingHorizontal: scaleSpacing(20),
  },
  mainText: {
    fontSize: scaleFontSize(22, 20),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
    textAlign: 'center',
    marginBottom: scaleSpacing(16),
  },
  highlightContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    fontSize: scaleFontSize(28, 24),
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
  regularText: {
    fontSize: scaleFontSize(22, 20),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
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
});

