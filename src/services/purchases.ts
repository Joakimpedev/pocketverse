import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
} from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { revenueCatConfig } from "../config/revenuecat.config";

// Track if RevenueCat is initialized
let isInitialized = false;

const isExpoGo = Constants.executionEnvironment === "storeClient";

// Initialize RevenueCat
export const initializePurchases = async (): Promise<void> => {
  // If already initialized, return early
  if (isInitialized) {
    return;
  }

  try {
    let apiKey: string | undefined;

    apiKey =
      Platform.OS === "ios"
        ? revenueCatConfig.iosApiKey
        : revenueCatConfig.androidApiKey;
    if (!apiKey) {
      console.warn(
        "RevenueCat API key not configured. Please set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY or EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY in your environment variables.",
      );
      return;
    }

    await Purchases.configure({ apiKey });
    isInitialized = true;
    console.log('RevenueCat initialized successfully');
  } catch (error: any) {
    console.error("❌ Error initializing RevenueCat:", error);
    throw error;
  }
};

// Check if RevenueCat is available and initialized
const checkAvailability = (): boolean => {
  return isInitialized;
};

// Set user ID for RevenueCat (should be called after user authentication)
export const setPurchasesUserId = async (userId: string): Promise<void> => {
  if (!checkAvailability()) {
    return;
  }
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error("Error setting RevenueCat user ID:", error);
    // Don't throw - allow app to continue
  }
};

// Log out current user (for switching accounts)
export const logoutPurchases = async (): Promise<void> => {
  if (!checkAvailability()) {
    return;
  }
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error("Error logging out RevenueCat user:", error);
    // Don't throw - allow app to continue
  }
};

// Get available offerings (packages)
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  if (!checkAvailability()) {
    return null;
  }
  try {
    const offerings = await Purchases.getOfferings();
    // Return the current offering (you can customize this to return specific offerings)
    return offerings.current;
  } catch (error) {
    console.error("Error fetching offerings:", error);
    return null;
  }
};

// Purchase a package
export const purchasePackage = async (
  packageToPurchase: PurchasesPackage,
): Promise<CustomerInfo> => {
  if (!checkAvailability()) {
    throw new Error(
      "RevenueCat is not available. This feature requires a development build or Test Store API key.",
    );
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error: any) {
    // Handle purchase errors
    if (error.userCancelled) {
      throw new Error("Purchase was cancelled");
    } else if (error.code === "STORE_PROBLEM") {
      throw new Error("There was a problem with the store");
    } else {
      throw new Error(error.message || "Purchase failed. Please try again.");
    }
  }
};

// Restore previous purchases
export const restorePurchases = async (): Promise<CustomerInfo> => {
  if (!checkAvailability()) {
    throw new Error(
      "RevenueCat is not available. This feature requires a development build or Test Store API key.",
    );
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error: any) {
    console.error("Error restoring purchases:", error);
    throw new Error(
      error.message || "Failed to restore purchases. Please try again.",
    );
  }
};

// Check if user has premium status
export const checkPremiumStatus = async (): Promise<boolean> => {
  if (!checkAvailability()) {
    return false;
  }
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    // Check if user has active premium entitlement
    // The entitlement identifier should match what you set in RevenueCat dashboard
    // Common names: 'premium', 'pro', 'subscription', etc.
    return customerInfo.entitlements.active["premium"] !== undefined;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
};

// Get customer info
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  if (!checkAvailability()) {
    throw new Error(
      "RevenueCat is not available. This feature requires a development build or Test Store API key.",
    );
  }
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error("Error getting customer info:", error);
    throw error;
  }
};
