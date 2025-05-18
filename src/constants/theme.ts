import { Platform } from 'react-native';

const baseTheme = {
  dimensions: {
    inputHeight: 50,
    borderRadius: {
      small: 8,
      medium: 12,
      large: 20,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: Platform.OS === 'web' ? 42 : 32,
    }
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    scale: {
      pressed: 0.95,
      normal: 1,
    }
  }
} as const;

const animation = baseTheme.animation;

const darkColors = {
  primary: '#64ffda',
  background: '#0a192f',
  elevated: 'rgba(255, 255, 255, 0.05)',
  card: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#fff',
  textSecondary: '#8892b0',
  accent: '#1a237e',
  error: '#ff6b6b',
  success: '#4caf50',
  warning: '#ff9800',
  input: 'rgba(255, 255, 255, 0.1)',
  gradients: {
    primary: ['#1a237e', '#0d47a1', '#01579b'],
    success: ['#43a047', '#2e7d32', '#1b5e20'],
    danger: ['#d32f2f', '#c62828', '#b71c1c'],
  }
} as const;

const lightColors = {
  primary: '#1a237e',
  background: '#f5f5f7',
  elevated: '#ffffff',
  card: '#ffffff',
  border: '#e1e1e1',
  text: '#0a192f',
  textSecondary: '#666666',
  accent: '#64ffda',
  error: '#d32f2f',
  success: '#43a047',
  warning: '#f57c00',
  input: '#f5f5f7',
  gradients: {
    primary: ['#64ffda', '#4db6ac', '#26a69a'],
    success: ['#81c784', '#66bb6a', '#4caf50'],
    danger: ['#e57373', '#ef5350', '#f44336'],
  }
} as const;

export const theme = {
  dark: {
    ...darkColors,
    dimensions: baseTheme.dimensions,
    animation: baseTheme.animation,
  },
  light: {
    ...lightColors,
    dimensions: baseTheme.dimensions,
    animation: baseTheme.animation,
  }
} as const;
