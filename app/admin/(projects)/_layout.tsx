import { Stack } from "expo-router";

export default function ProjectsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          presentation: "card", // This gives a nice slide animation
        }}
      />
    </Stack>
  );
}
