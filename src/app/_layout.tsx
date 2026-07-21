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

  />;
}
