import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Image, Animated } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, scaleIconSize } from '../src/utils/responsive';
import { useTheme, themes, ThemeName } from '../src/contexts/ThemeContext';
import { getOnboardingSeeking, saveOnboardingTheme } from '../src/services/onboarding';
import { trackOnboardingStepViewed } from '../src/services/posthog';
import { parseReference } from '../src/utils/bible';

/**
 * Complete verse data mapping based on seeking choice
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

const THEME_ORDER: { name: ThemeName; label: string }[] = [
  { name: 'classic', label: 'Classic' },
  { name: 'forest', label: 'Forest' },
  { name: 'night', label: 'Night' },
  { name: 'rose', label: 'Rose' },
];

const STICKY_BUTTON_HEIGHT = scaleSpacing(72);

/**
 * Combined onboarding: theme picker + verse preview. Sticky "Looks beautiful" button at bottom.
 */
export default function OnboardingThemePreviewScreen() {
  const insets = useSafeAreaInsets();
  const { setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('rose');
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
  const progressPercentage = 80;

  const colors = themes[selectedTheme];

  const cardAnimation = useRef(new Animated.Value(0)).current;
  const reflectionOpacity = useRef(new Animated.Value(0)).current;
  const reflectionHeightAnimation = useRef(new Animated.Value(0)).current;

  const stickyBottomPadding = Math.max(insets.bottom, scaleSpacing(12)) + STICKY_BUTTON_HEIGHT;

  useEffect(() => {
    trackOnboardingStepViewed(9, 'theme_preview');
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const seekingKey = await getOnboardingSeeking();
      if (seekingKey && VERSE_DATA[seekingKey]) {
        setVerseData(VERSE_DATA[seekingKey]);
      } else {
        setVerseData(VERSE_DATA.comfort);
      }
    };
    loadData();
  }, []);

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
    await saveOnboardingTheme(selectedTheme);
    await setTheme(selectedTheme);
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
      reflectionOpacity.setValue(0);
      reflectionHeightAnimation.setValue(0);
      setShowDeepReflection(true);
      requestAnimationFrame(() => {
        Animated.timing(reflectionHeightAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        }).start(() => {
          setReflectionReady(true);
          setTimeout(() => {
            Animated.timing(reflectionOpacity, {
              toValue: 1,
              duration: 1900,
              useNativeDriver: true,
              easing: (t) => 1 - Math.pow(1 - t, 3),
            }).start();
          }, 5);
        });
      });
    } else {
      Animated.timing(reflectionOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: (t) => 1 - Math.pow(1 - t, 2),
      }).start(() => {
        setReflectionReady(false);
        Animated.timing(reflectionHeightAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
          easing: (t) => 1 - Math.pow(1 - t, 2),
        }).start(() => setShowDeepReflection(false));
      });
    }
  };

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

  if (!verseData) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: stickyBottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <View style={[styles.progressBarContainer, { paddingTop: Math.max(insets.top, scaleSpacing(20)) }]}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        {/* Compact Color Picker */}
        <View style={styles.pickerRow}>
          <Text style={styles.pickerLabel}>Choose your color</Text>
          <View style={styles.swatchesRow}>
            {THEME_ORDER.map(({ name, label }) => {
              const isSelected = selectedTheme === name;
              const themeColors = themes[name];
              return (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.swatchWrap,
                    isSelected && { borderColor: themeColors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setSelectedTheme(name)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.swatchMain, { backgroundColor: themeColors.primary }]} />
                  <View style={styles.swatchSubRow}>
                    <View style={[styles.swatchDot, { backgroundColor: themeColors.darker }]} />
                    <View style={[styles.swatchDot, { backgroundColor: themeColors.lighter }]} />
                  </View>
                  <Text style={styles.swatchLabel} numberOfLines={1}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Header with Logo, App Name, and Tagline */}
        <View style={styles.header}>
          <View style={styles.logoIconContainer}>
            <Image
              source={getBookLogo(selectedTheme)}
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

          <Text style={styles.resultText}>{verseData.verse}</Text>

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
              <Text style={styles.reflectionText}>{verseData.deepReflection}</Text>
            </View>
          </View>

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
                <Animated.View style={{ opacity: reflectionReady ? reflectionOpacity : 0 }}>
                  {reflectionReady && (
                    <>
                      <Text style={styles.reflectionLabel}>Deep Reflection:</Text>
                      <Text style={styles.reflectionText}>{verseData.deepReflection}</Text>
                    </>
                  )}
                </Animated.View>
              </View>
            </Animated.View>
          )}

          <View style={styles.buttonRow}>
            <View
              style={[
                styles.reflectionButtonContainer,
                reflectionButtonWidth ? { width: reflectionButtonWidth, flex: 0 } : undefined,
              ]}
              onLayout={(event) => {
                if (!reflectionButtonWidth && !showDeepReflection) {
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
                <Text style={styles.reflectionButtonText}>Deep Reflection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Sticky "Looks beautiful" button */}
      <View
        style={[
          styles.stickyButtonWrap,
          {
            paddingBottom: Math.max(insets.bottom, scaleSpacing(12)),
            paddingTop: scaleSpacing(12),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.stickyButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.stickyButtonText}>Looks beautiful</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scaleSpacing(20),
  },
  progressBarContainer: {
    paddingBottom: scaleSpacing(12),
  },
  progressBarTrack: {
    height: scaleSpacing(8),
    backgroundColor: '#E5DDD3',
    borderRadius: scaleSpacing(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: scaleSpacing(4),
  },
  pickerRow: {
    marginBottom: scaleSpacing(20),
  },
  pickerLabel: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_600SemiBold',
    color: '#2D2D2D',
    marginBottom: scaleSpacing(10),
  },
  swatchesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scaleSpacing(8),
  },
  swatchWrap: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scaleSpacing(8),
    paddingHorizontal: scaleSpacing(4),
    borderRadius: scaleSpacing(10),
    borderWidth: 1,
    borderColor: '#E0D8CF',
    backgroundColor: '#FFFFFF',
  },
  swatchMain: {
    width: scaleSpacing(36),
    height: scaleSpacing(36),
    borderRadius: scaleSpacing(18),
    marginBottom: scaleSpacing(6),
  },
  swatchSubRow: {
    flexDirection: 'row',
    gap: scaleSpacing(4),
    marginBottom: scaleSpacing(4),
  },
  swatchDot: {
    width: scaleSpacing(12),
    height: scaleSpacing(12),
    borderRadius: scaleSpacing(6),
  },
  swatchLabel: {
    fontSize: scaleFontSize(11, 10),
    fontFamily: 'Nunito_600SemiBold',
    color: '#2D2D2D',
  },
  header: {
    alignItems: 'center',
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
    color: '#3E3A36',
  },
  tagline: {
    fontSize: scaleFontSize(16, 13),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    marginTop: scaleSpacing(8),
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: scaleSpacing(16),
  },
  input: {
    borderWidth: 1,
    borderColor: '#8F6240',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    minHeight: scaleSpacing(90),
    textAlignVertical: 'top',
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    backgroundColor: '#FAF7F2',
    color: '#3E3A36',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(16),
    padding: scaleSpacing(24),
    marginTop: scaleSpacing(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E8E4DD',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  reflectionButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
  },
  stickyButtonWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F0E8',
    paddingHorizontal: scaleSpacing(20),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0D8CF',
  },
  stickyButton: {
    borderRadius: scaleSpacing(12),
    paddingVertical: scaleSpacing(16),
    paddingHorizontal: scaleSpacing(24),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  stickyButtonText: {
    color: '#F5F0E8',
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
  },
});
