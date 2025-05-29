import { Stack, useSegments } from "expo-router"; // Import useSegments
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CrossPlatformAlert from "../src/components/CrossPlatformAlert";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const insets = useSafeAreaInsets();
  const segments = useSegments(); // Get current route segments

  // Determine if the current screen is the login screen.
  // This checks if the last segment of the route path is 'login'.
  const currentRouteName = segments.length > 0 ? segments[segments.length - 1] : "";
  const isLoginScreen = currentRouteName === "login";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 
        Conditionally apply paddingTop. 
        For the login screen, paddingTop will be 0, allowing its content 
        (and specifically the LinearGradient) to extend to the top edge.
        For other screens, insets.top will provide the necessary padding.
      */}
      <View style={{ flex: 1, paddingTop: isLoginScreen ? 0 : insets.top }}>
        {/* 
          This StatusBar component sets the default style for all screens.
          The LoginScreen will render its own StatusBar component to override these defaults.
        */}
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="pilot"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="admin"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        <CrossPlatformAlert />
      </View>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  SplashScreen.hideAsync();

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}