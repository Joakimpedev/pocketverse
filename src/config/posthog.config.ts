// PostHog configuration
export const posthogConfig = {
  // PostHog API Key (from PostHog dashboard)
  apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY || 'phc_OXGg448mqTo13UhPa0FI1DJXcYsh7dGq9wW6yVqIw66',
  // PostHog host (default is US region, use https://eu.i.posthog.com for EU)
  host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
};


