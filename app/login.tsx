import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Text,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Animaciones
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const logoRotate = useState(new Animated.Value(0))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  
  React.useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
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
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    // Animación de rotación continua durante la carga
    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    router.push('/');
  };

  const ContentWrapper = isWeb ? View : KeyboardAvoidingView;
  const contentProps = isWeb ? {} : { 
    behavior: (Platform.OS === 'ios' ? 'padding' : 'height') as 'padding' | 'height'
  };

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ContentWrapper 
      {...contentProps}
      style={styles.container}
    >
      <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
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
              Aerial Media
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a192f',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 0 : 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  mainContent: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: Platform.OS === 'web' ? 60 : 20,
  },
  logo: {
    width: Platform.OS === 'web' ? 150 : 120,
    height: Platform.OS === 'web' ? 150 : 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: Platform.OS === 'web' ? 42 : 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    fontFamily: Platform.OS === 'web' ? 'system-ui' : undefined,
    letterSpacing: 1,
  },
  subtitleText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: '#64ffda',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: Platform.OS === 'web' ? 40 : 20,
    backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    color: '#8892b0',
    fontSize: 14,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#8892b0',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#64ffda',
    padding: Platform.OS === 'web' ? 18 : 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#64ffda',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#0a192f',
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    color: '#8892b0',
    fontSize: 14,
  },
  signupLink: {
    color: '#64ffda',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
