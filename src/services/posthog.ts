import PostHog from 'posthog-react-native';
import { posthogConfig } from '../config/posthog.config';
import { Platform } from 'react-native';

// PostHog instance (v4 uses instance-based API)
let posthogInstance: PostHog | null = null;
let isInitialized = false;

// Promise that resolves when PostHog is initialized
let initializationPromise: Promise<void> | null = null;

// Queue for events that fire before initialization
interface QueuedEvent {
  type: 'capture' | 'identify' | 'reset';
  data: any;
}
let eventQueue: QueuedEvent[] = [];

// Helper to flush events - ensures events are sent immediately
export const flushEvents = async (): Promise<void> => {
  if (!isInitialized || !posthogInstance) {
    console.log('[PostHog] Cannot flush - not initialized yet');
    return;
  }
  try {
    await posthogInstance.flush();
    console.log('[PostHog] Events flushed');
  } catch (error) {
    console.error('[PostHog] Error flushing events:', error);
  }
};

// Initialize PostHog (v4 instance-based API)
export const initializePostHog = async (): Promise<void> => {
  // If already initialized, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      if (!posthogConfig.apiKey) {
        console.warn(
          'PostHog API key not configured. Please set EXPO_PUBLIC_POSTHOG_API_KEY in your environment variables.'
        );
        return;
      }

      console.log('[PostHog] Initializing PostHog...');

      // v4 uses instance-based API: new PostHog(apiKey, options)
      posthogInstance = new PostHog(posthogConfig.apiKey, {
        host: posthogConfig.host,
        enableSessionReplay: false,
      });

      // Wait for PostHog to be ready
      await posthogInstance.ready();

      isInitialized = true;
      console.log('[PostHog] PostHog initialized successfully');

      // Flush queued events
      if (eventQueue.length > 0) {
        console.log(`[PostHog] Processing ${eventQueue.length} queued events`);
        for (const event of eventQueue) {
          try {
            if (event.type === 'capture') {
              posthogInstance.capture(event.data.eventName, event.data.properties);
            } else if (event.type === 'identify') {
              posthogInstance.identify(event.data.userId, event.data.properties);
            } else if (event.type === 'reset') {
              posthogInstance.reset();
            }
          } catch (error) {
            console.error('[PostHog] Error processing queued event:', error);
          }
        }
        eventQueue = []; // Clear the queue
        // Flush all queued events to PostHog server
        await flushEvents();
        console.log('[PostHog] Queued events flushed to server');
      }
    } catch (error: any) {
      console.error('[PostHog] Error initializing PostHog:', error);
      // Mark as initialized anyway to prevent infinite queueing
      isInitialized = true;
    }
  })();

  return initializationPromise;
};

// Identify user (call after user signs in)
export const identifyUser = async (userId: string, properties?: Record<string, any>): Promise<void> => {
  const finalProperties = {
    ...properties,
    app_name: 'Pocketverse',
  };

  // If not initialized, queue the event
  if (!isInitialized || !posthogInstance) {
    console.log('[PostHog] Queueing identify event (not initialized yet)');
    eventQueue.push({
      type: 'identify',
      data: { userId, properties: finalProperties },
    });
    return;
  }

  try {
    posthogInstance.identify(userId, finalProperties);
  } catch (error) {
    console.error('[PostHog] Error identifying user:', error);
  }
};

// Reset user (call when user signs out)
export const resetUser = async (): Promise<void> => {
  // If not initialized, queue the event
  if (!isInitialized || !posthogInstance) {
    console.log('[PostHog] Queueing reset event (not initialized yet)');
    eventQueue.push({
      type: 'reset',
      data: {},
    });
    return;
  }

  try {
    posthogInstance.reset();
  } catch (error) {
    console.error('[PostHog] Error resetting PostHog user:', error);
  }
};

// Track event with Pocketverse prefix
export const trackEvent = async (
  eventName: string,
  properties?: Record<string, any>,
  shouldFlush: boolean = false
): Promise<void> => {
  // Ensure event name has Pocketverse prefix
  const prefixedEventName = eventName.startsWith('Pocketverse:')
    ? eventName
    : `Pocketverse: ${eventName}`;

  const finalProperties = {
    ...properties,
    app_name: 'Pocketverse',
    platform: Platform.OS,
  };

  // If not initialized, queue the event
  if (!isInitialized || !posthogInstance) {
    console.log(`[PostHog] Queueing event "${prefixedEventName}" (not initialized yet)`);
    eventQueue.push({
      type: 'capture',
      data: { eventName: prefixedEventName, properties: finalProperties },
    });
    return;
  }

  try {
    console.log(`[PostHog] Capturing event "${prefixedEventName}"`);
    posthogInstance.capture(prefixedEventName, finalProperties);
    // Flush immediately for important events to ensure they're sent
    if (shouldFlush) {
      await flushEvents();
    }
  } catch (error) {
    console.error(`[PostHog] Error tracking event "${prefixedEventName}":`, error);
  }
};

// Convenience methods for specific events
export const trackAppOpened = async (): Promise<void> => {
  await trackEvent('Pocketverse: App Opened', {
    timestamp: new Date().toISOString(),
  }, true); // Flush immediately
};

export const trackSignedIn = async (method: 'apple' | 'email'): Promise<void> => {
  await trackEvent('Pocketverse: Signed In', {
    sign_in_method: method,
    timestamp: new Date().toISOString(),
  }, true); // Flush immediately - critical conversion event
};

export const trackSeenPaywall = async (): Promise<void> => {
  await trackEvent('Pocketverse: Seen Paywall', {
    timestamp: new Date().toISOString(),
  }, true); // Flush immediately
};

export const trackPurchased = async (packageId?: string, revenue?: number, isTrial?: boolean): Promise<void> => {
  await trackEvent('Pocketverse: Purchased', {
    package_id: packageId,
    revenue: revenue,
    is_trial: isTrial,
    timestamp: new Date().toISOString(),
  }, true); // Flush immediately - critical conversion event
};

// Onboarding tracking
export const trackOnboardingStepViewed = async (stepNumber: number, stepName: string): Promise<void> => {
  await trackEvent('Pocketverse: Onboarding Step Viewed', {
    step_number: stepNumber,
    step_name: stepName,
    timestamp: new Date().toISOString(),
  }); // Don't flush - not critical, will batch
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
  }); // Don't flush - not critical, will batch
};

export const trackOnboardingPaywallViewed = async (paywallNumber: number): Promise<void> => {
  await trackEvent('Pocketverse: Onboarding Paywall Viewed', {
    paywall_number: paywallNumber,
    timestamp: new Date().toISOString(),
  }, true); // Flush immediately - important funnel event
};

export const trackOnboardingPaywallDismissed = async (paywallNumber: number): Promise<void> => {
  await trackEvent('Pocketverse: Onboarding Paywall Dismissed', {
    paywall_number: paywallNumber,
    timestamp: new Date().toISOString(),
  }, true); // Flush immediately - important funnel event
};

export const trackOnboardingCompleted = async (): Promise<void> => {
  await trackEvent('Pocketverse: Onboarding Completed', {
    timestamp: new Date().toISOString(),
  }, true); // Flush immediately - critical conversion event
};
