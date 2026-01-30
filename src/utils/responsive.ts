import { Dimensions, PixelRatio } from 'react-native';

// Base dimensions (standard iPhone dimensions)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Get current screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints for different screen sizes
export const BREAKPOINTS = {
  SMALL: 320,    // Very small screens (iPad compatibility mode, older phones)
  MEDIUM: 375,   // Standard iPhone
  LARGE: 414,    // Larger iPhones
} as const;

// Check if we're on a small screen
export const isSmallScreen = SCREEN_WIDTH < BREAKPOINTS.MEDIUM;
export const isVerySmallScreen = SCREEN_WIDTH < BREAKPOINTS.SMALL;

/**
 * Scale a value based on screen width relative to base width
 * Use for horizontal dimensions (widths, horizontal margins/paddings)
 */
export const scaleWidth = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scale a value based on screen height relative to base height
 * Use for vertical dimensions (heights, vertical margins/paddings)
 */
export const scaleHeight = (size: number): number => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderate scaling - less aggressive than linear scaling
 * Good for fonts and elements that shouldn't shrink too much
 * @param size - The base size
 * @param factor - How much to moderate the scaling (0 = no scaling, 1 = full scaling)
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size + (scale - 1) * size * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scale font size with a minimum floor to maintain readability
 * Scales down for small screens but never below the minimum
 */
export const scaleFontSize = (size: number, minSize?: number): number => {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1); // Only scale down, never up
  const newSize = size * scale;
  const minimum = minSize ?? Math.max(size * 0.75, 10); // Default minimum is 75% of original or 10
  return Math.round(Math.max(newSize, minimum));
};

/**
 * Get responsive value based on screen width breakpoints
 * Allows specifying different values for different screen sizes
 */
export const responsiveValue = <T>(
  small: T,
  medium: T,
  large?: T
): T => {
  if (SCREEN_WIDTH < BREAKPOINTS.SMALL) {
    return small;
  } else if (SCREEN_WIDTH < BREAKPOINTS.MEDIUM) {
    return small;
  } else if (SCREEN_WIDTH < BREAKPOINTS.LARGE) {
    return medium;
  } else {
    return large ?? medium;
  }
};

/**
 * Get scaled padding/margin that adapts to screen size
 * Maintains proportions but has a minimum to keep UI usable
 */
export const scaleSpacing = (size: number): number => {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1); // Only scale down
  const newSize = size * scale;
  const minimum = Math.max(size * 0.6, 4); // Never go below 60% or 4
  return Math.round(Math.max(newSize, minimum));
};

/**
 * Get scaled icon size with minimum floor
 */
export const scaleIconSize = (size: number): number => {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1);
  const newSize = size * scale;
  const minimum = Math.max(size * 0.7, 14); // Icons should stay readable
  return Math.round(Math.max(newSize, minimum));
};

/**
 * Get responsive dimensions object for common UI elements
 */
export const getResponsiveDimensions = () => {
  return {
    // Font sizes
    fonts: {
      title: scaleFontSize(28, 22),
      header: scaleFontSize(22, 18),
      body: scaleFontSize(16, 14),
      small: scaleFontSize(14, 12),
      tiny: scaleFontSize(12, 10),
    },
    // Spacing
    spacing: {
      xs: scaleSpacing(4),
      sm: scaleSpacing(8),
      md: scaleSpacing(12),
      lg: scaleSpacing(16),
      xl: scaleSpacing(20),
      xxl: scaleSpacing(24),
    },
    // Icon sizes
    icons: {
      small: scaleIconSize(16),
      medium: scaleIconSize(20),
      large: scaleIconSize(24),
      xlarge: scaleIconSize(32),
    },
    // Button heights
    buttons: {
      height: scaleSpacing(48),
      padding: scaleSpacing(16),
      borderRadius: scaleSpacing(12),
    },
    // Card padding
    cards: {
      padding: scaleSpacing(20),
      borderRadius: scaleSpacing(12),
    },
    // Screen info
    screen: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      isSmall: isSmallScreen,
      isVerySmall: isVerySmallScreen,
    },
  };
};

// Export screen dimensions for convenience
export { SCREEN_WIDTH, SCREEN_HEIGHT };











