# TikTok SDK Setup Guide for Developers

## Overview

This guide explains how to complete the TikTok SDK integration. All trigger events are already wired up in the app - you just need to implement the SDK calls.

## Quick Start

1. **Install TikTok SDK package**
   ```bash
   npm install <tiktok-sdk-package-name>
   ```
   *(Replace with actual TikTok SDK package name)*

2. **Add your API key**
   - Open `src/config/tiktok.config.ts`
   - Add your TikTok API key/credentials

3. **Implement SDK calls**
   - Open `src/services/tiktok.ts`
   - Fill in each function body with actual TikTok SDK calls
   - All functions are already called at the right places in the app

4. **Test**
   - Run the app and verify events appear in TikTok Events Manager

## Files You Need to Modify

### 1. `src/config/tiktok.config.ts`
Add your TikTok API key and any other configuration:
```typescript
export const tiktokConfig = {
  apiKey: 'your-api-key-here',
  // Add other config as needed
};
```

### 2. `src/services/tiktok.ts`
This is the **main file** where you implement all TikTok SDK calls.

**Import TikTok SDK at the top:**
```typescript
import TikTokSDK from 'tiktok-sdk-package'; // Replace with actual import
```

**Fill in each function:**
- `initializeTikTok()` - Initialize the SDK
- `identifyUser()` - Identify users when they sign in
- `resetUser()` - Reset user when they sign out
- `trackAppOpened()` - Track app opened event
- `trackSignedIn()` - Track sign in event
- `trackSeenPaywall()` - Track paywall viewed event
- `trackPurchased()` - Track purchase event

Each function has detailed comments explaining what it should do.

## Event Names

All events use the "Pocketverse:" prefix:
- `Pocketverse: App Opened`
- `Pocketverse: Signed In`
- `Pocketverse: Seen Paywall`
- `Pocketverse: Purchased`

## Where Events Are Triggered

You don't need to modify these files - they're already set up:

- **App Opened**: `app/_layout.tsx` - When app initializes
- **Signed In**: `src/contexts/AuthContext.tsx` - When user signs in (Apple or Email)
- **Seen Paywall**: `app/paywall.tsx` - When paywall screen is displayed
- **Purchased**: `src/contexts/PremiumContext.tsx` - When user becomes premium

## Example Implementation

Here's an example of how to implement a function:

```typescript
export const trackAppOpened = async (): Promise<void> => {
  // Replace this with actual TikTok SDK call
  await TikTokSDK.track('Pocketverse: App Opened', {
    timestamp: new Date().toISOString(),
    app_name: 'Pocketverse',
  });
};
```

## Testing

1. Run the app: `npm start`
2. Perform actions that trigger events:
   - Open app (triggers "App Opened")
   - Sign in (triggers "Signed In")
   - View paywall (triggers "Seen Paywall")
   - Make purchase (triggers "Purchased")
3. Check TikTok Events Manager to verify events are being received

## Need Help?

- Check TikTok SDK documentation for React Native
- All functions in `src/services/tiktok.ts` have detailed comments
- Each function shows example implementation in comments



