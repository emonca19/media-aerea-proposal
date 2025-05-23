import { Stack } from 'expo-router';

export default function ResourceLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Resources' }} />
        </Stack>
    );
}