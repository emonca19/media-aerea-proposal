import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    AccessibilityRole,
    AccessibilityState,
    Animated,
    GestureResponderEvent,
    Platform,
    Pressable,
    SafeAreaView,
    StyleProp,
    View,
    ViewStyle
} from 'react-native';
import {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

// Define the props for the custom tab bar button
interface CustomTabBarButtonProps {
  children: React.ReactNode;
  to?: string;
  onPress?: (
    e: GestureResponderEvent | React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => void;
  onLongPress?: ((e: GestureResponderEvent) => void) | null | undefined;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  style?: StyleProp<ViewStyle>;
  // Allow any other props that might be passed through
  [key: string]: any;
}

// Custom Tab Bar Button Component with Animation
const AnimatedTabBarButton: React.FC<CustomTabBarButtonProps> = (props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    };
  });

  const handlePress = (
    event:
      | GestureResponderEvent
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    scale.value = withTiming(
      0.95,
      { duration: 80, easing: Easing.inOut(Easing.ease) },
      () => {
        scale.value = withTiming(
          1.05,
          { duration: 120, easing: Easing.inOut(Easing.ease) },
          () => {
            scale.value = withTiming(1, {
              duration: 100,
              easing: Easing.inOut(Easing.ease),
            });
          }
        );
      }
    );

    if (props.onPress) {
      props.onPress(event);
    }
  };

  const {
    children,
    onLongPress,
    testID,
    accessibilityLabel,
    accessibilityRole,
    accessibilityState,
    style,
  } = props;

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress ?? undefined}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      android_ripple={{ color: "transparent" }}
      style={({ pressed }) => [
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 4,
        },
        style,
        Platform.OS === "ios" && pressed ? { opacity: 1 } : {},
      ]}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
};

// ... (imports y AnimatedTabBarButton sin cambios)

export default function PilotLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#ffffff",
              borderTopColor: "#ffffff",
              elevation: 0,
              shadowOpacity: 0,
              height: Platform.OS === 'ios' ? 60 : 70,
              paddingBottom: Platform.OS === 'ios' ? 5 : 5,
              paddingTop: 8,
              borderBlockColor: "#ffffff", // Asegúrate que sea borderTopColor si es solo la línea superior
            },
            tabBarActiveTintColor: "#3b82f6",
            tabBarInactiveTintColor: "#8f8f8f",
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "600",
              marginTop: 4,
              textAlign: 'center', // Centra el texto dentro de su propio contenedor
              width: '100%',     // Hace que el contenedor de la etiqueta ocupe el ancho completo disponible
            },
            tabBarButton: (tabBarProps) => (
              <AnimatedTabBarButton {...tabBarProps} />
            ),
          }}
        >
          {/* Tus Tabs.Screen ... */}
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Inicio",
              sceneStyle: { backgroundColor: "#ffffff" },
              tabBarIcon: ({ color, size, focused }) => (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30, // Mantén un ancho fijo para el contenedor del icono si lo deseas
                  height: 30,
                  // display: 'flex' // View es flex por defecto, no es necesario
                }}>
                  <Ionicons
                    name={focused ? "home" : "home-outline"}
                    size={24}
                    color={color}
                    // style={{ textAlign: 'center', alignSelf: 'center' }} // alignSelf: 'center' es bueno, textAlign no aplica a Ionicons
                  />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="activity-log"
            options={{
              title: 'Historial',
              sceneStyle: { backgroundColor: "#ffffff" },
              tabBarIcon: ({ color, size, focused }) => (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                }}>
                  <Ionicons
                    name={focused ? "time" : "time-outline"}
                    size={24}
                    color={color}
                  />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="components/project-info-menu"
            options={{
              title: 'Proyecto',
              sceneStyle: { backgroundColor: "#ffffff" },
              tabBarIcon: ({ color, size, focused }) => (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                }}>
                  <Ionicons
                    name={focused ? "folder" : "folder-outline"}
                    size={24}
                    color={color}
                  />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Perfil",
              sceneStyle: { backgroundColor: "#ffffff" },
              tabBarIcon: ({ color, size, focused }) => (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                }}>
                  <Ionicons
                    name={focused ? "person" : "person-outline"}
                    size={24}
                    color={color}
                  />
                </View>
              ),
            }}
          />
          {/* ... el resto de tus Tabs.Screen con href: null */}
            <Tabs.Screen name="statistics" options={{ href: null }} />
            <Tabs.Screen name="incidents" options={{ href: null }} />
            <Tabs.Screen name="preflight-checklist" options={{ href: null }} />
            <Tabs.Screen name="project-history" options={{ href: null }} />
            <Tabs.Screen name="components/pilot-dashboard" options={{ href: null }} />
            <Tabs.Screen name="components/header-info-card" options={{ href: null }} />
            <Tabs.Screen name="components/alerts-display-card" options={{ href: null }} />
            <Tabs.Screen name="components/my-indicators-button" options={{ href: null }} />
            <Tabs.Screen name="components/project-details-card" options={{ href: null }} />          
            <Tabs.Screen name="components/new-activity-formmodal" options={{ href: null }} />
            <Tabs.Screen name="components/new-incident-formmodal" options={{ href: null }} />
            <Tabs.Screen name="components/incident-form-modal" options={{ href: null }} />
            <Tabs.Screen name="components/quick-actions-menu-card" options={{ href: null }} />
            <Tabs.Screen name="components/quick-register-activity-form" options={{ href: null }} />
            <Tabs.Screen name="new-incident" options={{ href: null }} />
            <Tabs.Screen name="calendar" options={{ href: null }} />
            <Tabs.Screen name="site-map" options={{ href: null }} />
            <Tabs.Screen name="turbines-status" options={{ href: null }} />
            <Tabs.Screen name="support-chat" options={{ href: null }} />
             <Tabs.Screen name="turbines" options={{ href: null }} />
            <Tabs.Screen name="notifications" options={{ href: null }} />
            <Tabs.Screen name="project-details" options={{ href: null }} />
            <Tabs.Screen name="components/activity-timeline" options={{ href: null }} />
            <Tabs.Screen name="components/activity-control" options={{ href: null }}/>
            <Tabs.Screen name="components/activity-suggestions-card" options={{ href: null }} />
            <Tabs.Screen name="blade-inspection-detail" options={{ href: null }} />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}