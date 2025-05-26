# Inter Font Implementation Guide

This guide explains how to use the Inter font throughout the Media Aerea React Native application.

## Files Created

1. **`src/constants/fonts.ts`** - Core font configuration and typography definitions
2. **`src/utils/typography.ts`** - Utility functions for working with fonts
3. **`src/styles/examples.ts`** - Example styles showing different usage patterns
4. **`src/styles/index.ts`** - Centralized exports for easy importing
5. **`app/_layout.tsx`** - Updated to load Inter fonts

## Usage Methods

### Method 1: Using Predefined Typography (Recommended)

Import typography from constants and use predefined styles:

```tsx
import { typography } from "@/src/styles";

const styles = StyleSheet.create({
  title: {
    ...typography.heading1,
    color: "#111827",
  },
  body: {
    ...typography.body,
    color: "#6b7280",
  },
});
```

### Method 2: Using Pre-compiled Text Styles

Import textStyles for optimized StyleSheet usage:

```tsx
import { textStyles } from "@/src/styles";

const styles = StyleSheet.create({
  title: {
    ...textStyles.heading2,
    color: "#111827",
  },
  caption: {
    ...textStyles.caption,
    color: "#9ca3af",
  },
});
```

### Method 3: Direct Font Family Assignment

For custom styling, use font families directly:

```tsx
import { fonts } from "@/src/styles";

const styles = StyleSheet.create({
  customText: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: "#374151",
  },
});
```

### Method 4: Using Helper Functions

Use utility functions for dynamic font application:

```tsx
import { createTextStyle, getFontFamily } from "@/src/styles";

const styles = StyleSheet.create({
  dynamicText: createTextStyle("medium", {
    fontSize: 16,
    color: "#111827",
  }),

  anotherText: {
    fontFamily: getFontFamily("bold"),
    fontSize: 20,
  },
});
```

## Available Font Weights

- `fonts.regular` → 'Inter_400Regular'
- `fonts.medium` → 'Inter_500Medium'
- `fonts.semiBold` → 'Inter_600SemiBold'
- `fonts.bold` → 'Inter_700Bold'

## Typography Presets

- `typography.heading1` → Bold, 32px, 44px line-height
- `typography.heading2` → Bold, 24px, 36px line-height
- `typography.heading3` → SemiBold, 20px, 32px line-height
- `typography.heading4` → SemiBold, 18px, 28px line-height
- `typography.body` → Regular, 16px, 24px line-height
- `typography.bodyMedium` → Medium, 16px, 24px line-height
- `typography.caption` → Regular, 14px, 20px line-height
- `typography.captionMedium` → Medium, 14px, 20px line-height
- `typography.small` → Regular, 12px, 16px line-height
- `typography.button` → Medium, 16px, 24px line-height
- `typography.buttonLarge` → SemiBold, 18px, 28px line-height

## Quick Start

To add Inter font to an existing component:

1. Import the styles you need:

   ```tsx
   import { typography, fonts } from "@/src/styles";
   ```

2. Update your StyleSheet:

   ```tsx
   const styles = StyleSheet.create({
     title: {
       ...typography.heading2,
       color: "#111827",
       marginBottom: 16,
     },
     description: {
       fontFamily: fonts.regular,
       fontSize: 16,
       color: "#6b7280",
       lineHeight: 24,
     },
   });
   ```

3. Use in your component:
   ```tsx
   <Text style={styles.title}>Welcome</Text>
   <Text style={styles.description}>Your description text</Text>
   ```

## Migration Examples

### Before (without Inter):

```tsx
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
});
```

### After (with Inter):

```tsx
import { fonts } from "@/src/styles";

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: "#111827",
  },
});
```

### Or using typography presets:

```tsx
import { typography } from "@/src/styles";

const styles = StyleSheet.create({
  title: {
    ...typography.heading3,
    color: "#111827",
  },
});
```

## Best Practices

1. **Use typography presets** when possible for consistency
2. **Import from the index file** (`@/src/styles`) for cleaner imports
3. **Combine with existing styles** using the spread operator
4. **Use meaningful font weights** (regular for body text, medium for emphasis, semiBold for headings, bold for titles)
5. **Consider line-height** for better readability

## Troubleshooting

If fonts are not loading:

1. Ensure the app is restarted after font changes
2. Check that fonts are properly loaded in `_layout.tsx`
3. Clear cache: `npx expo start --clear`

The Inter font is now ready to use throughout your application!
