/**
 * Typography exports for easy importing across the application
 *
 * Usage:
 * import { fonts, typography, textStyles } from '@/src/styles';
 * import { getFontFamily, createTextStyle } from '@/src/styles';
 */

// Core font configuration
export {
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  typography,
} from "../constants/fonts";

// Typography utilities
export {
  combineTextStyles,
  createTextStyle,
  getFontFamily,
  quickFonts,
  textStyles,
} from "../utils/typography";

// Example styles for reference
export { exampleStyles } from "./examples";

// Type exports
export type { FontSize, FontWeight, Typography } from "../constants/fonts";
