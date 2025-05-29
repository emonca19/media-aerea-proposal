/**
 * Design System Constants
 * Centralizes all colors, spacing, shadows, and common styles
 * to ensure visual consistency across the entire application
 */

export const COLORS = {
  // Background colors
  background: {
    primary: '#ffffff',        // Main white background
    secondary: '#f8fafc',     // Very light gray
    card: '#ffffff',          // White for cards
    elevated: '#ffffff',      // White for elevated components
  },
  
  // Text colors
  text: {
    primary: '#1f2937',       // Dark gray for main text
    secondary: '#6b7280',     // Medium gray for secondary text
    muted: '#9ca3af',         // Light gray for muted text
    white: '#ffffff',         // White text
  },
  
  // Primary brand colors
  primary: {
    main: '#8b5cf6',          // Purple
    light: '#a78bfa',         // Light purple
    dark: '#7c3aed',          // Dark purple
    background: '#f3e8ff',    // Very light purple background
    border: '#e9d5ff',        // Light purple border
  },
  
  // Status colors
  status: {
    success: '#10b981',       // Green
    successBg: '#d1fae5',     // Light green background
    warning: '#f59e0b',       // Amber
    warningBg: '#fef3c7',     // Light amber background
    error: '#ef4444',         // Red
    errorBg: '#fee2e2',       // Light red background
    info: '#3b82f6',          // Blue
    infoBg: '#dbeafe',        // Light blue background
  },
  
  // Border colors
  border: {
    light: '#f3f4f6',         // Very light border
    medium: '#e5e7eb',        // Medium border
    dark: '#d1d5db',          // Dark border
  },
  
  // Shadow colors
  shadow: {
    light: '#00000008',       // Very light shadow
    medium: '#00000015',      // Medium shadow
    dark: '#00000025',        // Dark shadow
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  // Light shadow for subtle elevation
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  // Medium shadow for cards
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  
  // Strong shadow for modals and important elements
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const COMMON_STYLES = {
  // Screen container that all screens should use
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  
  // Content container with consistent padding
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  
  // Standard card style
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.medium,
  },
  
  // Compact card style
  cardCompact: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.light,
  },
  
  // Header style
  header: {
    backgroundColor: COLORS.background.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    ...SHADOWS.light,
  },
  
  // Section title style
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  
  // Body text style
  bodyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  
  primaryButtonText: {
    color: COLORS.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Input style
  input: {
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 14,
    color: COLORS.text.primary,
  },
};

export const LAYOUT = {
  // Max width for content on large screens
  maxContentWidth: 420,
  
  // Standard margins
  margin: {
    screen: SPACING.lg,
    section: SPACING.xl,
    card: SPACING.lg,
  },
  
  // Standard paddings
  padding: {
    screen: SPACING.lg,
    card: SPACING.lg,
    section: SPACING.md,
  },
};
