import PostHog from 'posthog-react-native';
import { posthogConfig } from '../config/posthog.config';
import { Platform } from 'react-native';

// Track if PostHog is initialized
let isInitialized = false;

// Initialize PostHog
export const initializePostHog = async (): Promise<void> => {
  // If already initialized, return early
  if (isInitialized) {
    return;
  }

  try {
    if (!posthogConfig.apiKey) {
      console.warn(
        'PostHog API key not configured. Please set EXPO_PUBLIC_POSTHOG_API_KEY in your environment variables.'
      );
      return;
    }

    await PostHog.setup(posthogConfig.apiKey, {
      host: posthogConfig.host,
      // Enable automatic screen tracking
      enableSessionReplay: false, // Disable by default for performance
      // Enable automatic capture of common events
      captureApplicationLifecycleEvents: true,
      captureDeepLinks: true,
      // Set default properties
      defaultProperties: {
        app_name: 'Pocketverse',
        platform: Platform.OS,
      },
    });

    isInitialized = true;
    console.log('PostHog initialized successfully');
  } catch (error: any) {
    console.error('Error initializing PostHog:', error);
    // Don't throw - allow app to continue without analytics
  }
};

// Check if PostHog is available and initialized
const checkAvailability = (): boolean => {
  return isInitialized;
};

// Identify user (call after user signs in)
export const identifyUser = async (userId: string, properties?: Record<string, any>): Promise<void> => {
  if (!checkAvailability()) {
    return;
  }
  try {
    await PostHog.identify(userId, {
      ...properties,
      app_name: 'Pocketverse',
    });
  } catch (error) {
    console.error('Error identifying user in PostHog:', error);
  }
};

// Reset user (call when user signs out)
export const resetUser = async (): Promise<void> => {
  if (!checkAvailability()) {
    return;
  }
  try {
    await PostHog.reset();
  } catch (error) {
    console.error('Error resetting PostHog user:', error);
  }
};

// Track event with Pocketverse prefix
export const trackEvent = async (
  eventName: string,
  properties?: Record<string, any>
): Promise<void> => {
  if (!checkAvailability()) {
    return;
  }
  try {
    // Ensure event name has Pocketverse prefix
    const prefixedEventName = eventName.startsWith('Pocketverse:')
      ? eventName
      : `Pocketverse: ${eventName}`;

    await PostHog.capture(prefixedEventName, {
      ...properties,
      app_name: 'Pocketverse',
    });
  } catch (error) {
    console.error('Error tracking event in PostHog:', error);
  }
};

// Convenience methods for specific events
export const trackAppOpened = async (): Promise<void> => {
  await trackEvent('Pocketverse: App Opened', {
    timestamp: new Date().toISOString(),
  });
};

export const trackSignedIn = async (method: 'apple' | 'email'): Promise<void> => {
  await trackEvent('Pocketverse: Signed In', {
    sign_in_method: method,
    timestamp: new Date().toISOString(),
  });
};

export const trackSeenPaywall = async (): Promise<void> => {
  await trackEvent('Pocketverse: Seen Paywall', {
    timestamp: new Date().toISOString(),
  });
};

export const trackPurchased = async (packageId?: string, revenue?: number, isTrial?: boolean): Promise<void> => {
  await trackEvent('Pocketverse: Purchased', {
    package_id: packageId,
    revenue: revenue,
    is_trial: isTrial,
    timestamp: new Date().toISOString(),
  });
};

// Onboarding tracking
export const trackOnboardingStepViewed = async (stepNumber: number, stepName: string): Promise<void> => {
  await trackEvent('Pocketverse: Onboarding Step Viewed', {
    step_number: stepNumber,
    step_name: stepName,
    timestamp: new Date().toISOString(),
  });
};

export const trackOnboardingStepCompleted = async (
  stepNumber: number,
  stepName: string,
  selections?: string | string[]
): Promise<void> => {
  await trackEvent('Pocketverse: Onboarding Step Completed', {
    step_number: stepNumber,
    step_name: stepName,
    selections: selections,
    timestamp: new Date().toISOString(),
  });
};

export const trackOnboardingPaywallViewed = async (paywallNumber: number): Promise<void> => {
  await trackEvent('Pocketverse: Onboarding Paywall Viewed', {
    paywall_number: paywallNumber,
    timestamp: new Date().toISOString(),
  });
};

export const trackOnboardingPaywallDismissed = async (paywallNumber: number): Promise<void> => {
  await trackEvent('Pocketverse: Onboarding Paywall Dismissed', {
    paywall_number: paywallNumber,
    timestamp: new Date().toISOString(),
  });
};

export const trackOnboardingCompleted = async (): Promise<void> => {
  await trackEvent('Pocketverse: Onboarding Completed', {
    timestamp: new Date().toISOString(),
  });
};
