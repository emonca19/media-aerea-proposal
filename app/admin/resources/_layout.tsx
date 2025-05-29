import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Constants from "expo-constants";
import { withLayoutContext } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

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
          tabBarLabel: ({
            focused,
            color,
          }: {
            focused: boolean;
            color: string;
          }) => (
            <View style={styles.tabLabelContainer}>
              <MaterialCommunityIcons
                name="account-outline"
                size={18}
                color={color}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabBarLabelText, { color }]}>Usuarios</Text>
            </View>
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="drones"
        options={{
          tabBarLabel: ({
            focused,
            color,
          }: {
            focused: boolean;
            color: string;
          }) => (
            <View style={styles.tabLabelContainer}>
              <MaterialCommunityIcons
                name="drone"
                size={18}
                color={color}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabBarLabelText, { color }]}>Drones</Text>
            </View>
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="cameras"
        options={{
          tabBarLabel: ({
            focused,
            color,
          }: {
            focused: boolean;
            color: string;
          }) => (
            <View style={styles.tabLabelContainer}>
              <MaterialCommunityIcons
                name="camera-outline"
                size={18}
                color={color}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabBarLabelText, { color }]}>Cámaras</Text>
            </View>
          ),
        }}
      />
    </MaterialTopTabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    elevation: 0, // for Android
    shadowOpacity: 0, // for iOS
    borderBottomWidth: 1, // Add this line for the bottom border width
    borderBottomColor: "#E0E0E0", // Add this line for a light gray border color
  },
  tabBarLabel: {
    fontSize: 15, // Increased font size
    fontWeight: "700", // Increased font weight
  },
  tabBarLabelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  tabBarIndicator: {
    height: 3,
    backgroundColor: "#9C46CE",
    borderRadius: 25,
  },
  tabLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    marginRight: 6,
  },
});
