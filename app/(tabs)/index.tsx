import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, AppState, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Share, Alert, Animated, LayoutAnimation, Keyboard, Easing, Image, Modal } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getVerseForSituation, VerseResponse } from '../../src/services/openai';
import { getUsageToday, canUseForFree, incrementUsage } from '../../src/services/usageTracker';
import { usePremium } from '../../src/contexts/PremiumContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { showAPIError, showFirestoreError } from '../../src/utils/errorHandler';
import { saveVerse } from '../../src/services/firestore';
import { hasSeenWelcome, setWelcomeSeen } from '../../src/services/onboarding';
import { BookOpen, Settings, X, Share2 } from 'react-native-feather';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';
import { 
  scaleFontSize, 
  scaleSpacing, 
  scaleIconSize, 
  isSmallScreen,
  SCREEN_WIDTH,
  SCREEN_HEIGHT 
} from '../../src/utils/responsive';

export default function HomeScreen() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [verseResult, setVerseResult] = useState<VerseResponse | null>(null);
  const [originalInput, setOriginalInput] = useState(''); // Store original input for saving
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationReady, setExplanationReady] = useState(false);
  const [whyButtonWidth, setWhyButtonWidth] = useState<number | null>(null);
  const [explanationHeight, setExplanationHeight] = useState<number | null>(null);
  const explanationHeightRef = useRef<number | null>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const { isPremium } = usePremium();
  const { user } = useAuth();
  const { colors, currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const explanationOpacity = useRef(new Animated.Value(0)).current;
  const explanationHeightAnimation = useRef(new Animated.Value(0)).current;
  const contentPositionAnimation = useRef(new Animated.Value(0)).current; // 0 = centered (lower), 1 = top position
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  const dailyLimitModalOpacity = useRef(new Animated.Value(0)).current;
  
  // Welcome screen state
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null); // null = loading, true = show welcome, false = show regular
  const welcomeOpacity = useRef(new Animated.Value(1)).current;
  const inputOpacity = useRef(new Animated.Value(0)).current;

  // Parchment texture opacity controls - adjust these values to control texture visibility
  const TEXTURE_OPACITY = 0.05; // Overall texture opacity (0.0 = invisible, 1.0 = fully opaque)
  const screenWidth = SCREEN_WIDTH;
  const screenHeight = SCREEN_HEIGHT;
  
  // Responsive values for smaller screens
  const logoIconSize = scaleIconSize(32);
  const navIconSize = scaleIconSize(16);
  const settingsIconSize = scaleIconSize(20);
  const closeIconSize = scaleIconSize(20);
  const actionIconSize = scaleIconSize(22);

  // Get the book logo based on current theme
  const getBookLogo = () => {
    switch (currentTheme) {
      case 'classic':
        return require('../../assets/book_logo/classic.png');
      case 'forest':
        return require('../../assets/book_logo/forest.png');
      case 'night':
        return require('../../assets/book_logo/night.png');
      case 'rose':
      default:
        return require('../../assets/book_logo/rose.png');
    }
  };
  
  // Calculate the offset to move content down when centered (0 = at top, positive = lower)
  // Content area height is roughly 300px, we want to center it in available space
  const centeredOffset = Math.max((screenHeight - scaleSpacing(450)) / 3, scaleSpacing(40)); // Position slightly above true center

  // Load usage count
  const loadUsageCount = async () => {
    const count = await getUsageToday();
    setUsageCount(count);
  };

  // Load usage count on mount and when app comes to foreground (only for free users)
  useEffect(() => {
    if (!isPremium) {
      loadUsageCount();
    }

    // Reload when app comes to foreground (handles day resets)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && !isPremium) {
        loadUsageCount();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [isPremium]);

  // Load welcome screen status on mount
  useEffect(() => {
    const loadWelcomeStatus = async () => {
      const hasSeen = await hasSeenWelcome();
      if (hasSeen) {
        // User has seen welcome - show regular input immediately
        setShowWelcome(false);
        welcomeOpacity.setValue(0);
        inputOpacity.setValue(1);
      } else {
        // User hasn't seen welcome - show welcome state
        setShowWelcome(true);
        welcomeOpacity.setValue(1);
        inputOpacity.setValue(0);
      }
    };
    loadWelcomeStatus();
  }, []);

  // Reload count when navigating back to this screen (e.g., from result screen) - only for free users
  useEffect(() => {
    if ((pathname === '/(tabs)' || pathname === '/(tabs)/') && prevPathnameRef.current !== pathname && !isPremium) {
      loadUsageCount();
    }
    prevPathnameRef.current = pathname;
  }, [pathname, isPremium]);

  // Handle keyboard visibility and animate content position
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        // Animate to top position when keyboard appears - smooth ease-out
        Animated.timing(contentPositionAnimation, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true, // Using translateY for smooth animation
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        // Only animate back to center if there's no card shown and not loading
        if (!verseResult && !loading) {
          Animated.timing(contentPositionAnimation, {
            toValue: 0,
            duration: 350,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
        }
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [verseResult, loading]);

  // Update content position when card appears/disappears
  useEffect(() => {
    if (verseResult) {
      // Card is shown, move to top position
      Animated.timing(contentPositionAnimation, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else if (!isKeyboardVisible && !loading) {
      // No card and no keyboard and not loading, center the content
      Animated.timing(contentPositionAnimation, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [verseResult, isKeyboardVisible, loading]);

  const handleFindVerse = async () => {
    if (!input.trim()) {
      return;
    }

    // Check if user can use for free (skip check if premium)
    if (!isPremium) {
      const canUse = await canUseForFree();
      if (!canUse) {
        // Show daily limit modal instead of navigating directly to paywall
        setShowDailyLimitModal(true);
        // Animate modal fade in
        Animated.timing(dailyLimitModalOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
        return;
      }
    }

    setLoading(true);
    try {
      const verseData = await getVerseForSituation(input.trim());
      
      // Increment usage after successful fetch (only for free users)
      if (!isPremium) {
        await incrementUsage();
        const newCount = await getUsageToday();
        setUsageCount(newCount);
      }
      
      // Store original input before clearing
      const currentInput = input.trim();
      
      // Set result and show card with animation
      setVerseResult(verseData);
      setOriginalInput(currentInput); // Store original input for saving
      setIsSaved(false);
      setShowExplanation(false);
      setExplanationReady(false);
      explanationOpacity.setValue(0);
      explanationHeightAnimation.setValue(0);
      // Reset measurements on new verse
      setWhyButtonWidth(null);
      setExplanationHeight(null);
      explanationHeightRef.current = null;
      
      // Animate card expansion
      Animated.spring(cardAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Clear input after successful submission
      setInput('');
    } catch (error) {
      // Log full error for debugging
      console.error('Error getting verse:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Show user-friendly error with retry option
      showAPIError(error, () => handleFindVerse());
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !verseResult) {
      Alert.alert('Error', 'You must be logged in to save verses.');
      return;
    }

    if (isSaved) {
      return;
    }

    setSaving(true);
    try {
      await saveVerse(user.uid, {
        verseReference: verseResult.reference,
        verseText: verseResult.text,
        explanation: verseResult.explanation || '',
        originalInput: originalInput, // Save the stored original input
      });
      setIsSaved(true);
    } catch (error) {
      showFirestoreError(error, handleSave);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!verseResult) return;
    
    try {
      await Share.share({
        message: `"${verseResult.text}" - ${verseResult.reference}\n\nFrom Pocket Verse app`,
        title: verseResult.reference,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share verse. Please try again.');
    }
  };

  const handleNewVerse = () => {
      // Hide explanation if shown
    if (showExplanation) {
      setShowExplanation(false);
      setExplanationReady(false);
      explanationOpacity.setValue(0);
      explanationHeightAnimation.setValue(0);
      // Reset measurements on new verse
      setWhyButtonWidth(null);
      setExplanationHeight(null);
      explanationHeightRef.current = null;
    }
    // Collapse card animation
    Animated.spring(cardAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start(() => {
      // Clear result after animation completes
      setVerseResult(null);
      setIsSaved(false);
      setShowExplanation(false);
      setExplanationReady(false);
      explanationOpacity.setValue(0);
      explanationHeightAnimation.setValue(0);
      // Reset measurements on new verse
      setWhyButtonWidth(null);
      setExplanationHeight(null);
      explanationHeightRef.current = null;
    });
  };

  const toggleExplanation = () => {
    const toValue = showExplanation ? 0 : 1;
    
    if (toValue === 1) {
      // Opening: Set animation values to 0 FIRST, before triggering render
      explanationOpacity.setValue(0);
      explanationHeightAnimation.setValue(0);
      
      // Now trigger the render with showExplanation = true
      setShowExplanation(true);
      
      // Use requestAnimationFrame to ensure the component has rendered with height 0
      requestAnimationFrame(() => {
        // Animate height smoothly (buttons will move down)
        Animated.timing(explanationHeightAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false, // Height can't use native driver
          easing: (t) => {
            // Custom ease-out curve - slower at the end
            return 1 - Math.pow(1 - t, 3);
          },
        }).start(() => {
          // After height animation completes, fade in text
          setExplanationReady(true);
          setTimeout(() => {
            Animated.timing(explanationOpacity, {
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
      Animated.timing(explanationOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: (t) => {
          return 1 - Math.pow(1 - t, 2);
        },
      }).start(() => {
        setExplanationReady(false);
        // Then animate height to 0 (buttons will move up)
        Animated.timing(explanationHeightAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
          easing: (t) => {
            return 1 - Math.pow(1 - t, 2);
          },
        }).start(() => {
          setShowExplanation(false);
        });
      });
    }
  };

  const handleUnlockReflections = () => {
    router.push('/paywall');
  };

  const handleDailyLimitModalClose = () => {
    Animated.timing(dailyLimitModalOpacity, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowDailyLimitModal(false);
    });
  };

  const handleSeeWhatsIncluded = () => {
    setShowDailyLimitModal(false);
    dailyLimitModalOpacity.setValue(0);
    router.push('/paywall');
  };

  // Handle welcome screen continue button
  const handleWelcomeContinue = async () => {
    // Mark welcome as seen
    await setWelcomeSeen();
    
    // Start fading in input immediately (it's already rendered but invisible)
    Animated.timing(inputOpacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    
    // Start fading out welcome with slight delay for smooth crossfade
    setTimeout(() => {
      Animated.timing(welcomeOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // After animation completes, update state
        setShowWelcome(false);
      });
    }, 50); // 50ms delay creates smooth crossfade effect
  };

  // Reset modal animation when hidden
  useEffect(() => {
    if (!showDailyLimitModal) {
      dailyLimitModalOpacity.setValue(0);
    }
  }, [showDailyLimitModal]);

  // Create a subtle parchment texture pattern using SVG noise
  const ParchmentTexture = () => {
    // Generate random dots for texture grain - memoize to prevent regeneration on each render
    const dotsRef = useRef<Array<{ x: number; y: number; size: number; opacity: number }>>([]);
    if (dotsRef.current.length === 0) {
      const dotCount = 400;
      for (let i = 0; i < dotCount; i++) {
        dotsRef.current.push({
          x: Math.random() * screenWidth,
          y: Math.random() * screenHeight,
          size: Math.random() * 0.8 + 0.3,
          opacity: Math.random() * 0.4 + 0.1,
        });
      }
    }

    return (
      <View style={styles.textureOverlay} pointerEvents="none">
        <Svg width={screenWidth} height={screenHeight} style={styles.textureSvg}>
          <Defs>
            <Pattern id="grainPattern" patternUnits="userSpaceOnUse" width="4" height="4">
              <Circle cx="1" cy="1" r="0.5" fill="#D4C5A9" opacity="0.4" />
              <Circle cx="3" cy="3" r="0.4" fill="#C9B89A" opacity="0.3" />
              <Circle cx="2" cy="0.5" r="0.3" fill="#D4C5A9" opacity="0.2" />
            </Pattern>
          </Defs>
          {/* Base repeating pattern for subtle grain */}
          <Rect width={screenWidth} height={screenHeight} fill="url(#grainPattern)" opacity={TEXTURE_OPACITY * 0.5} />
          {/* Random grain dots for organic texture */}
          {dotsRef.current.map((dot, index) => (
            <Circle
              key={`dot-${index}`}
              cx={dot.x}
              cy={dot.y}
              r={dot.size}
              fill="#D4C5A9"
              opacity={dot.opacity * TEXTURE_OPACITY}
            />
          ))}
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ParchmentTexture />
      {/* Top Navigation Buttons */}
      <View style={[styles.topNav, { paddingTop: Math.max(insets.top + scaleSpacing(12), scaleSpacing(20)) }]}>
        <TouchableOpacity 
          style={[styles.navButton, { borderColor: colors.lighter }]} 
          onPress={() => router.push('/(tabs)/saved')}
          activeOpacity={0.7}
        >
          <BookOpen width={navIconSize} height={navIconSize} color={colors.lighter} strokeWidth={2} />
          <Text style={styles.navButtonText}> Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => router.push('/(tabs)/settings')}
          activeOpacity={0.7}
        >
          <Settings width={settingsIconSize} height={settingsIconSize} color={colors.lighter} strokeWidth={2.0} />
        </TouchableOpacity>
      </View>

      {/* Centered Content Container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                transform: [{
                  translateY: contentPositionAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      // When centered (0): move down to center the content
                      centeredOffset,
                      // When at top (1): stay at top with padding
                      0
                    ],
                  }),
                }],
              }
            ]}
          >
          {/* App logo/name with icon */}
          <View style={styles.header}>
            <View style={styles.logoIconContainer}>
              <Image 
                source={getBookLogo()} 
                style={{ width: logoIconSize, height: logoIconSize }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logoText}>Pocket Verse</Text>
            <Text style={styles.tagline}>The right verse for right now</Text>
          </View>

          {/* Input Area Container - Fixed height to prevent layout jump */}
          <View style={styles.inputAreaContainer}>
            {/* Show nothing while loading welcome status to prevent flash */}
            {showWelcome !== null && (
              <>
                {/* Welcome State - Always rendered but positioned absolutely for smooth fade */}
                <Animated.View 
                  style={[
                    styles.welcomeContainer,
                    styles.overlayContainer,
                    { opacity: welcomeOpacity },
                  ]}
                  pointerEvents={showWelcome === true ? 'auto' : 'none'}
                >
                  <Text style={styles.welcomeTitle}>Welcome</Text>
                  <Text style={styles.welcomeText}>
                    Share what's on your heart and receive a verse that speaks to you.
                  </Text>
                  <Text style={[styles.welcomeText, styles.welcomeTextSecondary]}>
                    Every day, you get 1 free verse.
                  </Text>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleWelcomeContinue}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>Okay, got it!</Text>
                  </TouchableOpacity>
                </Animated.View>

                {/* Regular Input State - Always rendered but positioned absolutely for smooth fade */}
                <Animated.View 
                  style={[
                    styles.regularInputContainer,
                    styles.overlayContainer,
                    { opacity: inputOpacity },
                  ]}
                  pointerEvents={showWelcome === false ? 'auto' : 'none'}
                >
                  {/* Large text input box */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, { borderColor: colors.lighter }]}
                      multiline
                      placeholder="What's on your heart today?"
                      placeholderTextColor={colors.darker}
                      value={input}
                      onChangeText={setInput}
                      editable={!loading}
                    />
                  </View>

                  {/* Button - underneath input */}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { backgroundColor: colors.primary },
                      (!input.trim() || loading) && [styles.buttonDisabled, { backgroundColor: colors.darker }],
                    ]}
                    onPress={handleFindVerse}
                    disabled={!input.trim() || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Find my verse</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </View>

          {/* Result Card - Expandable */}
          {verseResult && (
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
              {/* Top Right: Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleNewVerse}
                activeOpacity={0.7}
              >
                <X width={closeIconSize} height={closeIconSize} color={colors.darker} strokeWidth={2} />
              </TouchableOpacity>

              {/* Verse Reference */}
              <Text style={styles.resultReference}>{verseResult.reference}</Text>

              {/* Verse Text */}
              <Text style={styles.resultText}>"{verseResult.text}"</Text>

              {/* Hidden measurement view - always rendered to measure height */}
              <View
                style={styles.explanationMeasure}
                onLayout={(event) => {
                  const { height } = event.nativeEvent.layout;
                  if (height > 0 && explanationHeightRef.current !== height) {
                    explanationHeightRef.current = height;
                    setExplanationHeight(height);
                  }
                }}
                pointerEvents="none"
              >
                <View style={styles.explanationSection}>
                  <Text style={styles.explanationLabel}>Why this verse:</Text>
                  {isPremium ? (
                    <Text style={styles.explanationText}>
                      {verseResult.explanation || 'No explanation available.'}
                    </Text>
                  ) : (
                    <View style={[styles.unlockContainer, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.accordionUnlockMessage, { color: '#fff' }]}>
                        Get a personal reflection on why this verse was chosen for you.
                      </Text>
                      <TouchableOpacity
                        style={[styles.unlockButton, { borderColor: '#fff' }]}
                        onPress={handleUnlockReflections}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.unlockButtonText, { color: '#fff' }]}>
                          Unlock Reflections
                        </Text>
                      </TouchableOpacity>
                      <Text style={[styles.unlockSubtext, { color: 'rgba(255, 255, 255, 0.9)' }]}>Included with Premium</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Explanation Section - Animated height spacer */}
              {showExplanation && explanationHeight && (
                <Animated.View
                  style={{
                    height: explanationHeightAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, explanationHeight],
                    }),
                    overflow: 'hidden',
                  }}
                >
                  <View style={styles.explanationSection}>
                    <Animated.View
                      style={{
                        opacity: explanationReady ? explanationOpacity : 0,
                      }}
                    >
                      {explanationReady && (
                        <>
                          <Text style={styles.explanationLabel}>Why this verse:</Text>
                          {isPremium ? (
                            <Text style={styles.explanationText}>
                              {verseResult.explanation || 'No explanation available.'}
                            </Text>
                          ) : (
                            <View style={[styles.unlockContainer, { backgroundColor: colors.primary }]}>
                              <Text style={[styles.accordionUnlockMessage, { color: '#fff' }]}>
                                Get a personal reflection on why this verse was chosen for you.
                              </Text>
                              <TouchableOpacity
                                style={[styles.unlockButton, { borderColor: '#fff' }]}
                                onPress={handleUnlockReflections}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.unlockButtonText, { color: '#fff' }]}>
                                  Unlock Reflections
                                </Text>
                              </TouchableOpacity>
                              <Text style={[styles.unlockSubtext, { color: 'rgba(255, 255, 255, 0.9)' }]}>Included with Premium</Text>
                            </View>
                          )}
                        </>
                      )}
                    </Animated.View>
                  </View>
                </Animated.View>
              )}

              {/* Action Buttons Row */}
              <View style={styles.resultButtonRow}>
                {/* Save Button (Left) */}
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    (isSaved || saving) && styles.iconButtonDisabled
                  ]}
                  onPress={handleSave}
                  disabled={isSaved || saving || !user}
                  activeOpacity={0.7}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <BookOpen 
                      width={actionIconSize} 
                      height={actionIconSize}
                      color={isSaved ? colors.primary : colors.lighter} 
                      strokeWidth={2}
                      fill={isSaved ? colors.primary : 'none'}
                    />
                  )}
                </TouchableOpacity>

                {/* Why this verse? Button (Center) - Fixed width to prevent snapping */}
                <View 
                  style={[
                    styles.whyButtonContainer,
                    whyButtonWidth ? { width: whyButtonWidth, flex: 0 } : undefined
                  ]}
                  onLayout={(event) => {
                    if (!whyButtonWidth && !showExplanation) {
                      // Only measure when explanation is closed to get natural width
                      const { width } = event.nativeEvent.layout;
                      setWhyButtonWidth(width);
                    }
                  }}
                >
                  <TouchableOpacity 
                    style={[styles.whyButton, { backgroundColor: colors.primary }]} 
                    onPress={toggleExplanation}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.whyButtonText}>
                      Why this verse?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Share Button (Right) */}
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleShare}
                  activeOpacity={0.7}
                >
                  <Share2 width={actionIconSize} height={actionIconSize} color={colors.lighter} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Daily Limit Modal */}
      <Modal
        visible={showDailyLimitModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleDailyLimitModalClose}
      >
        <Animated.View
          style={[
            styles.dailyLimitModalOverlay,
            {
              opacity: dailyLimitModalOpacity,
            },
          ]}
        >
          <View style={styles.dailyLimitModalContent}>
            <Text style={styles.dailyLimitModalHeadline}>
              You've found your verse for today
            </Text>
            <Text style={styles.dailyLimitModalSubtext}>
              Come back tomorrow for a fresh verse, or discover what else Pocket Verse has to offer.
            </Text>
            <TouchableOpacity
              style={[styles.dailyLimitModalButton, { backgroundColor: colors.primary }]}
              onPress={handleSeeWhatsIncluded}
              activeOpacity={0.8}
            >
              <Text style={styles.dailyLimitModalButtonText}>
                See what's included
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dailyLimitModalLink}
              onPress={handleDailyLimitModalClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.dailyLimitModalLinkText, { color: colors.darker }]}>
                Maybe later
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E9', // Warm parchment background
  },
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: 'rgba(212, 197, 169, 0.05)', // Subtle parchment tint
  },
  textureSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scaleSpacing(20),
    paddingBottom: scaleSpacing(16),
    backgroundColor: '#F5F1E9',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4DD', // Subtle border for separation
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleSpacing(8),
    paddingHorizontal: scaleSpacing(16),
    borderRadius: scaleSpacing(8),
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#8F6240', // Lighter burnt umber (borders, subtle accents)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_600SemiBold',
    color: '#3E3A36',
  },
  settingsButton: {
    paddingVertical: scaleSpacing(8),
    paddingHorizontal: scaleSpacing(12),
    // No background, border, or shadow - invisible container with touch area
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: scaleSpacing(20),
    paddingTop: scaleSpacing(40), // Space from nav bar when at top position
    paddingBottom: scaleSpacing(20),
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
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
    color: '#3E3A36', // Warm dark grey text
  },
  tagline: {
    fontSize: scaleFontSize(16, 13),
    fontFamily: 'Nunito_400Regular',
    color: '#666', // Subtle grey for tagline
    marginTop: scaleSpacing(8),
    textAlign: 'center',
  },
  inputAreaContainer: {
    position: 'relative',
    minHeight: scaleSpacing(180), // Fixed min height to prevent layout jump
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleSpacing(20),
    paddingHorizontal: scaleSpacing(8),
  },
  welcomeTitle: {
    fontSize: scaleFontSize(24, 20),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    textAlign: 'center',
    marginBottom: scaleSpacing(20),
  },
  welcomeText: {
    fontSize: scaleFontSize(17, 15),
    fontFamily: 'Nunito_400Regular',
    color: '#3E3A36',
    textAlign: 'center',
    marginBottom: scaleSpacing(12),
    lineHeight: scaleFontSize(26, 22),
    paddingHorizontal: scaleSpacing(4),
  },
  welcomeTextSecondary: {
    fontSize: scaleFontSize(17, 13),
    fontFamily: 'Nunito_700Bold',
    color: '#630',
    marginBottom: scaleSpacing(24),
  },
  regularInputContainer: {
    width: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  hiddenAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  button: {
    // backgroundColor will be set dynamically via inline style
    borderRadius: scaleSpacing(12), // More rounded
    padding: scaleSpacing(16),
    alignItems: 'center',
    marginBottom: scaleSpacing(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonDisabled: {
    // backgroundColor will be set dynamically via inline style
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: scaleFontSize(18, 15),
    fontFamily: 'Nunito_600SemiBold',
  },
  usageText: {
    textAlign: 'center',
    // color will be set dynamically via inline style
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    marginTop: scaleSpacing(8),
  },
  resultCard: {
    backgroundColor: '#FAF7F2',
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
    borderColor: '#E8E4DD',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: scaleSpacing(16),
    right: scaleSpacing(16),
    padding: scaleSpacing(8),
    zIndex: 10,
  },
  resultReference: {
    fontSize: scaleFontSize(22, 18),
    fontFamily: 'Nunito_700Bold',
    marginBottom: scaleSpacing(16),
    color: '#3E3A36',
  },
  resultText: {
    fontSize: scaleFontSize(18, 15),
    fontFamily: 'Lora_400Regular_Italic',
    marginBottom: scaleSpacing(24),
    lineHeight: scaleFontSize(28, 22),
    color: '#3E3A36',
  },
  explanationMeasure: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    width: '100%',
    pointerEvents: 'none',
  },
  explanationSection: {
    paddingTop: scaleSpacing(16),
    paddingBottom: scaleSpacing(16),
  },
  explanationLabel: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: scaleSpacing(10),
    color: '#3E3A36',
  },
  explanationText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Lora_400Regular',
    lineHeight: scaleFontSize(22, 18),
    color: '#3E3A36',
  },
  unlockContainer: {
    alignItems: 'center',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(20),
    marginVertical: scaleSpacing(8),
  },
  accordionDivider: {
    height: 1,
    marginTop: scaleSpacing(8),
    marginBottom: scaleSpacing(16),
    opacity: 0.3,
  },
  accordionContainer: {
    marginBottom: scaleSpacing(24),
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleSpacing(12),
  },
  accordionHeaderText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
    color: '#3E3A36',
  },
  accordionContentMeasure: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    width: '100%',
  },
  accordionContent: {
    overflow: 'hidden',
  },
  accordionContentInner: {
    paddingTop: scaleSpacing(8),
    paddingBottom: scaleSpacing(4),
  },
  accordionLabel: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: scaleSpacing(10),
    color: '#3E3A36',
  },
  accordionExplanation: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Lora_400Regular',
    lineHeight: scaleFontSize(22, 18),
    color: '#3E3A36',
  },
  accordionUnlockMessage: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    marginBottom: scaleSpacing(16),
    lineHeight: scaleFontSize(22, 18),
  },
  unlockButton: {
    borderWidth: 2,
    borderRadius: scaleSpacing(10),
    paddingVertical: scaleSpacing(12),
    paddingHorizontal: scaleSpacing(24),
    alignItems: 'center',
    marginBottom: scaleSpacing(8),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  unlockButtonText: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
  },
  unlockSubtext: {
    fontSize: scaleFontSize(12, 10),
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
  resultButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scaleSpacing(8),
  },
  iconButton: {
    width: scaleSpacing(44),
    height: scaleSpacing(44),
    borderRadius: scaleSpacing(22),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  whyButtonContainer: {
    flex: 1,
    marginHorizontal: scaleSpacing(12),
    minWidth: scaleSpacing(140), // Minimum width to prevent snapping
  },
  whyButton: {
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
  whyButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_600SemiBold',
  },
  dailyLimitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleSpacing(20),
  },
  dailyLimitModalContent: {
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(16),
    padding: scaleSpacing(32),
    width: '100%',
    maxWidth: scaleSpacing(400),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dailyLimitModalHeadline: {
    fontSize: scaleFontSize(24, 20),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
    textAlign: 'center',
    marginBottom: scaleSpacing(16),
    lineHeight: scaleFontSize(32, 26),
  },
  dailyLimitModalSubtext: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: scaleSpacing(32),
    lineHeight: scaleFontSize(24, 20),
  },
  dailyLimitModalButton: {
    width: '100%',
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    alignItems: 'center',
    marginBottom: scaleSpacing(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  dailyLimitModalButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(18, 15),
    fontFamily: 'Nunito_600SemiBold',
  },
  dailyLimitModalLink: {
    padding: scaleSpacing(8),
  },
  dailyLimitModalLinkText: {
    fontSize: scaleFontSize(15, 13),
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
});
