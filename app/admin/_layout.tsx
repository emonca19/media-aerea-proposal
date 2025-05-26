import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import {
  AccessibilityRole,
  AccessibilityState,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Define the props for the custom tab bar button
// This interface should be compatible with the props passed by expo-router's Tabs
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
      // Ensure the Animated.View takes up space and centers its content
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    };
  });

  const handlePress = (
    event:
      | GestureResponderEvent
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    // Spring-like effect: quick shrink, bounce larger, then settle
    scale.value = withTiming(
      0.95, // Changed from 0.9
      { duration: 80, easing: Easing.inOut(Easing.ease) },
      () => {
        scale.value = withTiming(
          1.05, // Changed from 1.1
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

  // Destructure known props for Pressable, pass others via style or specific handling if needed
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
      onLongPress={onLongPress ?? undefined} // Ensure undefined if null for Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      android_ripple={{ color: "transparent" }} // Changed to transparent
      style={({ pressed }) => [
        style, // Original style from Expo Router
        Platform.OS === "ios" && pressed ? { opacity: 1 } : {}, // iOS pressed opacity
      ]}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
};

export default function AdminLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#ffffff",
            elevation: 0,
            shadowOpacity: 0,
            height: 75,
            borderBlockColor: "#ffffff",
          },
          tabBarActiveTintColor: "#9C46CE",
          tabBarInactiveTintColor: "#8f8f8f",
          tabBarButton: (tabBarProps) => (
            <AnimatedTabBarButton {...tabBarProps} />
          ),
        }}
      >
        {/* Redirección inicial */}
        <Tabs.Screen
          name="index"
          options={{ href: null }}
          listeners={{
            tabPress: (e: { preventDefault: () => void }) => {
              e.preventDefault();
              return <Redirect href="/admin/dashboard" />;
            },
          }}
        />

        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Inicio",
            sceneStyle: { backgroundColor: "#ffffff" },
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="(tasks)"
          options={{
            title: "Tareas",
            sceneStyle: { backgroundColor: "#ffffff" },
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "checkbox" : "checkbox-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="(projects)"
          options={{
            title: "Proyectos",
            sceneStyle: { backgroundColor: "#ffffff" },
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="(resources)"
          options={{
            title: "Recursos",
            sceneStyle: { backgroundColor: "#ffffff" },
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "construct" : "construct-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            sceneStyle: { backgroundColor: "#ffffff" },
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* Screens to hide from tab bar */}
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="[turbineId]" options={{ href: null }} />
        <Tabs.Screen name="project-details" options={{ href: null }} />
        <Tabs.Screen name="reports" options={{ href: null }} />
        <Tabs.Screen name="turbine" options={{ href: null }} />
        <Tabs.Screen name="(kpis)" options={{ href: null }} />
      </Tabs>
    </>
  );
}
