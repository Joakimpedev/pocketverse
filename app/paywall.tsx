import { Redirect } from 'expo-router';

/**
 * /paywall redirects to feature-focused paywall 4 (in-app premium triggers).
 * Onboarding flow still uses paywall-3.
 */
export default function PaywallScreen() {
  return <Redirect href="/onboarding-paywall-4" />;
}
