import { useAuthStore } from "@/store/use-auth";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {

  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    const cleanup = initialize();

    return cleanup
  }, [])


  return <Stack
    screenOptions={{
      headerShown: false,
      statusBarStyle: 'dark',
      statusBarTranslucent: true
    }}

  >;
    <Stack.Screen name="index" />
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="(resident)" />
    <Stack.Screen name="(guard)" />
    <Stack.Screen name="(admin)" />
  </Stack>
}
