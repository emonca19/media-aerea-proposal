import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="profile" options={{ title: "Perfil" }} />
      <Stack.Screen name="kpisdashboard" options={{ title: "KPIs" }} />
      <Stack.Screen name="report" options={{ title: "Reportes" }} />
    </Stack>
  );
}
