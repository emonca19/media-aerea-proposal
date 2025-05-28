import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="kpisdashboard"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
    
  );
}
