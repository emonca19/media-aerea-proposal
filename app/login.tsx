import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
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

  // Reanimated shared values for 120Hz support
  const fadeOpacity = useSharedValue(0);
  const scaleValue = useSharedValue(0.95);
  const logoRotation = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const keyboardTranslateY = useSharedValue(0);

  const validateEmail = useCallback((text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  }, []);
  // Entry animations optimized for 120Hz
  useEffect(() => {
    fadeOpacity.value = withTiming(1, { 
      duration: currentTheme.animation.duration.slow,
      easing: Easing.out(Easing.cubic)
    });
    
    scaleValue.value = withTiming(1, {
      duration: currentTheme.animation.duration.normal,
      easing: Easing.out(Easing.cubic)
    });

    // Start infinite rotation immediately for 120Hz smoothness
    logoRotation.value = withRepeat(
      withTiming(360, {
        duration: 3000, // 3 seconds for full rotation - optimal for 120Hz
        easing: Easing.linear,
      }),
      -1, // infinite repeat
      false
    );
  }, [currentTheme.animation.duration, fadeOpacity, scaleValue, logoRotation]);  // Keyboard handling - Platform-specific approach for optimal UX
  // Android: Custom Reanimated animation for fine control (avoids content shift issues)
  // iOS: Native KeyboardAvoidingView behavior (maintains system consistency)
  useEffect(() => {
    if (Platform.OS === "android") {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        (event) => {
          keyboardTranslateY.value = withTiming(-event.endCoordinates.height * 0.3, {
            duration: 200,
            easing: Easing.out(Easing.cubic)
          });
        }
      );

      const keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        () => {
          keyboardTranslateY.value = withTiming(0, {
            duration: 200,
            easing: Easing.out(Easing.cubic)
          });
        }
      );

      return () => {
        keyboardDidShowListener?.remove();
        keyboardDidHideListener?.remove();
      };
    }
  }, [keyboardTranslateY]);
  const handlePressIn = useCallback(() => {
    buttonScale.value = withSpring(currentTheme.animation.scale.pressed, {
      damping: 15,
      stiffness: 150,
    });
  }, [buttonScale, currentTheme.animation.scale]);

  const handlePressOut = useCallback(() => {
    buttonScale.value = withSpring(currentTheme.animation.scale.normal, {
      damping: 15,
      stiffness: 150,
    });
  }, [buttonScale, currentTheme.animation.scale]);

  const router = useRouter();

  const handleLogin = async () => {
    try {
      Keyboard.dismiss();
      setError("");
      setIsLoading(true);

      // Validation
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

      // Login attempt
      const { user } = await auth.login(email, password);

      // Success animation
      fadeOpacity.value = withTiming(0, {
        duration: currentTheme.animation.duration.fast,
      });

      setTimeout(() => {
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
      }, currentTheme.animation.duration.fast);

    } catch (error: any) {
      // Error animation with Reanimated
      buttonScale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
      setTimeout(() => {
        buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }, 100);

      setError(error.message || "Error al iniciar sesión");
      Alert.alert("Error", error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };  // Animated styles using Reanimated for 120Hz optimization
  const mainContentStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeOpacity.value,
      transform: [
        { scale: scaleValue.value },
        // Platform-specific keyboard handling:
        // - Android: Custom translation animation (prevents content shift issues)
        // - iOS: Native KeyboardAvoidingView handles translation
        ...(Platform.OS === "android" ? [{ translateY: keyboardTranslateY.value }] : []),
      ],
    };
  });

  const spinStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${logoRotation.value}deg` }],
    };
  });

  const formStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeOpacity.value,
      transform: [
        {
          translateY: interpolate(fadeOpacity.value, [0, 1], [50, 0]),
        },
      ],
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });  return (
    // Platform-specific keyboard avoidance:
    // iOS: padding behavior with native KeyboardAvoidingView
    // Android: height behavior as fallback, custom animation handles main logic
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      enabled={true}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient
          colors={["rgb(12,4,67)", "rgb(151,68,195)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Animated.View style={[styles.mainContent, mainContentStyle]}>
            <View style={styles.logoContainer}>
              <Animated.View
                style={[
                  {
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  spinStyle,
                ]}
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

            <Animated.View style={[styles.formContainer, formStyle]}>
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

              <Animated.View style={buttonStyle}>
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
    minHeight: "100%",
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
