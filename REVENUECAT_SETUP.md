# RevenueCat & Apple In-App Purchase Setup Guide

## Overview
This guide walks you through setting up in-app purchases for your Pocket Verse app using RevenueCat and Apple's App Store Connect.

---

## Part 1: Apple Developer & App Store Connect Setup

### Step 0: Create Bundle ID in Apple Developer (MUST DO FIRST!)

**Important**: Bundle IDs must be created in Apple Developer portal BEFORE you can use them in App Store Connect.

1. **Go to Apple Developer Portal**
   - Visit https://developer.apple.com/account
   - Sign in with your Apple Developer account

2. **Navigate to Certificates, Identifiers & Profiles**
   - In the left sidebar, click "Certificates, Identifiers & Profiles"
   - Or go directly to: https://developer.apple.com/account/resources/identifiers/list

3. **Create New Bundle ID**
   - Click the "+" button in the top right
   - Select "App IDs" → Click "Continue"
   - Select "App" → Click "Continue"
   - Fill in the details:
     - **Description**: Pocket Verse (or any name to identify it)
     - **Bundle ID**: 
       - Option 1: **Explicit Bundle ID** (recommended)
         - Enter: `com.yourname.pocketverse` (use your actual name/company)
         - Format: reverse domain notation (e.g., `com.john.pocketverse`, `com.yourcompany.pocketverse`)
       - Option 2: Wildcard Bundle ID (less common)
         - Format: `com.yourname.*` (allows multiple apps)
   - Click "Continue"
   - Review and click "Register"
   - **Save this Bundle ID** - you'll need it everywhere!

**Important Notes:**
- Bundle IDs are **unique globally** - once created, they can't be deleted (only disabled)
- Make sure you use the correct format: `com.yourname.appname`
- This Bundle ID will be used in:
  - App Store Connect app creation
  - RevenueCat configuration
  - Your Expo app configuration (when you build)

### Step 1: Create Your App in App Store Connect

1. **Go to App Store Connect**
   - Visit https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account (same account)

2. **Create New App**
   - Click "My Apps" → "+" button → "New App"
   - Fill in the details:
     - **Platform**: iOS
     - **Name**: Pocket Verse (or your chosen name)
     - **Primary Language**: English (or your preference)
     - **Bundle ID**: **Select from dropdown** - this shows the Bundle IDs you created in Apple Developer
       - If you don't see your Bundle ID, go back to Step 0 and create it first
       - Select the one you created: `com.yourname.pocketverse`
     - **SKU**: A unique identifier (e.g., `pocketverse-001`)
       - This is just an internal identifier (not the Bundle ID)
     - **User Access**: Full Access
   - Click "Create"

### Step 2: Create In-App Purchase Products

1. **Navigate to In-App Purchases**
   - In your app's page, click "Features" tab
   - Click "+" next to "In-App Purchases"
   - Select "Auto-Renewable Subscriptions"

2. **Create Subscription Group**
   - If you don't have one, create a new subscription group
   - Name it: "Premium Subscription" or similar
   - Click "Create"

3. **Create Monthly Subscription**
   - Click "+" to add a subscription
   - Fill in the details:
     - **Reference Name**: Monthly Premium
     - **Subscription ID**: `com.yourcompany.pocketverse.monthly` (must be unique, use your actual bundle prefix)
     - **Subscription Duration**: 1 Month
     - **Price**: Select $2.99/month (or your chosen price)
   - Click "Create"
   - Add subscription display name and description:
     - **Display Name**: "Monthly Premium"
     - **Description**: "Unlimited daily verses, save unlimited favorites, no ads"
   - **Review Information**: Add review notes if needed
   - Click "Save"

4. **Create Yearly Subscription**
   - Click "+" again in the same subscription group
   - Fill in:
     - **Reference Name**: Yearly Premium
     - **Subscription ID**: `com.yourcompany.pocketverse.yearly` (must be unique)
     - **Subscription Duration**: 1 Year
     - **Price**: Select $19.99/year (or your chosen price)
   - Click "Create"
   - Add display name and description:
     - **Display Name**: "Yearly Premium"
     - **Description**: "Unlimited daily verses, save unlimited favorites, no ads. Save 45% compared to monthly!"
   - Click "Save"

### Step 3: Submit Subscription Group for Review
- Your subscriptions will be in "Ready to Submit" status
- You can submit them along with your app when you submit the app for review
- Or submit the subscriptions separately by clicking "Submit for Review" in the subscription group

**Important**: Apple requires subscriptions to have:
- A privacy policy URL
- Terms of service URL
- Clear description of what users get

---

## Part 2: RevenueCat Setup

### Step 1: Create RevenueCat Account & Project

1. **Sign up for RevenueCat**
   - Go to https://app.revenuecat.com
   - Sign up for a free account (or log in if you have one)

2. **Create New Project**
   - Click "Create new project" or "+ New Project"
   - Name it: "Pocket Verse"
   - Select your platform: iOS (and Android if you plan to support it)
   - Click "Create"

### Step 2: Add Your App to RevenueCat

1. **Add iOS App**
   - In your project, click "Add app"
   - Select iOS
   - Enter:
     - **App Name**: Pocket Verse
     - **Bundle ID**: `com.yourcompany.pocketverse` (must match your App Store Connect bundle ID)
   - Click "Continue"

2. **Configure App Store Connect**
   - RevenueCat will guide you to connect your App Store Connect account
   - You'll need to:
     - Grant RevenueCat access to your App Store Connect account, OR
     - Manually enter product IDs (we'll cover this below)

### Step 3: Add Products in RevenueCat

1. **Create Products**
   - In RevenueCat, go to your app → "Products" tab
   - Click "Create Product"
   - Enter the Product ID from App Store Connect:
     - Product ID: `com.yourcompany.pocketverse.monthly`
     - Type: Subscription
   - Click "Save"
   - Repeat for yearly: `com.yourcompany.pocketverse.yearly`

2. **Create Entitlement**
   - Go to "Entitlements" tab
   - Click "Create Entitlement"
   - **Entitlement ID**: `premium` (this matches what's in your code!)
   - **Description**: "Premium subscription access"
   - Click "Save"

3. **Attach Products to Entitlement**
   - Click on the "premium" entitlement
   - Under "Products", click "Attach Product"
   - Select both your monthly and yearly products
   - Both should now grant the "premium" entitlement

### Step 4: Create Offering

1. **Create Offering**
   - Go to "Offerings" tab
   - Click "Create Offering"
   - **Offering ID**: `default` (this is the default RevenueCat uses)
   - **Display Name**: "Premium Subscription"
   - Click "Save"

2. **Add Packages to Offering**
   - Click on your offering
   - Click "Add Package"
   - Create packages:
     - **Package 1**:
       - Identifier: `$rc_monthly` or `monthly`
       - Product: Select your monthly product
     - **Package 2**:
       - Identifier: `$rc_annual` or `yearly` or `annual`
       - Product: Select your yearly product
   - Make sure to set one as "default" (usually monthly)

**Note**: The package identifiers in RevenueCat (`monthly`, `yearly`, `annual`) should match what your code looks for in `app/paywall.tsx`:
```typescript
const monthly = offering.availablePackages.find((pkg) =>
  pkg.identifier.toLowerCase().includes('monthly')
);
const yearly = offering.availablePackages.find((pkg) =>
  pkg.identifier.toLowerCase().includes('yearly') ||
  pkg.identifier.toLowerCase().includes('annual')
);
```

### Step 5: Get Your API Keys

1. **Copy API Keys**
   - In RevenueCat, go to "Project Settings" (gear icon)
   - Find your API keys:
     - **iOS API Key**: Copy this (starts with something like `appl_...`)
     - **Android API Key**: If you need Android later

2. **Add to Your App**
   - Update `src/config/revenuecat.config.ts` with your keys:
   ```typescript
   export const revenueCatConfig = {
     iosApiKey: 'YOUR_IOS_API_KEY_HERE',
     androidApiKey: 'YOUR_ANDROID_API_KEY_HERE', // or leave empty for now
   };
   ```
   - Or use environment variables (recommended for production):
     - Create a `.env` file (or `.env.local`)
     - Add:
       ```
       EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_ios_key_here
       EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_android_key_here
       ```
     - Make sure `.env` is in your `.gitignore`!

---

## Part 3: Testing Your Setup

### Sandbox Testing (iOS)

1. **Create Sandbox Test Account**
   - In App Store Connect, go to "Users and Access" → "Sandbox" → "Testers"
   - Click "+" to create a new sandbox tester
   - Use a fake email (doesn't need to be real, but format must be valid)
   - Use a fake password
   - Country: Select a country

2. **Test in Your App**
   - Build your app for iOS (simulator or device)
   - Sign out of any real Apple ID in Settings → App Store
   - When you try to purchase, it will prompt you to sign in
   - Use your sandbox test account credentials
   - The purchase will be "fake" - no real money is charged
   - You can test multiple times

### Important Notes for Testing

- **Sandbox purchases expire quickly** (usually within 5 minutes) for testing
- **You need to be signed out of a real Apple ID** on the device/simulator
- **Subscription renewals** can be tested in App Store Connect under "Sandbox" → "Auto-Renewable Subscriptions"

---

## Part 4: Checklist

Before submitting your app:

- [ ] Created app in App Store Connect
- [ ] Created monthly subscription product in App Store Connect
- [ ] Created yearly subscription product in App Store Connect
- [ ] Both subscriptions are in "Ready to Submit" or "Approved" status
- [ ] Created RevenueCat project
- [ ] Added iOS app to RevenueCat
- [ ] Added both products to RevenueCat with correct Product IDs
- [ ] Created "premium" entitlement in RevenueCat
- [ ] Attached both products to "premium" entitlement
- [ ] Created "default" offering in RevenueCat
- [ ] Added packages to offering (monthly and yearly)
- [ ] Package identifiers include "monthly" and "yearly"/"annual"
- [ ] Added RevenueCat API keys to your app config
- [ ] Tested sandbox purchases successfully
- [ ] Privacy policy URL is set (required for subscriptions)
- [ ] Terms of service URL is set (required for subscriptions)

---

## Troubleshooting

### Products Not Showing Up
- Make sure Product IDs in RevenueCat exactly match those in App Store Connect
- Wait a few minutes for RevenueCat to sync with App Store Connect
- Check that your offerings are published (not draft)

### "Unable to load subscription options"
- Verify your API keys are correct
- Check that RevenueCat is properly initialized
- Ensure your bundle ID matches between App Store Connect and RevenueCat
- Verify offerings are configured correctly in RevenueCat

### Sandbox Purchases Not Working
- Make sure you're signed out of a real Apple ID
- Verify sandbox tester account is created
- Try logging out and back in to sandbox account
- Check that subscriptions are approved/ready in App Store Connect

---

## Next Steps

Once everything is set up:
1. Test thoroughly in sandbox
2. Submit your app with subscriptions to App Store for review
3. After approval, real purchases will work automatically
4. Monitor purchases and analytics in RevenueCat dashboard

For more detailed help, see:
- RevenueCat Docs: https://docs.revenuecat.com
- Apple In-App Purchase Guide: https://developer.apple.com/in-app-purchase/

