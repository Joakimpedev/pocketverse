import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Image, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme } from '../src/contexts/ThemeContext';
import { getOnboardingSeeking, getOnboardingStruggles, setOnboardingComplete } from '../src/services/onboarding';
import { parseReference } from '../src/utils/bible';

/**
 * Complete verse data mapping based on seeking choice
 * Includes verse, reference, input text, and deep reflection
 */
const VERSE_DATA: Record<string, {
  verse: string;
  reference: string;
  inputText: string;
  deepReflection: string;
}> = {
  comfort: {
    verse: '"The Lord is close to the brokenhearted and saves those who are crushed in spirit."',
    reference: 'Psalm 34:18',
    inputText: "I'm going through a really difficult season right now",
    deepReflection: "When life breaks us down, we often feel most alone. But this verse reveals a beautiful truth: God draws nearest when we're at our lowest. Your pain is not invisible to Him. You don't need to be strong or have it together — just as you are, He is there.",
  },
  peace: {
    verse: '"You will keep in perfect peace those whose minds are steadfast, because they trust in you."',
    reference: 'Isaiah 26:3',
    inputText: "My mind won't stop racing and I can't find peace",
    deepReflection: "The phrase 'perfect peace' in Hebrew is 'shalom shalom' — peace doubled, complete wholeness. This verse reminds us that peace isn't found by trying harder to calm our thoughts, but by anchoring them on God. Peace comes not from controlling everything, but from trusting the One who does.",
  },
  hope: {
    verse: '"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."',
    reference: 'Jeremiah 29:11',
    inputText: "I feel uncertain about what's ahead for me",
    deepReflection: "These words were spoken to people in exile — displaced and wondering if God had forgotten them. Into that uncertainty, God spoke: I have plans for you. The future may be unclear to you, but it is not unclear to God. Your story is not over.",
  },
  strength: {
    verse: '"But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint."',
    reference: 'Isaiah 40:31',
    inputText: "I'm exhausted and don't know how to keep going",
    deepReflection: "The word 'renew' here means to exchange — trading your worn-out strength for God's unlimited supply. Sometimes strength looks like soaring; other times it's just putting one foot in front of the other. Both are victories. You don't have to manufacture strength — just wait on Him.",
  },
  calm: {
    verse: '"Be still, and know that I am God."',
    reference: 'Psalm 46:10',
    inputText: "Everything around me feels chaotic and out of control",
    deepReflection: "In Hebrew, 'be still' means 'let go' or 'cease striving.' It's not about being motionless — it's about releasing your grip on control. You can be still because God is not. He is working, even when you can't see it. He was God before this chaos, and He will be God after.",
  },
  direction: {
    verse: '"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."',
    reference: 'Proverbs 3:5-6',
    inputText: "I don't know which direction to go in my life",
    deepReflection: "We often want God to show us the entire map before we take a step. But this verse invites us into something different: trust first, clarity follows. When you acknowledge God in your decisions, He promises to straighten your path — not always the one you expected, but the one you need.",
  },
  rest: {
    verse: '"Come to me, all you who are weary and burdened, and I will give you rest."',
    reference: 'Matthew 11:28',
    inputText: "I'm carrying so much and I just need rest",
    deepReflection: "Jesus doesn't say 'figure it out' or 'try harder.' He says 'come.' The rest He offers is soul-deep — from no longer carrying burdens you were never meant to bear alone. He doesn't ask you to clean up first. Just come as you are, and exchange your exhaustion for His peace.",
  },
  freedom: {
    verse: '"Cast all your anxiety on him because he cares for you."',
    reference: '1 Peter 5:7',
    inputText: "I can't stop worrying about everything",
    deepReflection: "The word 'cast' here means to throw, to hurl — not a gentle suggestion, but an invitation to aggressively offload every anxious thought onto God. Why? Because He cares for you. Worry says you're alone. This verse says the opposite: Someone stronger is ready to carry what you cannot.",
  },
};

/**
 * Onboarding Screen 10: Verse Preview
 * Replicates homepage verse display with input text, verse card, and deep reflection
 */
export default function OnboardingVersePreviewScreen() {
  const insets = useSafeAreaInsets();
  const { currentTheme, colors } = useTheme();
  const [verseData, setVerseData] = useState<{
    verse: string;
    reference: string;
    inputText: string;
    deepReflection: string;
  } | null>(null);
  const [showDeepReflection, setShowDeepReflection] = useState(false);
  const [reflectionReady, setReflectionReady] = useState(false);
  const [reflectionButtonWidth, setReflectionButtonWidth] = useState<number | null>(null);
  const [reflectionHeight, setReflectionHeight] = useState<number | null>(null);
  const reflectionHeightRef = useRef<number | null>(null);
  const progressPercentage = 90; // ~90% as specified

  // Animation values
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const reflectionOpacity = useRef(new Animated.Value(0)).current;
  const reflectionHeightAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadData = async () => {
      // Load verse based on seeking choice
      const seekingKey = await getOnboardingSeeking();
      if (seekingKey && VERSE_DATA[seekingKey]) {
        setVerseData(VERSE_DATA[seekingKey]);
      } else {
        // Default to comfort if no selection found
        setVerseData(VERSE_DATA.comfort);
      }
    };
    loadData();
  }, []);

  // Animate card in when verse data loads
  useEffect(() => {
    if (verseData) {
      Animated.spring(cardAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [verseData]);

  const handleContinue = async () => {
    // Navigate to first paywall screen (Screen 13)
    router.push('/onboarding-paywall-1');
  };

  const handleReadFullChapter = () => {
    if (!verseData) return;
    
    const parsed = parseReference(verseData.reference);
    if (parsed) {
      router.push({
        pathname: '/read',
        params: {
          bookName: parsed.bookName,
          chapter: parsed.chapter.toString(),
          verse: parsed.verse.toString(),
        },
      });
    }
  };

  const toggleDeepReflection = () => {
    const toValue = showDeepReflection ? 0 : 1;
    
    if (toValue === 1) {
      // Opening: Set animation values to 0 FIRST, before triggering render
      reflectionOpacity.setValue(0);
      reflectionHeightAnimation.setValue(0);
      
      // Now trigger the render with showDeepReflection = true
      setShowDeepReflection(true);
      
      // Use requestAnimationFrame to ensure the component has rendered with height 0
      requestAnimationFrame(() => {
        // Animate height smoothly
        Animated.timing(reflectionHeightAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false, // Height can't use native driver
          easing: (t) => {
            // Custom ease-out curve
            return 1 - Math.pow(1 - t, 3);
          },
        }).start(() => {
          // After height animation completes, fade in text
          setReflectionReady(true);
          setTimeout(() => {
            Animated.timing(reflectionOpacity, {
              toValue: 1,
              duration: 1900,
              useNativeDriver: true,
              easing: (t) => {
                return 1 - Math.pow(1 - t, 3);
              },
            }).start();
          }, 5);
        });
      });
    } else {
      // Closing: Fade out text first, then animate height
      Animated.timing(reflectionOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: (t) => {
          return 1 - Math.pow(1 - t, 2);
        },
      }).start(() => {
        setReflectionReady(false);
        // Then animate height to 0
        Animated.timing(reflectionHeightAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
          easing: (t) => {
            return 1 - Math.pow(1 - t, 2);
          },
        }).start(() => {
          setShowDeepReflection(false);
        });
      });
    }
  };

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

  if (!verseData) {
    return null; // Or a loading state
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, scaleSpacing(20)) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={[styles.progressBarContainer, { paddingTop: Math.max(insets.top, scaleSpacing(20)) }]}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        {/* Preview Tag */}
        <View style={styles.previewTagContainer}>
          <View style={[styles.previewTag, { backgroundColor: colors.primary }]}>
            <Text style={styles.previewTagText}>How it will look</Text>
          </View>
        </View>

        {/* Header with Logo, App Name, and Tagline */}
        <View style={styles.header}>
          <View style={styles.logoIconContainer}>
            <Image
              source={getBookLogo()}
              style={{ width: scaleIconSize(32), height: scaleIconSize(32) }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.logoText}>Pocket Verse</Text>
          <Text style={styles.tagline}>The right verse for right now</Text>
        </View>

        {/* Text Input Field (Read-only) */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={verseData.inputText}
            editable={false}
            multiline
            placeholder="What's on your heart today?"
            placeholderTextColor="#3E3A36"
          />
        </View>

        {/* Verse Card */}
        {verseData && (
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: cardAnimation,
                transform: [
                  {
                    translateY: cardAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                  {
                    scale: cardAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Verse Reference - Tappable to read full chapter */}
            <TouchableOpacity
              onPress={handleReadFullChapter}
              activeOpacity={0.7}
              style={styles.referenceContainer}
            >
              <Text style={[styles.resultReference, { color: colors.primary }]}>
                {verseData.reference}
              </Text>
              <Text style={[styles.readFullChapterText, { color: colors.darker }]}>
                Read full chapter
              </Text>
            </TouchableOpacity>

            {/* Verse Text */}
            <Text style={styles.resultText}>
              {verseData.verse}
            </Text>

            {/* Hidden measurement view - always rendered to measure height */}
            <View
              style={styles.reflectionMeasure}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                if (height > 0 && reflectionHeightRef.current !== height) {
                  reflectionHeightRef.current = height;
                  setReflectionHeight(height);
                }
              }}
              pointerEvents="none"
            >
              <View style={styles.reflectionSection}>
                <Text style={styles.reflectionLabel}>Deep Reflection:</Text>
                <Text style={styles.reflectionText}>
                  {verseData.deepReflection}
                </Text>
              </View>
            </View>

            {/* Deep Reflection Section - Animated height spacer */}
            {showDeepReflection && reflectionHeight && (
              <Animated.View
                style={{
                  height: reflectionHeightAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, reflectionHeight],
                  }),
                  overflow: 'hidden',
                }}
              >
                <View style={styles.reflectionSection}>
                  <Animated.View
                    style={{
                      opacity: reflectionReady ? reflectionOpacity : 0,
                    }}
                  >
                    {reflectionReady && (
                      <>
                        <Text style={styles.reflectionLabel}>Deep Reflection:</Text>
                        <Text style={styles.reflectionText}>
                          {verseData.deepReflection}
                        </Text>
                      </>
                    )}
                  </Animated.View>
                </View>
              </Animated.View>
            )}

            {/* Deep Reflection Button */}
            <View style={styles.buttonRow}>
              <View
                style={[
                  styles.reflectionButtonContainer,
                  reflectionButtonWidth ? { width: reflectionButtonWidth, flex: 0 } : undefined
                ]}
                onLayout={(event) => {
                  if (!reflectionButtonWidth && !showDeepReflection) {
                    // Only measure when reflection is closed to get natural width
                    const { width } = event.nativeEvent.layout;
                    setReflectionButtonWidth(width);
                  }
                }}
              >
                <TouchableOpacity
                  style={[styles.reflectionButton, { backgroundColor: colors.primary }]}
                  onPress={toggleDeepReflection}
                  activeOpacity={0.8}
                >
                  <Text style={styles.reflectionButtonText}>
                    Deep Reflection
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: '#F5F0E8' }]}>
              Looks beautiful
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
    paddingHorizontal: scaleSpacing(20),
  },
  progressBarContainer: {
    paddingBottom: scaleSpacing(12),
  },
  previewTagContainer: {
    alignItems: 'center',
    marginBottom: scaleSpacing(16),
  },
  previewTag: {
    paddingHorizontal: scaleSpacing(16),
    paddingVertical: scaleSpacing(6),
    borderRadius: scaleSpacing(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewTagText: {
    fontSize: scaleFontSize(12, 10),
    fontFamily: 'Nunito_600SemiBold',
    color: '#F5F0E8', // Cream color
  },
  progressBarTrack: {
    height: scaleSpacing(8),
    backgroundColor: '#E5DDD3', // Tan track
    borderRadius: scaleSpacing(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: scaleSpacing(4),
  },
  inputContainer: {
    marginBottom: scaleSpacing(16),
  },
  input: {
    borderWidth: 1,
    borderColor: '#8F6240', // Lighter burnt umber (borders, subtle accents)
    borderRadius: scaleSpacing(12), // More rounded corners
    padding: scaleSpacing(16),
    minHeight: scaleSpacing(90),
    textAlignVertical: 'top',
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    backgroundColor: '#FAF7F2', // Lighter parchment for input
    color: '#3E3A36',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginTop: scaleSpacing(24),
    marginBottom: scaleSpacing(24),
  },
  logoIconContainer: {
    marginBottom: scaleSpacing(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: scaleFontSize(28, 22),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36', // Warm dark grey text
  },
  tagline: {
    fontSize: scaleFontSize(16, 13),
    fontFamily: 'Nunito_400Regular',
    color: '#666', // Subtle grey for tagline
    marginTop: scaleSpacing(8),
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#FAF7F2', // Fixed background color like homepage
    borderRadius: scaleSpacing(16),
    padding: scaleSpacing(24),
    marginTop: scaleSpacing(24),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E8E4DD', // Subtle border
    position: 'relative',
  },
  referenceContainer: {
    marginBottom: scaleSpacing(16),
    alignItems: 'center',
  },
  resultReference: {
    fontSize: scaleFontSize(22, 18),
    fontFamily: 'Nunito_700Bold',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    marginBottom: scaleSpacing(4),
  },
  readFullChapterText: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Nunito_400Regular',
    opacity: 0.7,
  },
  resultText: {
    fontSize: scaleFontSize(18, 15),
    fontFamily: 'Lora_400Regular_Italic',
    marginBottom: scaleSpacing(24),
    lineHeight: scaleFontSize(28, 22),
    color: '#3E3A36',
  },
  reflectionMeasure: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    width: '100%',
    pointerEvents: 'none',
  },
  reflectionSection: {
    paddingTop: scaleSpacing(16),
    paddingBottom: scaleSpacing(16),
  },
  reflectionLabel: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: scaleSpacing(10),
    color: '#3E3A36',
  },
  reflectionText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Lora_400Regular',
    lineHeight: scaleFontSize(22, 18),
    color: '#3E3A36',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaleSpacing(8),
  },
  reflectionButtonContainer: {
    flex: 1,
    minWidth: scaleSpacing(140),
  },
  reflectionButton: {
    width: '100%',
    borderRadius: scaleSpacing(10),
    paddingVertical: scaleSpacing(12),
    paddingHorizontal: scaleSpacing(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  reflectionButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
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
  buttonText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
  },
});
