import { StyleSheet, TextStyle } from "react-native";
import { fonts, FontWeight, typography } from "../constants/fonts";

/**
 * Utility functions for applying typography styles consistently across the app
 */

/**
 * Get font family by weight
 */
export const getFontFamily = (weight: FontWeight = "regular"): string => {
  return fonts[weight];
};

/**
 * Create text styles with Inter font family
 */
export const createTextStyle = (
  weight: FontWeight = "regular",
  additionalStyles?: Partial<TextStyle>
): TextStyle => {
  return {
    fontFamily: getFontFamily(weight),
    ...additionalStyles,
  };
};

/**
 * Pre-defined typography styles with Inter font
 */
export const textStyles = StyleSheet.create({
  // Headings
  heading1: {
    ...typography.heading1,
  },
  heading2: {
    ...typography.heading2,
  },
  heading3: {
    ...typography.heading3,
  },
  heading4: {
    ...typography.heading4,
  },

  // Body text
  body: {
    ...typography.body,
  },
  bodyMedium: {
    ...typography.bodyMedium,
  },

  // Small text
  caption: {
    ...typography.caption,
  },
  captionMedium: {
    ...typography.captionMedium,
  },
  small: {
    ...typography.small,
  },

  // Interactive elements
  button: {
    ...typography.button,
  },
  buttonLarge: {
    ...typography.buttonLarge,
  },

  // Common font families (for custom styling)
  fontRegular: {
    fontFamily: fonts.regular,
  },
  fontMedium: {
    fontFamily: fonts.medium,
  },
  fontSemiBold: {
    fontFamily: fonts.semiBold,
  },
  fontBold: {
    fontFamily: fonts.bold,
  },
});

/**
 * Helper to combine text styles with custom styles
 */
export const combineTextStyles = (
  baseStyle: keyof typeof textStyles,
  customStyles?: TextStyle | TextStyle[]
): TextStyle[] => {
  const base = textStyles[baseStyle];
  if (!customStyles) return [base];
  if (Array.isArray(customStyles)) return [base, ...customStyles];
  return [base, customStyles];
};

/**
 * Quick access font styles for common use cases
 */
export const quickFonts = {
  regular: { fontFamily: fonts.regular },
  medium: { fontFamily: fonts.medium },
  semiBold: { fontFamily: fonts.semiBold },
  bold: { fontFamily: fonts.bold },
} as const;
