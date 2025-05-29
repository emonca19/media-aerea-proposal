import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

// This interface is used when creating the CrossPlatformAlert component
export interface CrossPlatformAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onDismiss?: () => void;
}

// Global state for the alert
let alertState: AlertState = {
  visible: false,
  title: "",
  message: "",
  buttons: [],
};

let setAlertState: React.Dispatch<React.SetStateAction<AlertState>> | null =
  null;

const CrossPlatformAlert: React.FC = () => {
  const [state, setState] = useState<AlertState>(alertState);

  React.useEffect(() => {
    setAlertState = setState;
    return () => {
      setAlertState = null;
    };
  }, []);

  const handleButtonPress = (button: AlertButton) => {
    setState((prev) => ({ ...prev, visible: false }));
    if (button.onPress) {
      button.onPress();
    }
    if (state.onDismiss) {
      state.onDismiss();
    }
  };

  const handleBackdropPress = () => {
    // Only dismiss if there's a cancel button or no buttons
    const hasCancelButton = state.buttons.some(
      (button) => button.style === "cancel"
    );
    if (hasCancelButton || state.buttons.length === 0) {
      setState((prev) => ({ ...prev, visible: false }));
      if (state.onDismiss) {
        state.onDismiss();
      }
    }
  };

  if (!state.visible) {
    return null;
  }

  return (
    <Modal
      visible={state.visible}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
        <View style={styles.alertContainer}>
          <View style={styles.alertContent}>
            <Text style={styles.title}>{state.title}</Text>
            {state.message ? (
              <Text style={styles.message}>{state.message}</Text>
            ) : null}
          </View>

          {state.buttons.length > 0 && (
            <View style={styles.buttonContainer}>
              {state.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === "destructive" && styles.destructiveButton,
                    button.style === "cancel" && styles.cancelButton,
                    index > 0 && styles.buttonMargin,
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === "destructive" &&
                        styles.destructiveButtonText,
                      button.style === "cancel" && styles.cancelButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Main alert function - this replaces Alert.alert
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: { cancelable?: boolean }
) => {
  // If on native mobile, use the native Alert
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Alert.alert(title, message, buttons, options);
    return;
  }

  // For web, use our custom alert
  const defaultButtons: AlertButton[] =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: "OK", style: "default" }];

  if (setAlertState) {
    alertState = {
      visible: true,
      title,
      message,
      buttons: defaultButtons,
    };
    setAlertState({ ...alertState });
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    backgroundColor: "white",
    borderRadius: 14,
    minWidth: 270,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertContent: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: "#000",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5E5",
    flexDirection: "row",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonMargin: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: "#E5E5E5",
  },
  buttonText: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "400",
  },
  cancelButton: {
    // Cancel button styling (if needed)
  },
  cancelButtonText: {
    fontWeight: "600",
  },
  destructiveButton: {
    // Destructive button styling (if needed)
  },
  destructiveButtonText: {
    color: "#FF3B30",
  },
});

export default CrossPlatformAlert;
