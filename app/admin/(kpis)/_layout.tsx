import { Stack } from 'expo-router';

export default function KpisLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'KPIs' }} />
        </Stack>
    );
}


