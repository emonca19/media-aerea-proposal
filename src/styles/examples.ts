import { StyleSheet } from "react-native";
import { fonts, typography } from "../constants/fonts";
import { createTextStyle, textStyles } from "../utils/typography";

/**
 * Example stylesheet demonstrating how to use Inter fonts in your components
 * This file serves as a reference and can be copied to create new stylesheets
 */

export const exampleStyles = StyleSheet.create({
  // Method 1: Using predefined typography styles
  screenTitle: {
    ...typography.heading1,
    color: "#1f2937",
    marginBottom: 16,
  },

  sectionTitle: {
    ...typography.heading3,
    color: "#374151",
    marginBottom: 12,
  },

  bodyText: {
    ...typography.body,
    color: "#6b7280",
    lineHeight: 24,
  },

  // Method 2: Using textStyles (pre-compiled StyleSheet)
  cardTitle: {
    ...textStyles.heading4,
    color: "#111827",
    marginBottom: 8,
  },

  caption: {
    ...textStyles.caption,
    color: "#9ca3af",
  },

  // Method 3: Direct font family assignment
  customText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: "#374151",
  },

  // Method 4: Using the createTextStyle helper
  buttonText: createTextStyle("semiBold", {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
  }),

  // Common UI element styles with Inter font
  navigationTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: "#111827",
  },

  tabBarLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  inputLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },

  inputText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: "#111827",
  },

  errorText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#ef4444",
  },

  successText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#10b981",
  },

  // Card styles
  cardHeader: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: "#111827",
    marginBottom: 8,
  },

  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },

  cardContent: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },

  // List item styles
  listItemTitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: "#111827",
  },

  listItemSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#6b7280",
  },

  // Status and badge styles
  statusActive: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#10b981",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statusInactive: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#ef4444",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  badge: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: "#ffffff",
    textAlign: "center",
  },

  // Form styles
  formTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: "#111827",
    marginBottom: 16,
  },

  formDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 24,
  },

  // Dashboard styles
  metricValue: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: "#111827",
  },

  metricLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Date and time styles
  dateText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: "#6b7280",
  },

  timeText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: "#374151",
  },
});

/**
 * Usage examples in components:
 *
 * // Using predefined styles:
 * <Text style={exampleStyles.screenTitle}>Welcome</Text>
 *
 * // Combining with custom styles:
 * <Text style={[exampleStyles.bodyText, { textAlign: 'center' }]}>Content</Text>
 *
 * // Using typography directly:
 * <Text style={[typography.heading2, { color: theme.colors.primary }]}>Title</Text>
 *
 * // Using textStyles:
 * <Text style={[textStyles.heading3, customStyles.myStyle]}>Heading</Text>
 */
