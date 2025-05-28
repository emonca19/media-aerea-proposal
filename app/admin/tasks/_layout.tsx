import { Stack } from "expo-router";

export default function TasksLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {" "}
      <Stack.Screen
        name="tabs"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="assignment"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="assignment-details"
        options={{
          headerShown: false,
          presentation: "card", // This gives a nice slide animation
        }}
      />
      {/* Future stacked screens can be added here */}
    </Stack>
  );
}
