// app/admin/(project-details)/_layout.tsx
import { Stack } from 'expo-router';

export default function ProjectDetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
  );
}