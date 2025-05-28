import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  AccessibilityRole,
  AccessibilityState,
  GestureResponderEvent,
  Image, // Added Image import
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  useWindowDimensions,
  View,
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

// Sidebar Navigation Item Component
interface SidebarItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  isActive,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginHorizontal: 8,
          borderRadius: 8,
          backgroundColor: isActive
            ? "#9C46CE"
            : pressed
            ? "#f5f5f5"
            : "transparent",
        },
      ]}
    >
      <Ionicons
        name={
          isActive
            ? icon
            : (`${icon}-outline` as keyof typeof Ionicons.glyphMap)
        }
        size={24}
        color={isActive ? "#ffffff" : "#666666"}
        style={{ marginRight: 12 }}
      />
      <Text
        style={{
          fontSize: 16,
          fontWeight: isActive ? "600" : "400",
          color: isActive ? "#ffffff" : "#333333",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// Sidebar Component for Web
const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Debug the current pathname if needed
  // console.log("Current pathname:", pathname);
  const navigationItems = [
    {
      label: "Inicio",
      icon: "home" as const,
      path: "/admin/dashboard",
      segment: "dashboard",
      patterns: ["/dashboard", "/(dashboard)"],
    },
    {
      label: "Tareas",
      icon: "checkbox" as const,
      path: "/admin/tasks",
      segment: "tasks",
      patterns: ["/assignments", "/(tasks)", "/pictures"],
    },
    {
      label: "Proyectos",
      icon: "document-text" as const,
      path: "/admin/projects/tabs",
      segment: "projects",
      patterns: ["/(projects)", "clients", "projects"],
    },
    {
      label: "Recursos",
      icon: "construct" as const,
      path: "/admin/resources",
      segment: "resources",
      patterns: ["/users", "/drones", "/cameras"],
    },
    {
      label: "Perfil",
      icon: "person" as const,
      path: "/admin/profile",
      segment: "profile",
      patterns: ["/profile", "/(profile)", "/kpisdashboard"],
    },
  ];

  return (
    <View
      style={{
        width: 250,
        backgroundColor: "#ffffff",
        borderRightWidth: 1,
        borderRightColor: "#e5e5e5",
        paddingTop: 20,
      }}
    >
      <ScrollView>
        <View style={{ paddingBottom: 20 }}>
          <View style={{ marginBottom: 0, alignItems: "center" }}>
            <Image
              source={require("../../assets/images/media-logo-web.png")}
              style={{
                width: 180,
                height: 50,
                resizeMode: "contain",
                marginBottom: 20,
              }}
            />
          </View>
          {navigationItems.map((item) => {
            // Enhanced active state detection for complex navigation
            let isActive = false;

            // Check direct path match first
            if (pathname === `/admin/${item.segment}`) {
              isActive = true;
            }
            // Then check if pathname starts with any of the patterns
            else {
              // Check the exact path with segment
              if (pathname.startsWith(`/admin/${item.segment}/`)) {
                isActive = true;
              }
              // Check for path containing any of the pattern identifiers
              else {
                for (const pattern of item.patterns) {
                  const adminPrefix = "/admin/";
                  // Handle [id] or /[id] patterns for single dynamic segments
                  if (
                    (pattern === "[id]" || pattern === "/[id]") &&
                    pathname.startsWith(adminPrefix)
                  ) {
                    const pathSuffix = pathname.substring(adminPrefix.length);
                    // Ensure pathSuffix is a single segment (non-empty and no slashes)
                    if (pathSuffix.length > 0 && !pathSuffix.includes("/")) {
                      isActive = true;
                      break; // Match found
                    }
                  } else if (
                    // Original conditions for other patterns
                    pathname.includes(pattern) ||
                    pathname.includes(`/admin${pattern}`) ||
                    pathname.includes(`/admin/${item.segment}${pattern}`)
                  ) {
                    isActive = true;
                    break; // Match found
                  }
                }
              }
            }

            return (
              <SidebarItem
                key={item.path}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                onPress={() => router.push(item.path as any)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

// Custom Layout Component that switches between sidebar and tabs
const ResponsiveAdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isTablet = width >= 768; // Tablet breakpoint

  if (isWeb || isTablet) {
    // Show sidebar layout for web and tablets
    return (
      <View
        style={{ flex: 1, flexDirection: "row", backgroundColor: "#ffffff" }}
      >
        <Sidebar />
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ flex: 1, width: "100%", maxWidth: 1200 }}>
            {children}
          </View>
        </View>
      </View>
    );
  }

  // Show bottom tabs for mobile
  return <>{children}</>;
};

export default function AdminLayout() {
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  if (isWeb || isTablet) {
    // Use sidebar layout for web and tablets
    return (
      <>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <ResponsiveAdminLayout>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: "none" }, // Hide tab bar on web/tablet
            }}
          >
            {" "}
            {/* All the existing tab screens */}
            <Tabs.Screen
              name="index"
              options={{ href: null }}
              listeners={{
                tabPress: (e: { preventDefault: () => void }) => {
                  e.preventDefault();
                  return <Redirect href="/admin/dashboard/dashboard" />;
                },
              }}
            />
            <Tabs.Screen
              name="dashboard"
              options={{
                title: "Inicio",
                sceneStyle: { backgroundColor: "#ffffff" },
              }}
            />
            <Tabs.Screen
              name="tasks"
              options={{
                title: "Tareas",
                sceneStyle: { backgroundColor: "#ffffff" },
              }}
            />
            <Tabs.Screen
              name="projects"
              options={{
                title: "Proyectos",
                sceneStyle: { backgroundColor: "#ffffff" },
              }}
            />
            <Tabs.Screen
              name="resources"
              options={{
                title: "Recursos",
                sceneStyle: { backgroundColor: "#ffffff" },
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: "Perfil",
                sceneStyle: { backgroundColor: "#ffffff" },
              }}
            />
            <Tabs.Screen name="reports" options={{ href: null }} />
            <Tabs.Screen name="turbine" options={{ href: null }} />
          </Tabs>
        </ResponsiveAdminLayout>
      </>
    );
  }

  // Use bottom tabs layout for mobile
  return (
    <>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#ffffff",
            elevation: 0,
            shadowOpacity: 0,
            height: Platform.OS === "ios" ? 90 : 65,
            borderBlockColor: "#ffffff",
          },
          tabBarActiveTintColor: "#9C46CE",
          tabBarInactiveTintColor: "#8f8f8f",
          tabBarButton: (tabBarProps) => (
            <AnimatedTabBarButton {...tabBarProps} />
          ),
        }}
      >
        {" "}
        {/* Redirección inicial */}
        <Tabs.Screen
          name="index"
          options={{ href: null }}
          listeners={{
            tabPress: (e: { preventDefault: () => void }) => {
              e.preventDefault();
              return <Redirect href="/admin/dashboard/dashboard" />;
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
          name="tasks"
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
          name="projects"
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
          name="resources"
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
        <Tabs.Screen name="reports" options={{ href: null }} />
        <Tabs.Screen name="turbine" options={{ href: null }} />
      </Tabs>
    </>
  );
}
