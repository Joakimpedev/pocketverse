import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Animated, Easing, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { setOnboardingComplete } from '../src/services/onboarding';
import { trackOnboardingStepViewed } from '../src/services/posthog';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Onboarding Screen 1: Hero Welcome
 * First screen of the onboarding flow
 */
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  // Logo animations
  const logoAnimation = useRef(new Animated.Value(-200)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Burgundy background slide up animation
  const burgundySlide = useRef(new Animated.Value(SCREEN_HEIGHT * 0.7)).current;

  // Button fade in (after slide completes)
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    trackOnboardingStepViewed(1, 'start');
  }, []);

  useEffect(() => {
    // Stage 1: Logo drops in from top
    Animated.parallel([
      Animated.spring(logoAnimation, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(logoScale, {
          toValue: 1.1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Stage 2: Burgundy background slides up slowly with ease-out
    setTimeout(() => {
      Animated.timing(burgundySlide, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic), // Slow ease at the end
        useNativeDriver: true,
      }).start();
    }, 300);

    // Stage 3: Button fades in after burgundy settles
    setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1400);
  }, []);

  const handleGetStarted = () => {
    // Navigate to Screen 2 (Name input)
    router.push('/onboarding-name');
  };

  const logoSize = scaleIconSize(130); // 120-150px as specified

  // Calculate bottom section height for positioning
  const bottomSectionTop = SCREEN_HEIGHT * 0.4 + scaleSpacing(120); // After top section + divider

  return (
    <View style={styles.container}>
      {/* Top Section - Cream Background with Logo */}
      <View style={[styles.topSection, { paddingTop: Math.max(insets.top, scaleSpacing(40)) }]}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { translateY: logoAnimation },
                { scale: logoScale },
              ],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={styles.logoGlow} />
          <Image
            source={require('../assets/book_logo/rose.png')}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Animated Burgundy Background Layer (slides up behind static content) */}
      <Animated.View
        style={[
          styles.burgundyBackgroundLayer,
          { transform: [{ translateY: burgundySlide }] }
        ]}
      >
        {/* Circular Divider - SVG Arc */}
        <View style={styles.dividerContainer}>
          <Svg width={SCREEN_WIDTH} height={scaleSpacing(120)} style={styles.dividerSvg}>
            <Path
              d={`M 0 ${scaleSpacing(120)} Q ${SCREEN_WIDTH / 2} ${-scaleSpacing(40)} ${SCREEN_WIDTH} ${scaleSpacing(120)} L ${SCREEN_WIDTH} ${scaleSpacing(120)} L 0 ${scaleSpacing(120)} Z`}
              fill="#6a2e41"
            />
          </Svg>
        </View>
        {/* Burgundy fill below divider */}
        <View style={styles.burgundyFill} />
      </Animated.View>

      {/* Static Content Layer - Text and Award (cream colored, revealed by burgundy) */}
      <View
        style={[
          styles.staticContentLayer,
          {
            top: bottomSectionTop,
            paddingBottom: Math.max(insets.bottom, scaleSpacing(20)),
          }
        ]}
      >
        {/* Text Content - STATIC */}
        <View style={styles.textContent}>
          <Text style={styles.appName}>Pocket Verse</Text>
          <Text style={styles.tagline}>The right verse for right now</Text>
        </View>

        {/* Award/Achievement Badge - STATIC */}
        <View style={styles.awardContainer}>
          <Image
            source={require('../assets/book_logo/left-awards-branch-gray.png')}
            style={styles.awardBranch}
            resizeMode="contain"
          />
          <View style={styles.awardTextContainer}>
            <Text style={styles.awardTextRegular}>Helping more than</Text>
            <Text style={styles.awardTextBold}>5,000+ users</Text>
          </View>
          <Image
            source={require('../assets/book_logo/right-award-banner-branch-gray-77x138.png')}
            style={styles.awardBranch}
            resizeMode="contain"
          />
        </View>

        {/* Button - Fades in after burgundy settles */}
        <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
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
    backgroundColor: '#F5F0E8', // Cream background
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
    backgroundColor: '#6a2e41', // Darker burgundy
    opacity: 0.15,
    shadowColor: '#6a2e41',
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
  burgundyBackgroundLayer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.4, // Starts where top section ends
    left: 0,
    right: 0,
    bottom: 0,
  },
  dividerContainer: {
    height: scaleSpacing(120),
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  dividerSvg: {
    position: 'absolute',
    bottom: 0,
  },
  burgundyFill: {
    flex: 1,
    backgroundColor: '#6a2e41',
  },
  staticContentLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: scaleSpacing(24),
    justifyContent: 'space-between',
  },
  textContent: {
    alignItems: 'center',
    paddingTop: scaleSpacing(30),
  },
  appName: {
    fontSize: scaleFontSize(37, 26),
    fontFamily: 'Lora_600SemiBold', // Serif font
    color: '#F5F0E8', // Cream text on burgundy
    marginBottom: scaleSpacing(12),
    textAlign: 'center',
  },
  tagline: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular', // Sans-serif
    color: 'rgba(245, 240, 232, 0.9)', // Slightly transparent cream
    textAlign: 'center',
  },
  awardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: scaleSpacing(80),
  },
  awardBranch: {
    width: scaleSpacing(60),
    height: scaleSpacing(75),
    tintColor: 'rgba(245, 240, 232, 0.8)', // Apply cream tint to gray images
  },
  awardTextContainer: {
    alignItems: 'center',
    marginHorizontal: scaleSpacing(16),
  },
  awardTextRegular: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(245, 240, 232, 0.85)',
    textAlign: 'center',
  },
  awardTextBold: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(245, 240, 232, 0.95)',
    textAlign: 'center',
    marginTop: scaleSpacing(2),
  },
  buttonContainer: {
    width: '100%',
    marginBottom: scaleSpacing(8),
  },
  button: {
    backgroundColor: '#F5F0E8', // Cream button
    borderRadius: scaleSpacing(12),
    paddingVertical: scaleSpacing(16),
    paddingHorizontal: scaleSpacing(24),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#6a2e41', // Darker burgundy text on cream
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
  },
});

