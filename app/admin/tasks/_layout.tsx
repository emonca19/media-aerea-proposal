import { Ionicons } from "@expo/vector-icons";
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
        tabBarInactiveTintColor: "#a7a7a7",
        tabBarIndicatorStyle: styles.tabBarIndicator,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarPressColor: "transparent", // Add this line to remove ripple effect on Android
        tabBarPressOpacity: 1, // Add this line to remove opacity change on iOS
      }}
    >
      <MaterialTopTabs.Screen
        name="assignments"
        options={{
          tabBarLabel: ({
            focused,
            color,
          }: {
            focused: boolean;
            color: string;
          }) => (
            <View style={styles.tabLabelContainer}>
              <Ionicons
                name="clipboard-outline"
                size={18}
                color={color}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabBarLabelText, { color }]}>
                Asignaciones
              </Text>
            </View>
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="pictures"
        options={{
          tabBarLabel: ({
            focused,
            color,
          }: {
            focused: boolean;
            color: string;
          }) => (
            <View style={styles.tabLabelContainer}>
              <Ionicons
                name="camera-outline"
                size={18}
                color={color}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabBarLabelText, { color }]}>Fotos</Text>
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
    paddingTop: Constants.statusBarHeight, // Reduced paddingTop
  },
  tabBarLabel: {
    fontSize: 16, // Increased font size
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
