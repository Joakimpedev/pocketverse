import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme } from '../src/contexts/ThemeContext';
import { saveOnboardingName } from '../src/services/onboarding';
import { trackOnboardingStepViewed } from '../src/services/posthog';

/**
 * Onboarding Screen 2: Name Input
 * Second screen of the onboarding flow
 */
export default function OnboardingNameScreen() {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const [name, setName] = useState('');
  const progressPercentage = 10; // ~10% as specified
  const inputRef = useRef<TextInput>(null);
  const buttonOpacity = useRef(new Animated.Value(0)).current;

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
    trackOnboardingStepViewed(2, 'name');
  }, []);

  // Focus keyboard; keep button invisible until layout has moved above keyboard, then fade in (no layout change, just hide the jump)
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    // Wait for focus + keyboard open + KeyboardAvoidingView reflow, then fade in (tune delay if needed)
    const BUTTON_FADE_DELAY_MS = 600;
    const FADE_IN_DURATION_MS = 200;
    const fadeTimer = setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: FADE_IN_DURATION_MS,
        useNativeDriver: true,
      }).start();
    }, BUTTON_FADE_DELAY_MS);

    return () => {
      clearTimeout(focusTimer);
      clearTimeout(fadeTimer);
    };
  }, [buttonOpacity]);

  const handleContinue = async () => {
    // Store name if provided (optional)
    if (name.trim()) {
      await saveOnboardingName(name.trim());
    }
    // Navigate to Screen 3 (Interstitial)
    router.push('/onboarding-interstitial-1');
  };

  const logoSize = scaleIconSize(80); // ~80px as specified

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={[styles.progressBarContainer, { paddingTop: Math.max(insets.top, scaleSpacing(20)) }]}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={getBookLogo()}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />
        </View>

        {/* Question */}
        <Text style={styles.question}>What's your name?</Text>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#9B8E7D"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus={true}
          />
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Continue Button - hidden until keyboard has opened and layout settled, then fades in */}
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, scaleSpacing(20)) }]}>
          <Animated.View style={{ opacity: buttonOpacity }}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                Continue
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8', // Cream background
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scaleSpacing(24),
  },
  progressBarContainer: {
    paddingBottom: scaleSpacing(20),
  },
  progressBarTrack: {
    height: scaleSpacing(8), // Thicker progress bar
    backgroundColor: '#E5DDD3', // Tan track
    borderRadius: scaleSpacing(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6a2e41', // Dark burgundy
    borderRadius: scaleSpacing(4),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scaleSpacing(40), // More spacing top
    marginBottom: scaleSpacing(40), // More spacing bottom
  },
  logo: {
    zIndex: 1,
  },
  question: {
    fontSize: scaleFontSize(24, 20),
    fontFamily: 'Lora_600SemiBold', // Serif, semi-bold
    color: '#2D2D2D', // Dark charcoal
    textAlign: 'center',
    marginBottom: scaleSpacing(30), // Bigger margin between text and textbox
  },
  inputContainer: {
    marginBottom: scaleSpacing(16),
    paddingTop: scaleSpacing(0), // Additional padding above textbox
  },
  input: {
    backgroundColor: '#FFFFFF', // White background
    borderWidth: 1,
    borderColor: '#E0D8CF', // Light gray border
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#2D2D2D',
    minHeight: scaleSpacing(50),
  },
  spacer: {
    flex: 1,
    minHeight: scaleSpacing(20),
  },
  buttonContainer: {
    width: '100%',
    marginTop: scaleSpacing(16),
  },
  button: {
    backgroundColor: '#6a2e41', // Dark burgundy background
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
    color: '#F5F0E8', // Cream text
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
  },
});

