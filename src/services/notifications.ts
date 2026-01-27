import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_STORAGE_KEY = '@pocketverse:notifications_enabled';
const NOTIFICATION_IDENTIFIER = 'daily-verse-reminder';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
};

/**
 * Set notification preference
 */
export const setNotificationsEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, enabled ? 'true' : 'false');
    if (enabled) {
      await scheduleDailyNotification();
    } else {
      await cancelDailyNotification();
    }
  } catch (error) {
    console.error('Error setting notification preference:', error);
    throw error;
  }
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule daily notification at 9 AM
 */
export const scheduleDailyNotification = async (): Promise<void> => {
  try {
    // Cancel any existing notification first
    await cancelDailyNotification();

    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    // Schedule notification for 9 AM daily
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDENTIFIER,
      content: {
        title: 'Your one free verse is ready',
        body: "Write what's on your heart.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

/**
 * Cancel the daily notification
 */
export const cancelDailyNotification = async (): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

/**
 * Initialize notifications (call on app start)
 * Only schedules for free users if notifications are enabled
 */
export const initializeNotifications = async (isPremium: boolean): Promise<void> => {
  try {
    const enabled = await areNotificationsEnabled();
    
    if (enabled && !isPremium) {
      // Only schedule for free users
      await scheduleDailyNotification();
    } else if (isPremium) {
      // Cancel notifications for premium users
      await cancelDailyNotification();
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
};

