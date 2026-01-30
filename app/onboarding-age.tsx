import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme } from '../src/contexts/ThemeContext';
import { saveOnboardingAge, setOnboardingComplete } from '../src/services/onboarding';
import { trackOnboardingStepViewed } from '../src/services/posthog';

/**
 * Onboarding Screen 4: Age Input
 * Fourth screen of the onboarding flow
 */
const AGE_OPTIONS = [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55+',
];

export default function OnboardingAgeScreen() {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const progressPercentage = 30; // ~30% as we're further along

  useEffect(() => {
    trackOnboardingStepViewed(4, 'age');
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
    // Store age if provided (optional)
    if (selectedAge) {
      await saveOnboardingAge(selectedAge);
    }
    // Navigate to Screen 5 (Bible Familiarity)
    router.push('/onboarding-bible-familiarity');
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
        <Text style={styles.question}>How old are you?</Text>

        {/* Age Range Options */}
        <View style={styles.optionsContainer}>
          {AGE_OPTIONS.map((ageRange) => (
            <TouchableOpacity
              key={ageRange}
              style={[
                styles.option,
                selectedAge === ageRange && styles.optionSelected,
              ]}
              onPress={() => setSelectedAge(ageRange)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>{ageRange}</Text>
              <View style={styles.radioButton}>
                {selectedAge === ageRange && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
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
    marginBottom: scaleSpacing(40), // Bigger margin between text and options
  },
  optionsContainer: {
    width: '100%',
    marginBottom: scaleSpacing(16),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E5DDD3', // Dark gray/tan background
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    marginBottom: scaleSpacing(12),
    minHeight: scaleSpacing(56),
  },
  optionSelected: {
    backgroundColor: '#D4C9BC', // Slightly darker when selected
  },
  optionText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#2D2D2D', // White text
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
