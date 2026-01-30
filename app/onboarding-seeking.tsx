import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme } from '../src/contexts/ThemeContext';
import { saveOnboardingSeeking } from '../src/services/onboarding';
import { trackOnboardingStepViewed } from '../src/services/posthog';

/**
 * Onboarding Screen 7: What Brings You Here
 * Seventh screen of the onboarding flow - Single-select
 * This answer determines the verse shown on Screen 8 (Interstitial)
 */
const SEEKING_OPTIONS = [
  { text: 'Comfort in hard times', emoji: '🕊️', verseKey: 'comfort' },
  { text: 'Peace for my mind', emoji: '☁️', verseKey: 'peace' },
  { text: 'Hope for the future', emoji: '🌅', verseKey: 'hope' },
  { text: 'Strength to keep going', emoji: '🛡️', verseKey: 'strength' },
  { text: 'Calm in the chaos', emoji: '🌊', verseKey: 'calm' },
  { text: 'Direction and purpose', emoji: '🧭', verseKey: 'direction' },
];

export default function OnboardingSeekingScreen() {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const [selectedSeeking, setSelectedSeeking] = useState<string | null>(null);
  const progressPercentage = 60; // ~60% as specified

  useEffect(() => {
    trackOnboardingStepViewed(7, 'seeking');
  }, []);

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

  const handleContinue = async () => {
    // Store seeking choice if provided (required)
    if (selectedSeeking) {
      const option = SEEKING_OPTIONS.find((opt) => opt.text === selectedSeeking);
      if (option) {
        await saveOnboardingSeeking(option.verseKey);
      }
    }
    // Navigate to Screen 8 (Interstitial with verse)
    router.push('/onboarding-interstitial-2');
  };

  const logoSize = scaleIconSize(80); // ~80px as specified

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, scaleSpacing(20)) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        <Text style={styles.question}>What are you searching for?</Text>
        <Text style={styles.instruction}>Pick what resonates most</Text>

        {/* Seeking Options */}
        <View style={styles.optionsContainer}>
          {SEEKING_OPTIONS.map((option) => {
            const isSelected = selectedSeeking === option.text;
            return (
              <TouchableOpacity
                key={option.text}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                ]}
                onPress={() => setSelectedSeeking(option.text)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.emoji}>{option.emoji}</Text>
                  <Text style={styles.optionText}>{option.text}</Text>
                </View>
                <View style={styles.radioButton}>
                  {isSelected && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              !selectedSeeking && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedSeeking}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.buttonText,
              !selectedSeeking && styles.buttonTextDisabled,
            ]}>
              Continue
            </Text>
          </TouchableOpacity>
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
    marginBottom: scaleSpacing(48), // More spacing bottom
  },
  logo: {
    zIndex: 1,
  },
  question: {
    fontSize: scaleFontSize(24, 20),
    fontFamily: 'Lora_600SemiBold', // Serif, semi-bold
    color: '#2D2D2D', // Dark charcoal
    textAlign: 'center',
    marginBottom: scaleSpacing(8),
  },
  instruction: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#6a2e41', // Burgundy
    textAlign: 'center',
    marginBottom: scaleSpacing(40),
  },
  optionsContainer: {
    width: '100%',
    marginBottom: scaleSpacing(16),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', // White background
    borderWidth: 1,
    borderColor: '#E0D8CF', // Light gray border
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    marginBottom: scaleSpacing(12),
    minHeight: scaleSpacing(56),
  },
  optionSelected: {
    borderColor: '#6a2e41', // Burgundy border when selected
    borderWidth: 2,
    backgroundColor: '#F5EDEF', // Light burgundy tint
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: scaleFontSize(24, 20),
    marginRight: scaleSpacing(12),
  },
  optionText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#2D2D2D',
    flex: 1,
  },
  radioButton: {
    width: scaleSpacing(24),
    height: scaleSpacing(24),
    borderRadius: scaleSpacing(12),
    borderWidth: 2,
    borderColor: '#6a2e41', // Burgundy border
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: scaleSpacing(14),
    height: scaleSpacing(14),
    borderRadius: scaleSpacing(7),
    backgroundColor: '#6a2e41', // Burgundy fill
  },
  spacer: {
    flex: 1,
    minHeight: scaleSpacing(0),
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#F5F0E8', // Cream text
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
  },
  buttonTextDisabled: {
    color: '#9B8E7D', // Muted color when disabled
  },
});

