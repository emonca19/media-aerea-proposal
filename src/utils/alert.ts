import { Platform, Alert } from "react-native";
import { AlertButton, showAlert } from "../components/CrossPlatformAlert";

interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
}

/**
 * Cross-platform alert utility that works on both web and mobile
 * On mobile: Uses React Native's native Alert.alert
 * On web: Uses custom modal implementation
 */
export const alert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
) => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    // Use native Alert for mobile platforms
    Alert.alert(title, message, buttons, options);
  } else {
    // Use custom alert for web
    showAlert(title, message, buttons, options);
  }
};

// Export for easy importing
export default alert;
