import { Stack } from "expo-router";

export default function KpisLayout() {
  return (
    <Stack>
      <Stack.Screen name="kpis" options={{ title: "KPIs" }} />
    </Stack>
  );
}
