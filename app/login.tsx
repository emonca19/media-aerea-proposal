import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar"; // Import StatusBar from expo-status-bar
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { theme } from "../src/constants/theme";
import { useTheme } from "../src/hooks/useTheme";
import { auth } from "../src/services/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const currentTheme = useTheme();

  // Animaciones
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const logoRotate = useState(new Animated.Value(0))[0];
  const buttonScale = useState(new Animated.Value(1))[0];

  const validateEmail = useCallback((text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  }, []);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: currentTheme.animation.duration.slow,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: currentTheme.animation.duration.normal,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.spring(logoRotate, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, scaleAnim, logoRotate, currentTheme.animation.duration]);

  const handlePressIn = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: currentTheme.animation.scale.pressed,
      useNativeDriver: true,
    }).start();
  }, [buttonScale, currentTheme.animation.scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: currentTheme.animation.scale.normal,
      useNativeDriver: true,
    }).start();
  }, [buttonScale, currentTheme.animation.scale]);

  const router = useRouter();

  const handleLogin = async () => {
    try {
      Keyboard.dismiss();
      setError("");
      setIsLoading(true);

      if (!email) {
        throw new Error("Por favor ingresa tu correo electrónico");
      }
      if (!validateEmail(email)) {
        throw new Error("Por favor ingresa un correo electrónico válido");
      }
      if (!password) {
        throw new Error("Por favor ingresa tu contraseña");
      }
      if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }

      const { user } = await auth.login(email, password);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: currentTheme.animation.duration.fast,
        useNativeDriver: true,
      }).start(() => {
        switch (user.role) {
          case "PILOT":
            router.replace("/pilot/dashboard");
            break;
          case "ADMIN":
          case "SUPER_ADMIN":
            router.replace("/admin/dashboard/dashboard");
            break;
          default:
            throw new Error("Rol no válido");
        }
      });
    } catch (error: any) {
      Animated.sequence([
        Animated.spring(buttonScale, {
          toValue: 0.9,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      setError(error.message || "Error al iniciar sesión");
      Alert.alert("Error", error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoRotate, {
        toValue: 5,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 3,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 10,
        duration: 15000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoRotate]);

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <>
      {/* StatusBar configuration specific to LoginScreen */}
      {/* This will make the status bar transparent and the text/icons light */}
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={styles.container}
        enabled={Platform.OS !== "web"}
      >
        <TouchableWithoutFeedback
          onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss}
        >
          <LinearGradient
            colors={["#0C0443", "#9744C3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient} // Ensure this style allows gradient to fill the entire screen
          >
            <Animated.View
              style={[
                styles.mainContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <Animated.View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [{ rotate: spin }],
                  }}
                >
                  <Image
                    source={require("../assets/images/spin.png")}
                    style={styles.spinImage}
                    resizeMode="contain"
                  />
                </Animated.View>

                <Image
                  source={require("../assets/images/media-logo.png")}
                  style={styles.mediaLogo}
                  resizeMode="contain"
                />
              </View>

              <Animated.View
                style={[
                  styles.formContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Correo electrónico</Text>
                  <TextInput
                    style={[
                      styles.input,
                      showEmailError &&
                        !validateEmail(email) && { borderColor: "#ff6b6b" },
                    ]}
                    placeholder="nombre@mediaaerea.com"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (showEmailError) {
                        setShowEmailError(true);
                      }
                    }}
                    onBlur={() => setShowEmailError(true)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                  />
                  {showEmailError && !validateEmail(email) && email !== "" && (
                    <Text style={styles.errorText}>
                      Por favor ingresa un correo electrónico válido
                    </Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="********"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                  />
                </View>

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[
                      styles.loginButton,
                      isLoading && styles.loginButtonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    <Text style={styles.loginButtonText}>
                      {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </Animated.View>
            </Animated.View>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}

// ... your styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9744C3", // Fallback color for older devices
  },
  gradient: {
    flex: 1, // Ensures the gradient fills the KeyboardAvoidingView
    justifyContent: "center",
    alignItems: "center",
    padding: theme.dark.dimensions.spacing.xl,
  },
  mainContent: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 0,
  },
  spinImage: {
    width: 110,
    height: 110,
    marginBottom: 0,
  },
  mediaLogo: {
    width: 250,
    height: 250,
    marginTop: -90,
    marginBottom: -50,
  },
  formContainer: {
    width: "100%",
    padding: theme.dark.dimensions.spacing.xl,
    borderRadius: theme.dark.dimensions.borderRadius.large,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    // backdropFilter: "blur(10px)", // Note: backdropFilter is not universally supported in React Native
  },
  inputContainer: {
    marginBottom: theme.dark.dimensions.spacing.lg,
  },
  inputLabel: {
    color: "#ffffff",
    marginBottom: theme.dark.dimensions.spacing.xs,
    fontSize: theme.dark.dimensions.fontSize.sm,
    fontWeight: "600",
    marginStart: 5,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.dark.dimensions.borderRadius.medium,
    color: "white",
    paddingHorizontal: theme.dark.dimensions.spacing.md,
    paddingVertical: theme.dark.dimensions.spacing.sm,
    fontSize: theme.dark.dimensions.fontSize.md,
    height: 48,
    marginTop: 7,
  },
  loginButton: {
    marginTop: 16,
    backgroundColor: "rgb(151,68,195)",
    borderRadius: theme.dark.dimensions.borderRadius.medium,
    paddingVertical: theme.dark.dimensions.spacing.md,
    marginBottom: theme.dark.dimensions.spacing.md,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "white",
    fontSize: theme.dark.dimensions.fontSize.md,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "#fff48d",
    fontSize: theme.dark.dimensions.fontSize.sm,
    marginTop: theme.dark.dimensions.spacing.xs,
    marginStart: 5,
  },
});