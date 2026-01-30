import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@pocketverse:onboarding_complete';
const WELCOME_SEEN_KEY = '@pocketverse:welcome_seen';
const ONBOARDING_NAME_KEY = '@pocketverse:onboarding_name';
const ONBOARDING_AGE_KEY = '@pocketverse:onboarding_age';
const ONBOARDING_BIBLE_FAMILIARITY_KEY = '@pocketverse:onboarding_bible_familiarity';
const ONBOARDING_STRUGGLES_KEY = '@pocketverse:onboarding_struggles';
const ONBOARDING_SEEKING_KEY = '@pocketverse:onboarding_seeking';
const ONBOARDING_THEME_KEY = '@pocketverse:onboarding_theme';

/**
 * Check if onboarding has been completed
 */
export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark onboarding as complete
 */
export const setOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
  }
};

/**
 * Reset onboarding (for logout/delete account)
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};

/**
 * Check if user has seen the welcome message on home screen
 */
export const hasSeenWelcome = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking welcome seen status:', error);
    return false;
  }
};

/**
 * Mark welcome message as seen
 */
export const setWelcomeSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
  } catch (error) {
    console.error('Error setting welcome seen:', error);
  }
};

/**
 * Reset welcome screen state (for dev testing)
 */
export const resetWelcome = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(WELCOME_SEEN_KEY);
  } catch (error) {
    console.error('Error resetting welcome:', error);
  }
};

/**
 * Save onboarding name
 */
export const saveOnboardingName = async (name: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_NAME_KEY, name);
  } catch (error) {
    console.error('Error saving onboarding name:', error);
  }
};

/**
 * Get onboarding name
 */
export const getOnboardingName = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ONBOARDING_NAME_KEY);
  } catch (error) {
    console.error('Error getting onboarding name:', error);
    return null;
  }
};

/**
 * Save onboarding age
 */
export const saveOnboardingAge = async (age: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_AGE_KEY, age);
  } catch (error) {
    console.error('Error saving onboarding age:', error);
  }
};

/**
 * Get onboarding age
 */
export const getOnboardingAge = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ONBOARDING_AGE_KEY);
  } catch (error) {
    console.error('Error getting onboarding age:', error);
    return null;
  }
};

/**
 * Save onboarding Bible familiarity
 */
export const saveOnboardingBibleFamiliarity = async (familiarity: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_BIBLE_FAMILIARITY_KEY, familiarity);
  } catch (error) {
    console.error('Error saving onboarding Bible familiarity:', error);
  }
};

/**
 * Get onboarding Bible familiarity
 */
export const getOnboardingBibleFamiliarity = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ONBOARDING_BIBLE_FAMILIARITY_KEY);
  } catch (error) {
    console.error('Error getting onboarding Bible familiarity:', error);
    return null;
  }
};

/**
 * Save onboarding struggles
 */
export const saveOnboardingStruggles = async (struggles: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_STRUGGLES_KEY, JSON.stringify(struggles));
  } catch (error) {
    console.error('Error saving onboarding struggles:', error);
  }
};

/**
 * Get onboarding struggles
 */
export const getOnboardingStruggles = async (): Promise<string[] | null> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_STRUGGLES_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting onboarding struggles:', error);
    return null;
  }
};

/**
 * Save onboarding seeking choice
 */
export const saveOnboardingSeeking = async (verseKey: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_SEEKING_KEY, verseKey);
  } catch (error) {
    console.error('Error saving onboarding seeking:', error);
  }
};

/**
 * Get onboarding seeking choice
 */
export const getOnboardingSeeking = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ONBOARDING_SEEKING_KEY);
  } catch (error) {
    console.error('Error getting onboarding seeking:', error);
    return null;
  }
};

/**
 * Save onboarding theme
 */
export const saveOnboardingTheme = async (theme: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_THEME_KEY, theme);
  } catch (error) {
    console.error('Error saving onboarding theme:', error);
  }
};

/**
 * Get onboarding theme
 */
export const getOnboardingTheme = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ONBOARDING_THEME_KEY);
  } catch (error) {
    console.error('Error getting onboarding theme:', error);
    return null;
  }
};

