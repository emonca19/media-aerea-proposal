import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
    // Animación de entrada mejorada
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
      Keyboard.dismiss(); // Ocultar el teclado al iniciar el login
      setError("");
      setIsLoading(true);

      // Validación mejorada
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

      // Intento de login con animación
      const { user } = await auth.login(email, password);

      // Animación de éxito
      Animated.sequence([
        Animated.spring(logoRotate, {
          toValue: 4,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: currentTheme.animation.duration.fast,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Redirigir según rol
        switch (user.role) {
          case "PILOT":
            router.replace("/pilot/dashboard");
            break;
          case "ADMIN":
          case "SUPER_ADMIN":
            router.replace("/admin/dashboard");
            break;
          default:
            throw new Error("Rol no válido");
        }
      });
    } catch (error: any) {
      // Animación de error
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
  }; // We handle KeyboardAvoidingView behavior directly in the render

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoRotate, {
        toValue: 5, // Primera etapa: lenta
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1, // Segunda etapa: rápida
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 3, // Tercera etapa: lenta
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 10, // Etapa final: desaceleración suave
        duration: 15000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoRotate]);

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"], // Gira continuamente
  });

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : Platform.OS === "android"
          ? "height"
          : undefined
      } // Disable behavior for web
      style={styles.container}
      enabled={Platform.OS !== "web"} // Disable KAV entirely for web
    >
      <TouchableWithoutFeedback
        onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss}
      >
        <LinearGradient
          colors={["rgb(12,4,67)", "rgb(151,68,195)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
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
                      // Solo validamos si ya se mostró un error previamente
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(12,4,67)",
  },
  gradient: {
    flex: 1,
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
    marginBottom: 0, // Espaciado mínimo
  },
  mediaLogoContainer: {
    alignItems: "center",
    marginBottom: 0, // Reduced spacing
  },
  mediaLogo: {
    width: 250,
    height: 250,
    marginTop: -90, // Espaciado mínimo
    marginBottom: -50, // Espaciado mínimo
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 0,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontSize: theme.dark.dimensions.fontSize.md,
    color: "rgb(162,179,201)",
    marginBottom: 0,
  },
  formContainer: {
    width: "100%",
    padding: theme.dark.dimensions.spacing.xl,
    borderRadius: theme.dark.dimensions.borderRadius.large,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
  forgotPassword: {
    marginTop: -12,
    alignSelf: "flex-start",
    marginBottom: theme.dark.dimensions.spacing.xl,
  },
  forgotPasswordText: {
    color: "rgb(162,179,201)",
    fontSize: theme.dark.dimensions.fontSize.sm,
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
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.dark.dimensions.spacing.lg,
  },
  signupText: {
    color: "rgb(162,179,201)",
    marginTop: -25,
    fontSize: theme.dark.dimensions.fontSize.sm,
  },
  signupLink: {
    color: "rgb(194, 213, 238)",
    fontSize: theme.dark.dimensions.fontSize.sm,
    fontWeight: "bold",
    marginTop: -25,
    marginLeft: 4,
  },
  errorText: {
    color: "#fff48d",
    fontSize: theme.dark.dimensions.fontSize.sm,
    marginTop: theme.dark.dimensions.spacing.xs,
    marginStart: 5,
  },
});
