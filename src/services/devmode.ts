import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVMODE_PREMIUM_KEY_PREFIX = 'devmode:premium:';
const DEVMODE_ACTIVATED_KEY_PREFIX = 'devmode:activated:';
const DEVMODE_CODE = 'devmode32';

/**
 * Gets the devmode activation status for a specific user
 */
export const getDevModeActivated = async (userId?: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }
  try {
    const key = `${DEVMODE_ACTIVATED_KEY_PREFIX}${userId}`;
    const value = await AsyncStorage.getItem(key);
    return value === 'true';
  } catch (error) {
    console.error('Error getting devmode activation:', error);
    return false;
  }
};

/**
 * Activates devmode with a code for a specific user
 */
export const activateDevMode = async (code: string, userId?: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }
  if (code.toLowerCase().trim() === DEVMODE_CODE.toLowerCase()) {
    try {
      const key = `${DEVMODE_ACTIVATED_KEY_PREFIX}${userId}`;
      await AsyncStorage.setItem(key, 'true');
      return true;
    } catch (error) {
      console.error('Error activating devmode:', error);
      return false;
    }
  }
  return false;
};

/**
 * Gets the devmode premium override status for a specific user
 */
export const getDevModePremium = async (userId?: string): Promise<boolean> => {
  if (!userId) {
    return false;
  }
  try {
    const key = `${DEVMODE_PREMIUM_KEY_PREFIX}${userId}`;
    const value = await AsyncStorage.getItem(key);
    return value === 'true';
  } catch (error) {
    console.error('Error getting devmode premium:', error);
    return false;
  }
};

/**
 * Sets the devmode premium override status for a specific user
 */
export const setDevModePremium = async (isPremium: boolean, userId?: string): Promise<void> => {
  if (!userId) {
    return;
  }
  try {
    const key = `${DEVMODE_PREMIUM_KEY_PREFIX}${userId}`;
    await AsyncStorage.setItem(key, String(isPremium));
  } catch (error) {
    console.error('Error setting devmode premium:', error);
  }
};


