import { Stack } from "expo-router";
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
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
