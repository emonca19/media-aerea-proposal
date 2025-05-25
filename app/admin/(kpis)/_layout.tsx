import { Stack } from "expo-router";

export default function KpisLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ title: "Dashboard KPIs" }} />
      <Stack.Screen name="report" options={{ title: "Reportes" }} />
    </Stack>
  );
}
