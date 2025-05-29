import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  AccessibilityRole,
  AccessibilityState,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
// Import Animated and other reanimated hooks from 'react-native-reanimated'
// This replaces 'import { Animated } from "react-native";'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Import the ActivityProvider
import { ActivityProvider } from "../contexts/ActivityContext";

// Define the props for the custom tab bar button
// Updated to match admin's props (added 'to')
interface CustomTabBarButtonProps {
  children: React.ReactNode;
  to?: string; // Added to match admin
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
// Modified to be identical to admin's AnimatedTabBarButton
const AnimatedTabBarButton: React.FC<CustomTabBarButtonProps> = (props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      // Ensure the Animated.View takes up space and centers its content
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      // Removed paddingVertical: 8 from here (was in pilot, not in admin)
    };
  });

  const handlePress = (
    event:
      | GestureResponderEvent
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    // Spring-like effect: quick shrink, bounce larger, then settle
    // This animation logic is identical to admin's
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

  // Destructure known props for Pressable
  const {
    children,
    onLongPress,
    testID,
    accessibilityLabel,
    accessibilityRole,
    accessibilityState,
    style, // This 'style' comes from expo-router (tabBarItemStyle)
  } = props;

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress ?? undefined}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      android_ripple={{ color: "transparent" }} // Consistent with admin
      style={({ pressed }) => [
        style, // Original style from Expo Router (applied to Pressable)
        Platform.OS === "ios" && pressed ? { opacity: 1 } : {}, // iOS pressed opacity
        // Removed the extra style block that was here in pilot:
        // { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4, }
        // The centering is now handled by Animated.View's style
      ]}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
};

export default function PilotLayout() {
  return (
    <ActivityProvider>
        <StatusBar style="dark" backgroundColor="#f0f2f5" />
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: "#ffffff",
                borderTopColor: "#ffffff", // Consistent with admin
                elevation: 0,
                shadowOpacity: 0,
                height: Platform.OS === "ios" ? 90 : 75, // Matched admin's height
                borderBlockColor: "#ffffff", // Consistent with admin
                // Removed paddingBottom and paddingTop from here (admin does not have them)
              },
              tabBarActiveTintColor: "#9C46CE", // Matched admin's active tint color
              tabBarInactiveTintColor: "#8f8f8f", // Already consistent
              // Removed tabBarLabelStyle from here (admin does not define it at this level)
              // Label styling (like font size) will now rely on defaults or specific screen options if needed.
              // The AnimatedTabBarButton will handle centering of icon and label.
              tabBarButton: (tabBarProps) => (
                <AnimatedTabBarButton {...tabBarProps} />
              ),
            }}
          >
            <Tabs.Screen
              name="dashboard"
              options={{
                title: "Inicio",
                sceneStyle: { backgroundColor: "#ffffff" },
                tabBarIcon: ({ color, size, focused }) => ( // Use 'size' from props
                  <Ionicons
                    name={focused ? "home" : "home-outline"}
                    size={size} // Use the size provided by Tabs, not hardcoded
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="activity-log"
              options={{
                title: "Historial",
                sceneStyle: { backgroundColor: "#ffffff" },
                tabBarIcon: ({ color, size, focused }) => ( // Use 'size' from props
                  <Ionicons
                    name={focused ? "time" : "time-outline"}
                    size={size} // Use the size provided by Tabs
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="components/project-info-menu"
              options={{
                title: "Proyecto",
                sceneStyle: { backgroundColor: "#ffffff" },
                tabBarIcon: ({ color, size, focused }) => ( // Use 'size' from props
                  <Ionicons
                    name={focused ? "folder" : "folder-outline"}
                    size={size} // Use the size provided by Tabs
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
                tabBarIcon: ({ color, size, focused }) => ( // Use 'size' from props
                  <Ionicons
                    name={focused ? "person" : "person-outline"}
                    size={size} // Use the size provided by Tabs
                    color={color}
                  />
                ),
              }}
            />
            {/* Screens to hide from tab bar (href: null) - these remain unchanged */}
            <Tabs.Screen name="statistics" options={{ href: null }} />
            <Tabs.Screen name="incidents" options={{ href: null }} />
            <Tabs.Screen name="preflight-checklist" options={{ href: null }} />
            <Tabs.Screen name="project-history" options={{ href: null }} />
            <Tabs.Screen
              name="components/pilot-dashboard"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/header-info-card"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/alerts-display-card"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/my-indicators-button"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/project-details-card"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/new-activity-formmodal"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/new-incident-formmodal"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/incident-form-modal"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/quick-actions-menu-card"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/quick-register-activity-form"
              options={{ href: null }}
            />
            <Tabs.Screen name="new-incident" options={{ href: null }} />
            <Tabs.Screen name="calendar" options={{ href: null }} />
            <Tabs.Screen name="site-map" options={{ href: null }} />
            <Tabs.Screen name="turbines-status" options={{ href: null }} />
            <Tabs.Screen name="support-chat" options={{ href: null }} />
            <Tabs.Screen name="turbines" options={{ href: null }} />
            <Tabs.Screen name="notifications" options={{ href: null }} />
            <Tabs.Screen name="project-details" options={{ href: null }} />
            <Tabs.Screen
              name="components/activity-timeline"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/activity-control"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="components/activity-suggestions-card"
              options={{ href: null }}
            />
            <Tabs.Screen
              name="blade-inspection-detail"
              options={{ href: null }}
            />
          </Tabs>
        </View>
    </ActivityProvider>
  );
}