import { Stack } from "expo-router";

export default function TasksLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
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
          presentation: "card",
        }}
      />
    </Stack>
  );
}
