/**
 * Font configuration for the Media Aerea application
 * Uses Inter font family with different weights
 */

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
} as const;

// Font size scale following design system best practices
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

// Line height scale for better readability
export const lineHeights = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  "2xl": 36,
  "3xl": 44,
  "4xl": 52,
  "5xl": 60,
} as const;

// Typography presets combining font family, size, and line height
export const typography = {
  heading1: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["3xl"],
    lineHeight: lineHeights["3xl"],
  },
  heading2: {
    fontFamily: fonts.bold,
    fontSize: fontSizes["2xl"],
    lineHeight: lineHeights["2xl"],
  },
  heading3: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
  },
  heading4: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
  },
  bodyMedium: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  captionMedium: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  small: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
  button: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
  },
  buttonLarge: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
  },
} as const;

export type FontWeight = keyof typeof fonts;
export type FontSize = keyof typeof fontSizes;
export type Typography = keyof typeof typography;
