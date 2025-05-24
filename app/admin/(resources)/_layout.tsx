import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Constants from "expo-constants";
import { withLayoutContext } from "expo-router";
import { StyleSheet } from "react-native";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarActiveTintColor: "#9C46CE",
        tabBarInactiveTintColor: "#8f8f8f",
        tabBarIndicatorStyle: styles.tabBarIndicator,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarPressColor: "transparent", // Add this line to remove ripple effect on Android
        tabBarPressOpacity: 1, // Add this line to remove opacity change on iOS
      }}
    >
      <MaterialTopTabs.Screen
        name="users"
        options={{
          title: "Usuarios",
        }}
      />
      <MaterialTopTabs.Screen
        name="drones"
        options={{
          title: "Drones",
        }}
      />
    </MaterialTopTabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    paddingTop: Constants.statusBarHeight, // Reduced paddingTop
    // Add these lines to remove shadow/elevation
    elevation: 0, // for Android
    shadowOpacity: 0, // for iOS
    borderBottomWidth: 1, // Add this line for the bottom border width
    borderBottomColor: "#E0E0E0", // Add this line for a light gray border color
  },
  tabBarLabel: {
    fontSize: 15, // Increased font size
    fontWeight: "700", // Increased font weight
  },
  tabBarIndicator: {
    height: 3,
    backgroundColor: "#9C46CE",
    borderRadius: 25,
  },
});
