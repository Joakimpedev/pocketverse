import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme } from '../src/contexts/ThemeContext';
import { saveOnboardingBibleFamiliarity, getOnboardingName, setOnboardingComplete } from '../src/services/onboarding';
import { trackOnboardingStepViewed } from '../src/services/posthog';

/**
 * Onboarding Screen 5: Bible Familiarity
 * Fifth screen of the onboarding flow
 */
const BIBLE_FAMILIARITY_OPTIONS = [
  { text: "I'm just starting to explore", emoji: '🌱' },
  { text: "I know some verses", emoji: '📖' },
  { text: "I read it regularly", emoji: '✝️' },
];

export default function OnboardingBibleFamiliarityScreen() {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const [selectedFamiliarity, setSelectedFamiliarity] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const progressPercentage = 40; // ~40% as we're further along

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
    trackOnboardingStepViewed(5, 'bible_familiarity');
  }, []);

  // Load user name on mount
  useEffect(() => {
    const loadUserName = async () => {
      const name = await getOnboardingName();
      setUserName(name);
    };
    loadUserName();
  }, []);

  const handleContinue = async () => {
    // Store familiarity if provided (optional)
    if (selectedFamiliarity) {
      await saveOnboardingBibleFamiliarity(selectedFamiliarity);
    }
    // Navigate to Screen 6 (Struggles)
    router.push('/onboarding-struggles');
  };

  const logoSize = scaleIconSize(80); // ~80px as specified

  // Build question text with or without name
  const questionText = userName 
    ? `How familiar are you with the Bible, ${userName}?`
    : "How familiar are you with the Bible?";

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
        <Text style={styles.question}>{questionText}</Text>

        {/* Bible Familiarity Options */}
        <View style={styles.optionsContainer}>
          {BIBLE_FAMILIARITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.text}
              style={[
                styles.option,
                selectedFamiliarity === option.text && styles.optionSelected,
              ]}
              onPress={() => setSelectedFamiliarity(option.text)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.emoji}>{option.emoji}</Text>
                <Text style={styles.optionText}>{option.text}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedFamiliarity === option.text && <View style={styles.radioButtonSelected} />}
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
    backgroundColor: '#E5DDD3', // Tan background
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    marginBottom: scaleSpacing(12),
    minHeight: scaleSpacing(56),
  },
  optionSelected: {
    backgroundColor: '#D4C9BC', // Slightly darker when selected
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

