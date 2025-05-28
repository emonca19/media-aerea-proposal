import { Platform } from "react-native";
import { fonts, typography } from "./fonts";

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
      xxl: Platform.OS === "web" ? 42 : 32,
    },
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
    },
  },
} as const;

const darkColors = {
  primary: "#3b82f6", // Azul más vibrante
  secondary: "#8b5cf6", // Púrpura más vibrante
  background: "#f8fafc", // Fondo claro
  card: "rgba(255, 255, 255, 0.9)",
  text: "#1e293b", // Texto oscuro para fondo claro
  textSecondary: "#64748b",
  border: "#e2e8f0",
  accent: "#06b6d4", // Cyan vibrante
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  gradient: {
    start: "#3b82f6",
    end: "#8b5cf6",
  },
} as const;

const lightColors = {
  primary: "#1a237e",
  background: "#ffffff",
  elevated: "#ffffff",
  card: "#ffffff",
  border: "#e1e1e1",
  text: "#0a192f",
  textSecondary: "#666666",
  accent: "#64ffda",
  error: "#d32f2f",
  success: "#43a047",
  warning: "#f57c00",
  input: "#f5f5f7",
  gradients: {
    primary: ["#64ffda", "#4db6ac", "#26a69a"],
    success: ["#81c784", "#66bb6a", "#4caf50"],
    danger: ["#e57373", "#ef5350", "#f44336"],
  },
} as const;

export const theme = {
  dark: {
    ...darkColors,
    fonts,
    typography,
    dimensions: baseTheme.dimensions,
    animation: baseTheme.animation,
  },
  light: {
    ...lightColors,
    fonts,
    typography,
    dimensions: baseTheme.dimensions,
    animation: baseTheme.animation,
  },
} as const;
