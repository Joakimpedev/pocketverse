import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@pocketverse:onboarding_complete';
const WELCOME_SEEN_KEY = '@pocketverse:welcome_seen';

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

