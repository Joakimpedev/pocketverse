// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure resolver to handle optional native modules
config.resolver = {
  ...config.resolver,
  // Allow optional dependencies (like expo-apple-authentication which requires native build)
  unstable_enablePackageExports: true,
};

module.exports = config;


