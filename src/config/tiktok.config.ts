/**
 * TikTok SDK Configuration
 * 
 * DEVELOPER SETUP:
 * 1. Add your TikTok API key/credentials below
 * 2. You can use environment variables: TIKTOK_APP_SECRET
 * 3. Add any other TikTok-specific configuration options here
 */

export const tiktokConfig = {
  // TODO: Add your TikTok API key here
  // Example: apiKey: process.env.TIKTOK_APP_SECRET || 'your-api-key-here',
  appId: process.env.APP_ID || "6757653873",
  tiktokAppId: process.env.TIKTOK_APP_ID || "7600319590375194632",
  tiktokAppSecret: process.env.TIKTOK_APP_SECRET || "TT6bkthbTeyJLK1MfNU0mMwLnUoRHf86",

  // Add any other TikTok SDK configuration options below
  // Example: appId, accessToken, etc. (check TikTok SDK documentation)
};

