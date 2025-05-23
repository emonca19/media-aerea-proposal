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
        tabBarInactiveTintColor: "#a7a7a7",
        tabBarIndicatorStyle: styles.tabBarIndicator,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarPressColor: "transparent", // Add this line to remove ripple effect on Android
        tabBarPressOpacity: 1, // Add this line to remove opacity change on iOS
      }}
    >
      <MaterialTopTabs.Screen
        name="active-projects"
        options={{
          title: "Proyectos Activos",
        }}
      />
      <MaterialTopTabs.Screen
        name="clients"
        options={{
          title: "Clientes",
        }}
      />
      <MaterialTopTabs.Screen
        name="parks"
        options={{
          title: "Parques",
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
    fontSize: 15, // Increased font size
    fontWeight: "700", // Increased font weight
  },
  tabBarIndicator: {
    backgroundColor: "#9C46CE",
  },
});
