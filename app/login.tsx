import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { theme } from '../src/constants/theme';
import { useTheme } from '../src/hooks/useTheme';
import { auth } from '../src/services/auth';

const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const currentTheme = useTheme();
  
  // Animaciones
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const logoRotate = useState(new Animated.Value(0))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  
  // Email validación
  const [isEmailValid, setIsEmailValid] = useState(true);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const validateEmail = useCallback((text: string) => {
    const isValid = emailRegex.test(text);
    setIsEmailValid(isValid);
    return isValid;
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
    setIsButtonPressed(true);
    Animated.spring(buttonScale, {
      toValue: currentTheme.animation.scale.pressed,
      useNativeDriver: true,
    }).start();
  }, [buttonScale, currentTheme.animation.scale]);

  const handlePressOut = useCallback(() => {
    setIsButtonPressed(false);
    Animated.spring(buttonScale, {
      toValue: currentTheme.animation.scale.normal,
      useNativeDriver: true,
    }).start();
  }, [buttonScale, currentTheme.animation.scale]);

  const router = useRouter();

  const handleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      
      // Validación mejorada
      if (!email) {
        throw new Error('Por favor ingresa tu correo electrónico');
      }
      if (!validateEmail(email)) {
        throw new Error('Por favor ingresa un correo electrónico válido');
      }
      if (!password) {
        throw new Error('Por favor ingresa tu contraseña');
      }
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
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
        })
      ]).start(() => {
        // Redirigir según rol
        switch (user.role) {
          case 'PILOT':
            router.replace('/pilot/dashboard');
            break;
          case 'ADMIN':
          case 'SUPER_ADMIN':
            router.replace('/admin/parks');
            break;
          default:
            throw new Error('Rol no válido');
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

      setError(error.message || 'Error al iniciar sesión');
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };
  const ContentWrapper = isWeb ? View : KeyboardAvoidingView;
  const contentProps: Partial<KeyboardAvoidingViewProps> = isWeb ? {} : {
    behavior: (Platform.OS === 'ios' ? 'padding' : 'height') as KeyboardAvoidingViewProps['behavior'],
    keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20
  };

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Generar estilos dependientes del tema dentro del componente
  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    gradient: {
      flex: 1,
      paddingHorizontal: Platform.OS === 'web' ? 0 : currentTheme.dimensions.spacing.lg,
      paddingTop: Platform.OS === 'ios' ? currentTheme.dimensions.spacing.xl : currentTheme.dimensions.spacing.lg,
    },
    mainContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: 400,
      width: '100%',
      alignSelf: 'center',
      paddingHorizontal: theme.dark.dimensions.spacing.md,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.dark.dimensions.spacing.xl,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: theme.dark.dimensions.spacing.md,
    },
    welcomeText: {
      fontSize: theme.dark.dimensions.fontSize.xxl,
      fontWeight: 'bold',
      color: theme.dark.text,
      marginBottom: theme.dark.dimensions.spacing.xs,
    },
    subtitleText: {
      fontSize: theme.dark.dimensions.fontSize.md,
      color: theme.dark.textSecondary,
      marginBottom: theme.dark.dimensions.spacing.lg,
    },
    formContainer: {
      width: '100%',
      padding: theme.dark.dimensions.spacing.lg,
      borderRadius: theme.dark.dimensions.borderRadius.large,
      backgroundColor: theme.dark.elevated,
    },
    inputContainer: {
      marginBottom: theme.dark.dimensions.spacing.md,
    },
    inputLabel: {
      color: theme.dark.textSecondary,
      marginBottom: theme.dark.dimensions.spacing.xs,
      fontSize: theme.dark.dimensions.fontSize.sm,
    },
    input: {
      backgroundColor: theme.dark.input,
      borderWidth: 1,
      borderColor: theme.dark.border,
      borderRadius: theme.dark.dimensions.borderRadius.medium,
      color: theme.dark.text,
      paddingHorizontal: theme.dark.dimensions.spacing.md,
      paddingVertical: theme.dark.dimensions.spacing.sm,
      fontSize: theme.dark.dimensions.fontSize.md,
      height: theme.dark.dimensions.inputHeight,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: theme.dark.dimensions.spacing.lg,
    },
    forgotPasswordText: {
      color: theme.dark.primary,
      fontSize: theme.dark.dimensions.fontSize.sm,
    },
    loginButton: {
      backgroundColor: theme.dark.primary,
      borderRadius: theme.dark.dimensions.borderRadius.medium,
      paddingVertical: theme.dark.dimensions.spacing.md,
      marginBottom: theme.dark.dimensions.spacing.md,
      height: theme.dark.dimensions.inputHeight,
      justifyContent: 'center',
    },
    loginButtonDisabled: {
      opacity: 0.5,
    },
    loginButtonText: {
      color: theme.dark.background,
      fontSize: theme.dark.dimensions.fontSize.md,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.dark.dimensions.spacing.md,
    },
    signupText: {
      color: theme.dark.textSecondary,
      fontSize: theme.dark.dimensions.fontSize.sm,
    },
    signupLink: {
      color: theme.dark.primary,
      fontSize: theme.dark.dimensions.fontSize.sm,
      fontWeight: 'bold',
    },
  }), [currentTheme]);

  return (
    <ContentWrapper 
      {...contentProps}
      style={styles.container}
    >      <LinearGradient
        colors={currentTheme.gradients.primary}
        style={styles.gradient}
      >
        <Animated.View 
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Animated.View style={{
              transform: [{ rotate: spin }]
            }}>
              <Image
                source={require('../assets/images/adaptive-icon.png')}
                style={styles.logo}
              />
            </Animated.View>
            <Animated.Text 
              style={[
                styles.welcomeText,
                {
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }
                  ]
                }
              ]}
            >
              mediaaerea
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.subtitleText,
                {
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }
                  ]
                }
              ]}
            >
              Control de Flota de Drones
            </Animated.Text>
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
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="nombre@empresa.com"
                placeholderTextColor="#a0a0a0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu contraseña segura"
                placeholderTextColor="#a0a0a0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[
                styles.loginButton, 
                isLoading && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Animated.View style={{
                transform: [{ scale: buttonScale }],
                width: '100%',
                alignItems: 'center',
              }}>
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Iniciando sesión...' : 'Acceder al Panel'}
                </Text>
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿Primera vez aquí? </Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Solicitar acceso</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </ContentWrapper>
  );
}
