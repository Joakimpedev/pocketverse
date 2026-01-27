import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Animated, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { useAuth } from '../src/contexts/AuthContext';
import { scaleFontSize, scaleSpacing, scaleIconSize, SCREEN_WIDTH } from '../src/utils/responsive';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';
import { Platform as RNPlatform } from 'react-native';
import { setOnboardingComplete } from '../src/services/onboarding';

const CARD_WIDTH = SCREEN_WIDTH - scaleSpacing(100); // Smaller cards
const CARD_SPACING = scaleSpacing(12);

interface OnboardingCard {
  title: string;
  description: string;
}

const cards: OnboardingCard[] = [
  {
    title: "Share what's on your heart",
    description: "Describe how you're feeling, and we'll find a Bible verse that speaks to your moment.",
  },
  {
    title: "Build your collection",
    description: "Save meaningful verses to revisit whenever you need them.",
  },
  {
    title: "Understand why",
    description: "Get a personal reflection on why each verse was chosen for you.",
  },
];

export default function SignInScreen() {
  const { colors } = useTheme();
  const { signInWithApple, signInWithEmail, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(RNPlatform.OS === 'ios');
  const [AppleAuthentication, setAppleAuthentication] = useState<any>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const cardsScrollViewRef = useRef<ScrollView>(null);

  // Check if Apple Authentication is available (only when button is rendered)
  const checkAppleAuth = () => {
    if (RNPlatform.OS === 'ios' && !AppleAuthentication) {
      try {
        const AppleAuth = require('expo-apple-authentication');
        setAppleAuthentication(AppleAuth);
        setIsAppleAuthAvailable(true);
        return AppleAuth;
      } catch (error) {
        console.warn('expo-apple-authentication not available:', error);
        setIsAppleAuthAvailable(false);
        return null;
      }
    }
    return AppleAuthentication;
  };

  const handleCardsScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
        setCurrentCardIndex(index);
      },
    }
  );

  // Navigate to main app if user is already signed in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const toggleEmailMode = () => {
    setIsEmailMode(!isEmailMode);
    setEmail('');
    setPassword('');
    setIsSignUp(true);
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email, password, isSignUp);
      await setOnboardingComplete();
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Email Sign In error:', error);
      
      // If user not found during sign in, automatically try to sign up
      if (error.code === 'auth/user-not-found' && !isSignUp) {
        console.log('User not found, attempting to sign up instead...');
        try {
          await signInWithEmail(email, password, true); // true = sign up
          await setOnboardingComplete();
          router.replace('/(tabs)');
          return;
        } catch (signUpError: any) {
          console.error('Auto sign up error:', signUpError);
          if (signUpError.code === 'auth/weak-password') {
            Alert.alert('Sign Up Failed', 'Password should be at least 6 characters.');
          } else {
            Alert.alert('Sign Up Failed', 'Could not create account. Please try again.');
          }
          setIsLoading(false);
          return;
        }
      }
      
      // If email already in use during sign up, automatically try to sign in
      if (error.code === 'auth/email-already-in-use' && isSignUp) {
        console.log('Email already exists, attempting to sign in instead...');
        try {
          await signInWithEmail(email, password, false); // false = sign in
          await setOnboardingComplete();
          router.replace('/(tabs)');
          return;
        } catch (signInError: any) {
          console.error('Auto sign in error:', signInError);
          if (signInError.code === 'auth/wrong-password' || signInError.code === 'auth/invalid-credential') {
            Alert.alert('Sign In Failed', 'This email is registered but the password is incorrect.');
          } else {
            Alert.alert('Sign In Failed', 'Could not sign in. Please try again.');
          }
          setIsLoading(false);
          return;
        }
      }
      
      // Handle other errors
      let message = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      }
      Alert.alert('Sign In Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (RNPlatform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign In is only available on iOS devices.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithApple();
      await setOnboardingComplete();
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        console.error('Apple Sign In error:', error);
        Alert.alert('Sign In Failed', error.message || 'Failed to sign in with Apple. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  // Parchment texture component
  const ParchmentTexture = () => {
    const dotsRef = useRef<Array<{ x: number; y: number; size: number; opacity: number }>>([]);
    if (dotsRef.current.length === 0) {
      const dotCount = 400;
      const screenHeight = Dimensions.get('window').height;
      for (let i = 0; i < dotCount; i++) {
        dotsRef.current.push({
          x: Math.random() * SCREEN_WIDTH,
          y: Math.random() * screenHeight,
          size: Math.random() * 0.8 + 0.3,
          opacity: Math.random() * 0.4 + 0.1,
        });
      }
    }

    return (
      <View style={styles.textureOverlay} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={Dimensions.get('window').height} style={styles.textureSvg}>
          <Defs>
            <Pattern id="grainPattern" patternUnits="userSpaceOnUse" width="4" height="4">
              <Circle cx="1" cy="1" r="0.5" fill="#D4C5A9" opacity="0.4" />
              <Circle cx="3" cy="3" r="0.4" fill="#C9B89A" opacity="0.3" />
              <Circle cx="2" cy="0.5" r="0.3" fill="#D4C5A9" opacity="0.2" />
            </Pattern>
          </Defs>
          <Rect width={SCREEN_WIDTH} height={Dimensions.get('window').height} fill="url(#grainPattern)" opacity={0.05 * 0.5} />
          {dotsRef.current.map((dot, index) => (
            <Circle
              key={`dot-${index}`}
              cx={dot.x}
              cy={dot.y}
              r={dot.size}
              fill="#D4C5A9"
              opacity={dot.opacity * 0.05}
            />
          ))}
        </Svg>
      </View>
    );
  };

  const logoIconSize = scaleIconSize(24);

  return (
    <View style={styles.container}>
      <ParchmentTexture />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + scaleSpacing(20), paddingBottom: insets.bottom + scaleSpacing(20) }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
          {/* Compact Header */}
          <View style={styles.header}>
            <View style={styles.logoIconContainer}>
              <Image 
                source={require('../assets/book_logo/rose.png')} 
                style={{ width: logoIconSize, height: logoIconSize }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logoText}>Pocket Verse</Text>
            <Text style={styles.tagline}>The right verse for right now</Text>
          </View>

          {/* Onboarding Cards */}
          <View style={styles.cardsSection}>
            <ScrollView
              ref={cardsScrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              onScroll={handleCardsScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.cardsScrollContent}
              style={styles.cardsScrollView}
            >
              {cards.map((card, index) => (
                <View key={index} style={[styles.card, { width: CARD_WIDTH, backgroundColor: colors.primary }]}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Dot Indicators */}
            <View style={styles.dotsContainer}>
              {cards.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentCardIndex && [styles.dotActive, { backgroundColor: colors.primary }],
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Sign In with Apple (iOS only, requires native build) */}
            {RNPlatform.OS === 'ios' && !isLoading && (() => {
              const AppleAuth = checkAppleAuth();
              if (AppleAuth) {
                return (
                  <View style={styles.appleButtonContainer}>
                    <AppleAuth.AppleAuthenticationButton
                      buttonType={AppleAuth.AppleAuthenticationButtonType.SIGN_IN}
                      buttonStyle={AppleAuth.AppleAuthenticationButtonStyle.WHITE}
                      cornerRadius={scaleSpacing(12)}
                      style={styles.appleButton}
                      onPress={handleAppleSignIn}
                    />
                  </View>
                );
              }
              return (
                <View style={styles.appleUnavailableContainer}>
                  <Text style={styles.appleUnavailableText}>
                    Apple Sign In requires a native build. Use email sign in or build with: npx expo prebuild
                  </Text>
                </View>
              );
            })()}
            {RNPlatform.OS === 'ios' && isLoading && (
              <TouchableOpacity
                style={[styles.loadingButton, { backgroundColor: '#000' }]}
                disabled={true}
              >
                <ActivityIndicator color="#fff" size="small" />
              </TouchableOpacity>
            )}

            {/* Email Sign In Option */}
            {!isEmailMode ? (
              <TouchableOpacity
                style={[styles.emailToggleButton, { borderColor: colors.lighter }]}
                onPress={toggleEmailMode}
                activeOpacity={0.7}
              >
                <Text style={[styles.emailToggleText, { color: colors.darker }]}>
                  Sign in with Email
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emailForm}>
                <TextInput
                  style={[styles.input, { borderColor: colors.lighter }]}
                  placeholder="Email"
                  placeholderTextColor={colors.darker}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TextInput
                  style={[styles.input, { borderColor: colors.lighter, marginTop: scaleSpacing(12) }]}
                  placeholder="Password"
                  placeholderTextColor={colors.darker}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={[styles.emailButton, { backgroundColor: colors.primary }]}
                  onPress={handleEmailSignIn}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.emailButtonText}>
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toggleSignUpButton}
                  onPress={toggleSignUp}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.toggleSignUpText, { color: colors.darker }]}>
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.backToAppleButton}
                  onPress={toggleEmailMode}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.backToAppleText, { color: colors.darker }]}>
                    Back
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E9',
  },
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: 'rgba(212, 197, 169, 0.05)',
  },
  textureSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: scaleSpacing(20),
  },
  header: {
    alignItems: 'center',
    paddingBottom: scaleSpacing(16),
  },
  logoIconContainer: {
    marginBottom: scaleSpacing(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: scaleFontSize(24, 20),
    fontFamily: 'Nunito_700Bold',
    color: '#3E3A36',
  },
  tagline: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    marginTop: scaleSpacing(4),
    textAlign: 'center',
  },
  cardsSection: {
    paddingVertical: scaleSpacing(16),
  },
  cardsScrollView: {
    flexGrow: 0,
  },
  cardsScrollContent: {
    paddingLeft: scaleSpacing(20),
    paddingRight: scaleSpacing(20),
    alignItems: 'center',
    paddingVertical: scaleSpacing(8),
  },
  card: {
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(20),
    marginRight: CARD_SPACING,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    height: scaleSpacing(110),
    width: CARD_WIDTH,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: scaleSpacing(8),
  },
  cardDescription: {
    fontSize: scaleFontSize(13, 11),
    fontFamily: 'Lora_400Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: scaleFontSize(18, 15),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scaleSpacing(16),
    gap: scaleSpacing(8),
  },
  dot: {
    width: scaleSpacing(8),
    height: scaleSpacing(8),
    borderRadius: scaleSpacing(4),
    backgroundColor: '#E8E4DD',
  },
  dotActive: {
    width: scaleSpacing(24),
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: scaleSpacing(16),
  },
  appleButtonContainer: {
    width: '100%',
    maxWidth: scaleSpacing(400),
    height: scaleSpacing(50),
    marginBottom: scaleSpacing(16),
  },
  appleButton: {
    width: '100%',
    height: '100%',
  },
  loadingButton: {
    width: '100%',
    maxWidth: scaleSpacing(400),
    height: scaleSpacing(50),
    marginBottom: scaleSpacing(16),
    borderRadius: scaleSpacing(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailToggleButton: {
    width: '100%',
    maxWidth: scaleSpacing(400),
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#FAF7F2',
  },
  emailToggleText: {
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_600SemiBold',
  },
  emailForm: {
    width: '100%',
    maxWidth: scaleSpacing(400),
  },
  input: {
    borderWidth: 1,
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    fontSize: scaleFontSize(16, 14),
    fontFamily: 'Nunito_400Regular',
    backgroundColor: '#FAF7F2',
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
  emailButton: {
    borderRadius: scaleSpacing(12),
    padding: scaleSpacing(16),
    alignItems: 'center',
    marginTop: scaleSpacing(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(18, 15),
    fontFamily: 'Nunito_600SemiBold',
  },
  toggleSignUpButton: {
    marginTop: scaleSpacing(16),
    alignItems: 'center',
  },
  toggleSignUpText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
  backToAppleButton: {
    marginTop: scaleSpacing(12),
    alignItems: 'center',
  },
  backToAppleText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  appleUnavailableContainer: {
    width: '100%',
    maxWidth: scaleSpacing(400),
    padding: scaleSpacing(16),
    backgroundColor: '#FAF7F2',
    borderRadius: scaleSpacing(12),
    borderWidth: 1,
    borderColor: '#E8E4DD',
    marginBottom: scaleSpacing(16),
  },
  appleUnavailableText: {
    fontSize: scaleFontSize(14, 12),
    fontFamily: 'Nunito_400Regular',
    color: '#666',
    textAlign: 'center',
  },
});

