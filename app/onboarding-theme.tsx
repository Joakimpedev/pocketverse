import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme, ThemeName } from '../src/contexts/ThemeContext';
import { saveOnboardingTheme } from '../src/services/onboarding';

/**
 * Onboarding Screen 9: Theme Selection
 * Ninth screen of the onboarding flow - Visual selection
 */
const THEME_OPTIONS: { name: ThemeName; label: string; colors: { primary: string; darker: string; lighter: string } }[] = [
  {
    name: 'classic',
    label: 'Classic',
    colors: {
      primary: '#A67C52',
      darker: '#8B5F3F',
      lighter: '#B8906A',
    },
  },
  {
    name: 'forest',
    label: 'Forest',
    colors: {
      primary: '#4A5D4A',
      darker: '#3A4A3A',
      lighter: '#5D7260',
    },
  },
  {
    name: 'night',
    label: 'Night',
    colors: {
      primary: '#4A5568',
      darker: '#3A4455',
      lighter: '#5D6B7F',
    },
  },
  {
    name: 'rose',
    label: 'Rose',
    colors: {
      primary: '#8B4A5E',
      darker: '#6D3A4A',
      lighter: '#A05D72',
    },
  },
];

export default function OnboardingThemeScreen() {
  const insets = useSafeAreaInsets();
  const { setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeName | null>(null);
  const progressPercentage = 70; // ~70% as specified

  // Get the book logo based on selected theme (or default to rose)
  const getBookLogo = (theme: ThemeName) => {
    switch (theme) {
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
    if (selectedTheme) {
      // Save theme selection
      await saveOnboardingTheme(selectedTheme);
      // Set theme in context
      await setTheme(selectedTheme);
    }
    // Navigate to Screen 10 (Verse Preview)
    router.push('/onboarding-verse-preview');
  };

  const logoSize = scaleIconSize(80); // ~80px as specified

  // Get selected theme colors
  const selectedThemeData = selectedTheme 
    ? THEME_OPTIONS.find(t => t.name === selectedTheme)
    : null;
  const activeColor = selectedThemeData?.colors.primary || '#6a2e41';

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, scaleSpacing(20)) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={[styles.progressBarContainer, { paddingTop: Math.max(insets.top, scaleSpacing(20)) }]}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%`, backgroundColor: activeColor }]} />
          </View>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={selectedTheme ? getBookLogo(selectedTheme) : require('../assets/book_logo/rose.png')}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />
        </View>

        {/* Question */}
        <Text style={styles.question}>What color do you prefer?</Text>

        {/* Theme Options */}
        <View style={styles.optionsContainer}>
          {THEME_OPTIONS.map((theme) => {
            const isSelected = selectedTheme === theme.name;
            return (
              <TouchableOpacity
                key={theme.name}
                style={[
                  styles.option,
                  isSelected && { 
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedTheme(theme.name)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <View style={[styles.selectedOverlay, { backgroundColor: theme.colors.lighter, opacity: 0.3 }]} />
                )}
                {/* Color Swatches */}
                <View style={[styles.colorSwatches, { zIndex: 1 }]}>
                  <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: theme.colors.darker }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: theme.colors.lighter }]} />
                </View>
                <Text style={[styles.optionText, { zIndex: 1 }]}>{theme.label}</Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: theme.colors.primary, zIndex: 1 }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
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
              { backgroundColor: activeColor },
              !selectedTheme && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedTheme}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.buttonText,
              !selectedTheme && styles.buttonTextDisabled,
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
    minHeight: scaleSpacing(70),
    position: 'relative',
    overflow: 'hidden',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  colorSwatches: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scaleSpacing(16),
  },
  colorSwatch: {
    width: scaleSpacing(32),
    height: scaleSpacing(32),
    borderRadius: scaleSpacing(6),
    marginRight: scaleSpacing(8),
  },
  optionText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#2D2D2D',
    flex: 1,
  },
  checkmark: {
    width: scaleSpacing(24),
    height: scaleSpacing(24),
    borderRadius: scaleSpacing(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#F5F0E8',
    fontSize: scaleFontSize(16, 14),
    fontWeight: 'bold',
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

