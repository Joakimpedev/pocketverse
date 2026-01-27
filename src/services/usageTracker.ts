import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_COUNT_KEY = 'dailyCount';
const LAST_RESET_DATE_KEY = 'lastResetDate';
const FREE_LIMIT = 1;

/**
 * Gets the current date as YYYY-MM-DD string
 */
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets the current usage count for today
 */
export const getUsageToday = async (): Promise<number> => {
  try {
    await resetIfNewDay();
    const countStr = await AsyncStorage.getItem(DAILY_COUNT_KEY);
    return countStr ? parseInt(countStr, 10) : 0;
  } catch (error) {
    console.error('Error getting usage today:', error);
    return 0;
  }
};

/**
 * Increments the usage count by 1
 */
export const incrementUsage = async (): Promise<void> => {
  try {
    // Reset if new day first (ensures we're working with today's count)
    await resetIfNewDay();
    // Get current count directly from storage (already reset if needed above)
    const countStr = await AsyncStorage.getItem(DAILY_COUNT_KEY);
    const currentCount = countStr ? parseInt(countStr, 10) : 0;
    await AsyncStorage.setItem(DAILY_COUNT_KEY, String(currentCount + 1));
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
};

/**
 * Checks if it's a new day and resets the count to 0 if so
 */
export const resetIfNewDay = async (): Promise<void> => {
  try {
    const today = getTodayDateString();
    const lastResetDate = await AsyncStorage.getItem(LAST_RESET_DATE_KEY);

    if (lastResetDate !== today) {
      // It's a new day, reset the count
      await AsyncStorage.setItem(DAILY_COUNT_KEY, '0');
      await AsyncStorage.setItem(LAST_RESET_DATE_KEY, today);
    }
  } catch (error) {
    console.error('Error resetting for new day:', error);
    // If there's an error, try to initialize the values
    try {
      const today = getTodayDateString();
      await AsyncStorage.setItem(DAILY_COUNT_KEY, '0');
      await AsyncStorage.setItem(LAST_RESET_DATE_KEY, today);
    } catch (initError) {
      console.error('Error initializing usage tracker:', initError);
    }
  }
};

/**
 * Checks if the user can use the app for free (hasn't reached daily limit)
 */
export const canUseForFree = async (): Promise<boolean> => {
  try {
    const count = await getUsageToday();
    return count < FREE_LIMIT;
  } catch (error) {
    console.error('Error checking if can use for free:', error);
    // On error, allow usage to avoid blocking users
    return true;
  }
};
