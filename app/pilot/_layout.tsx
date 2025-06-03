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
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ActivityProvider } from "../contexts/ActivityContext";

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
  [key: string]: any;
}


const AnimatedTabBarButton: React.FC<CustomTabBarButtonProps> = (props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
     
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
        style, 
        Platform.OS === "ios" && pressed ? { opacity: 1 } : {}, 
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
                borderTopColor: "#ffffff",
                shadowOpacity: 0,
                height: Platform.OS === "ios" ? 90 : 75, 
                borderBlockColor: "#ffffff", 
              },
              tabBarActiveTintColor: "#9C46CE", 
              tabBarInactiveTintColor: "#8f8f8f", 
              tabBarButton: (tabBarProps) => (
                <AnimatedTabBarButton {...tabBarProps} />
              ),
            }}
          >
            <Tabs.Screen
              name="dashboard/index"
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
              name="features/activity-management/activity-history/activity-log"
              options={{
                title: "Historial",
                sceneStyle: { backgroundColor: "#ffffff" },
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons
                    name={focused ? "time" : "time-outline"}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="features/project-management/project-info-menu"
              options={{
                title: "Proyecto",
                sceneStyle: { backgroundColor: "#ffffff" },
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons
                    name={focused ? "folder" : "folder-outline"}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="features/user-profile/profile"
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

            <Tabs.Screen name="statistics/statistics" options={{ href: null }} />
            <Tabs.Screen name="incidents/incidents" options={{ href: null }} />
            <Tabs.Screen name="calendar/preflight-checklist" options={{ href: null }} />
            <Tabs.Screen name="features/activity-management/add-activity/activity-suggestions-card" options={{ href: null }} />
            <Tabs.Screen name="dashboard/dashboard" options={{ href: null }} />
            <Tabs.Screen name="features/activity-management/activity-control/activity-control" options={{ href: null }} />
            <Tabs.Screen name="features/shared-components/alerts-display" options={{ href: null }} />
            <Tabs.Screen name="features/dashboard/main-dashboard/pilot-dashboard" options={{ href: null }} />
            <Tabs.Screen name="features/dashboard/quick-actions/quick-actions-menu" options={{ href: null }} />
            <Tabs.Screen name="turbines/blade-inspection-detail" options={{ href: null }} />
            <Tabs.Screen name="features/project-management/project-details-card" options={{ href: null }} />
            <Tabs.Screen name="features/shared-components/indicators-button" options={{ href: null }} />
            <Tabs.Screen name="features/project-management/project-details" options={{ href: null }} />
            <Tabs.Screen name="features/project-management/project-history" options={{ href: null }} />
            <Tabs.Screen name="incidents/new-incident" options={{ href: null }} />
            <Tabs.Screen name="calendar/calendar" options={{ href: null }} />
            <Tabs.Screen name="maps/site-map" options={{ href: null }} />
            <Tabs.Screen name="turbines/turbines-status" options={{ href: null }} />
            <Tabs.Screen name="support/support-chat" options={{ href: null }} />
            <Tabs.Screen name="turbines/turbines" options={{ href: null }} />
            <Tabs.Screen name="notifications/notifications" options={{ href: null }} />
            <Tabs.Screen name="features/incident-management/report-incident/new-incident-form" options={{ href: null }} />
            <Tabs.Screen name="features/incident-management/report-incident/incident-modal" options={{ href: null }} />
            <Tabs.Screen name="features/activity-management/add-activity/new-activity-modal" options={{ href: null }} />
            <Tabs.Screen name="features/activity-management/add-activity/quick-register-form" options={{ href: null }} />
            <Tabs.Screen name="features/activity-management/activity-timeline/activity-timeline" options={{ href: null }} />
          </Tabs>
        </View>
    </ActivityProvider>
  );
}