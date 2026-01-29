import { Platform } from "react-native";
import {
  TikTokBusiness,
  TikTokContentEventName,
  TikTokContentEventParameter,
  TikTokEventName,
} from "react-native-tiktok-business-sdk";
import { tiktokConfig } from "../config/tiktok.config";

let isSDKInitialized = false;
const debug = __DEV__;

let attPermissionRequested = false;
let attPermissionStatus: string | null = null;

export async function requestTrackingPermission(): Promise<string | null> {
  if (Platform.OS !== "ios") {
    return "granted"; // Android doesn't require ATT
  }

  if (attPermissionRequested && attPermissionStatus !== null) {
    return attPermissionStatus;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TrackingTransparency = require("expo-tracking-transparency");

    if (
      !TrackingTransparency ||
      !TrackingTransparency.requestTrackingPermissionsAsync
    ) {
      console.warn("[TikTok] requestTrackingPermissionsAsync not available");
      return null;
    }

    const { status: currentStatus } =
      await TrackingTransparency.getTrackingPermissionsAsync();

    if (currentStatus === "granted" || currentStatus === "denied") {
      attPermissionRequested = true;
      attPermissionStatus = currentStatus;
      return currentStatus;
    }

    const { status } =
      await TrackingTransparency.requestTrackingPermissionsAsync();
    attPermissionRequested = true;
    attPermissionStatus = status;

    return status;
  } catch (error: any) {
    console.warn(
      "[TikTok] ⚠️ Failed to request tracking permission:",
      error?.message,
    );
    return null;
  }
}

/**
 * Initialize TikTok tracking
 * Initializes the SDK with your App ID and Access Token
 */
export async function initTikTok(): Promise<void> {
  if (Platform.OS !== "ios") {
    console.warn("[TikTok] SDK is iOS-only, skipping on", Platform.OS);
    return;
  }

  if (isSDKInitialized) {
    return;
  }

  try {
    await TikTokBusiness.initializeSdk(
      tiktokConfig.appId,
      tiktokConfig.tiktokAppId,
      tiktokConfig.tiktokAppSecret,
      debug,
    );
    console.log("[TikTok] ~ initTikTok ~ initialized");
    isSDKInitialized = true;
  } catch (error: any) {
    console.error(
      "[TikTok] ❌ Failed to initialize SDK:",
      error?.message,
      error,
    );
    isSDKInitialized = true;
  }
}

export async function trackCompleteRegistration(
  registrationMethod: "email" | "google" | "apple",
  userId?: string,
): Promise<void> {
  if (Platform.OS !== "ios") {
    return;
  }

  if (!isSDKInitialized) {
    await initTikTok();
  }

  try {
    if (userId) {
      await TikTokBusiness.identify(userId, userId, "", "");
    }
    await TikTokBusiness.trackEvent(TikTokEventName.REGISTRATION, undefined, {
      registration_method: registrationMethod,
    } as any);
    await TikTokBusiness.flush().catch(() => {});
  } catch (error: any) {
    console.warn(
      "[TikTok] ⚠️ Failed to track CompleteRegistration:",
      error?.message,
    );
  }
}

/**
 * Track Subscribe event
 * @param contentId - Product identifier
 * @param currency - Currency code (e.g., 'USD')
 * @param value - Numerical price value
 * @param userId - Optional user ID
 */
export async function trackSubscribe(
  contentId: string,
  currency: string,
  value: number,
  userId?: string,
): Promise<void> {
  if (Platform.OS !== "ios") {
    return;
  }

  if (!isSDKInitialized) {
    await initTikTok();
  }

  try {
    if (userId) {
      await TikTokBusiness.identify(userId, userId, "", "");
    }
    await TikTokBusiness.trackEvent(TikTokEventName.SUBSCRIBE, undefined, {
      content_id: contentId,
      currency: currency,
      value: String(value),
    } as any);
    await TikTokBusiness.flush().catch(() => {});
  } catch (error: any) {
    console.warn("[TikTok] ⚠️ Failed to track Subscribe:", error?.message);
  }
}

export async function trackInitiateCheckout(
  contentId: string,
  currency: string,
  value: number,
  userId?: string,
): Promise<void> {
  if (Platform.OS !== "ios") {
    return;
  }

  if (!isSDKInitialized) {
    await initTikTok();
  }

  try {
    if (userId) {
      await TikTokBusiness.identify(userId, userId, "", "");
    }
    await TikTokBusiness.trackContentEvent(TikTokContentEventName.CHECK_OUT, {
      [TikTokContentEventParameter.CONTENT_ID]: contentId,
      [TikTokContentEventParameter.CURRENCY]: currency,
      [TikTokContentEventParameter.VALUE]: String(value),
    });
    await TikTokBusiness.flush().catch(() => {});
  } catch (error: any) {
    console.warn(
      "[TikTok] ⚠️ Failed to track InitiateCheckout:",
      error?.message,
    );
  }
}

/**
 * Generic event tracking function
 * @param eventName - Event name
 * @param eventParams - Event parameters
 * @param userId - Optional user ID
 */
export async function trackEvent(
  eventName: string,
  eventParams: Record<string, any> = {},
  userId?: string,
): Promise<void> {
  if (Platform.OS !== "ios") {
    return;
  }

  if (!isSDKInitialized) {
    await initTikTok();
  }

  try {
    if (userId) {
      await TikTokBusiness.identify(userId, userId, "", "");
    }

    switch (eventName) {
      case "ViewContent":
        await TikTokBusiness.trackContentEvent(
          TikTokContentEventName.VIEW_CONTENT,
          eventParams as any,
        );

        await TikTokBusiness.flush().catch(() => {});
        return;
      case "LaunchApplication":
        await TikTokBusiness.trackEvent(
          TikTokEventName.LAUNCH_APP,
          undefined,
          eventParams as any,
        );
        console.log("[TikTok] LaunchApplication event called");
        await TikTokBusiness.flush().catch(() => {});
        return;
      default:
        // Use custom event for unmapped events
        await TikTokBusiness.trackCustomEvent(eventName, eventParams || {});
        try {
          await TikTokBusiness.flush();
        } catch (flushError: any) {
          console.warn(
            `[TikTok] ⚠️ Failed to flush events:`,
            flushError?.message,
          );
        }
        console.log(`[TikTok] ${eventName} event called : ${eventParams}`);
        return;
    }
  } catch (error: any) {
    console.error(
      `[TikTok] ❌ Failed to track event ${eventName}:`,
      error?.message,
      error,
    );
  }
}

export async function identifyUser(
  userId: string,
  _properties?: Record<string, any>,
): Promise<void> {
  if (Platform.OS !== "ios" || !userId) {
    return;
  }

  if (!isSDKInitialized) {
    await initTikTok();
  }

  try {
    await TikTokBusiness.identify(userId, userId, "", "");
  } catch (error: any) {
    console.warn(
      "[TikTok] ⚠️ Failed to identify user:",
      error?.message,
    );
  }
}

export async function resetUser(): Promise<void> {
  return;
}

export async function trackSignedIn(
  method: "apple" | "email",
): Promise<void> {
  await trackEvent("SignIn", { method });
}

export async function trackSeenPaywall(): Promise<void> {
  await trackEvent("SeenPaywall", {
    screen: "paywall",
  });
}

export async function trackPurchased(): Promise<void> {
  await trackEvent("PurchasedPremium", {});
}

