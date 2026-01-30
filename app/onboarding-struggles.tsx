import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme } from '../src/contexts/ThemeContext';
import { saveOnboardingStruggles } from '../src/services/onboarding';
import { trackOnboardingStepViewed } from '../src/services/posthog';

/**
 * Onboarding Screen 6: Struggles
 * Sixth screen of the onboarding flow - Multi-select
 */
const STRUGGLE_OPTIONS = [
  { text: 'Fear & Worry', emoji: '⛈️' },
  { text: 'Stress from work or school', emoji: '⚡' },
  { text: 'Relationship struggles', emoji: '💔' },
  { text: 'Grief or loss', emoji: '🖤' },
  { text: 'Health concerns', emoji: '🩹' },
  { text: 'Doubt or uncertainty', emoji: '❓' },
  { text: 'Loneliness', emoji: '🌑' },
  { text: 'Feeling overwhelmed', emoji: '🌊' },
  { text: 'Anger or frustration', emoji: '🔥' },
];

export default function OnboardingStrugglesScreen() {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const [selectedStruggles, setSelectedStruggles] = useState<string[]>([]);
  const progressPercentage = 50; // ~50% as specified

  useEffect(() => {
    trackOnboardingStepViewed(6, 'struggles');
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

  const toggleStruggle = (struggle: string) => {
    setSelectedStruggles((prev) =>
      prev.includes(struggle)
        ? prev.filter((s) => s !== struggle)
        : [...prev, struggle]
    );
  };

  const handleContinue = async () => {
    // Store struggles if provided (minimum 1 required)
    if (selectedStruggles.length > 0) {
      await saveOnboardingStruggles(selectedStruggles);
    }
    // Navigate to Screen 7 (What Brings You Here)
    router.push('/onboarding-seeking');
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
        <Text style={styles.question}>What are you carrying right now?</Text>
        <Text style={styles.instruction}>Pick a few that resonate</Text>

        {/* Struggle Options */}
        <View style={styles.optionsContainer}>
          {STRUGGLE_OPTIONS.map((option) => {
            const isSelected = selectedStruggles.includes(option.text);
            return (
              <TouchableOpacity
                key={option.text}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                ]}
                onPress={() => toggleStruggle(option.text)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.emoji}>{option.emoji}</Text>
                  <Text style={styles.optionText} numberOfLines={2}>
                    {option.text}
                  </Text>
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
              selectedStruggles.length === 0 && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={selectedStruggles.length === 0}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.buttonText,
              selectedStruggles.length === 0 && styles.buttonTextDisabled,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: scaleSpacing(16),
  },
  option: {
    width: '31%', // 3 columns with small gaps
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // White background
    borderWidth: 2,
    borderColor: '#E0D8CF', // Light gray border
    borderRadius: scaleSpacing(10),
    padding: scaleSpacing(10),
    marginBottom: scaleSpacing(8),
    minHeight: scaleSpacing(115),
  },
  optionSelected: {
    borderColor: '#6a2e41', // Burgundy border when selected
    backgroundColor: '#F5EDEF', // Light burgundy tint
  },
  optionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: scaleFontSize(24, 20),
    marginBottom: scaleSpacing(6),
  },
  optionText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#2D2D2D',
    textAlign: 'center',
    lineHeight: scaleFontSize(18, 16),
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

