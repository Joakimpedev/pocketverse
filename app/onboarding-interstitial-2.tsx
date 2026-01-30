import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, Animated, Easing, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { getOnboardingSeeking } from '../src/services/onboarding';
import { trackOnboardingStepViewed } from '../src/services/posthog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Verse data mapping based on seeking choice
 */
const VERSE_DATA: Record<string, { verse: string; reference: string; tagline: string }> = {
  comfort: {
    verse: '"The Lord is close to the brokenhearted and saves those who are crushed in spirit."',
    reference: 'Psalm 34:18',
    tagline: 'Even in your hardest moments, God is right there with you.',
  },
  peace: {
    verse: '"You will keep in perfect peace those whose minds are steadfast, because they trust in you."',
    reference: 'Isaiah 26:3',
    tagline: 'When your thoughts race, ask God, and He will provide stillness.',
  },
  hope: {
    verse: '"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."',
    reference: 'Jeremiah 29:11',
    tagline: 'God is already writing the next chapter for you.',
  },
  strength: {
    verse: '"But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint."',
    reference: 'Isaiah 40:31',
    tagline: 'When you feel weak, ask God, and He will provide strength.',
  },
  calm: {
    verse: '"Be still, and know that I am God."',
    reference: 'Psalm 46:10',
    tagline: 'In the middle of the storm, let God be your anchor.',
  },
  direction: {
    verse: '"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."',
    reference: 'Proverbs 3:5-6',
    tagline: 'When the path feels unclear, let God light the way.',
  },
  rest: {
    verse: '"Come to me, all you who are weary and burdened, and I will give you rest."',
    reference: 'Matthew 11:28',
    tagline: 'When you\'re weary, ask God, and He will bury your unrest.',
  },
  freedom: {
    verse: '"Cast all your anxiety on him because he cares for you."',
    reference: '1 Peter 5:7',
    tagline: 'When life\'s burden is heavy, ask God, and He will help you carry.',
  },
};

/**
 * Onboarding Screen 8: Interstitial 2
 * Transition screen with verse display based on seeking choice
 */
export default function OnboardingInterstitial2Screen() {
  const insets = useSafeAreaInsets();
  const [verseData, setVerseData] = useState<{ verse: string; reference: string; tagline: string } | null>(null);
  
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const verseOpacity = useRef(new Animated.Value(0)).current;
  const attributionOpacity = useRef(new Animated.Value(0)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    trackOnboardingStepViewed(8, 'interstitial_2');
  }, []);

  useEffect(() => {
    // Load verse data based on seeking choice
    const loadVerseData = async () => {
      const seekingKey = await getOnboardingSeeking();
      if (seekingKey && VERSE_DATA[seekingKey]) {
        setVerseData(VERSE_DATA[seekingKey]);
      } else {
        // Default to comfort if no selection found
        setVerseData(VERSE_DATA.comfort);
      }
    };
    loadVerseData();
  }, []);

  useEffect(() => {
    if (!verseData) return;

    // Calculate divider width (80% of screen width minus padding)
    const dividerMaxWidth = (SCREEN_WIDTH - scaleSpacing(48)) * 0.8;

    // Sequence 1: Fade in logo, verse, and attribution together
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(verseOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(attributionOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Sequence 2: Animate divider width
      Animated.timing(dividerWidth, {
        toValue: dividerMaxWidth,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false, // width animation doesn't support native driver
      }).start(() => {
        // Sequence 3: Fade in tagline
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
    });
  }, [verseData]);

  const handleContinue = () => {
    // Navigate to Screen 9 (Theme Selection)
    router.push('/onboarding-theme-preview');
  };

  if (!verseData) {
    return null; // Or a loading state
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, scaleSpacing(20)), paddingBottom: Math.max(insets.bottom, scaleSpacing(20)) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Book Logo */}
          <Animated.View style={{ opacity: logoOpacity }}>
            <Image
              source={require('../assets/book_logo/book_open.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Verse Quote */}
          <Animated.View style={[styles.verseContainer, { opacity: verseOpacity }]}>
            <Text style={styles.verse}>
              {verseData.verse}
            </Text>
          </Animated.View>

          {/* Attribution */}
          <Animated.Text style={[styles.attribution, { opacity: attributionOpacity }]}>
            — {verseData.reference}
          </Animated.Text>

          {/* Elegant Divider */}
          <Animated.View 
            style={[
              styles.divider,
              {
                width: dividerWidth,
              }
            ]} 
          />

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            {verseData.tagline}
          </Animated.Text>
        </View>
      </ScrollView>

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8', // Cream background
    paddingHorizontal: scaleSpacing(24),
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleSpacing(40),
  },
  logo: {
    width: scaleIconSize(80),
    height: scaleIconSize(80),
    marginBottom: scaleSpacing(32),
    opacity: 0.6, // Lower opacity
  },
  verseContainer: {
    alignItems: 'center',
    marginBottom: scaleSpacing(16),
    width: '100%',
  },
  verse: {
    fontSize: scaleFontSize(24, 20),
    fontFamily: 'Lora_400Regular_Italic', // Serif, italic for verse
    color: '#2D2D2D', // Dark charcoal
    textAlign: 'center',
    lineHeight: scaleFontSize(36, 30),
  },
  attribution: {
    fontSize: scaleFontSize(18, 16),
    fontFamily: 'Lora_400Regular', // Serif, regular
    color: '#6a2e41', // Dark burgundy
    textAlign: 'center',
    marginBottom: scaleSpacing(32),
  },
  divider: {
    height: 1,
    backgroundColor: '#6a2e41',
    opacity: 0.6, // Darker
    marginVertical: scaleSpacing(32),
    marginBottom: scaleSpacing(32),
  },
  tagline: {
    fontSize: scaleFontSize(20, 18),
    fontFamily: 'Nunito_400Regular', // Sans-serif
    color: '#2D2D2D', // Dark charcoal
    textAlign: 'center',
    lineHeight: scaleFontSize(28, 24),
    marginTop: scaleSpacing(32),
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

