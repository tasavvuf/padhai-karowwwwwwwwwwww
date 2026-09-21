import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "@/features/auth/store";

function AuthRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(auth)/index" as any);
  }, []);
  return null;
}

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (!isLoading && !isAuthenticated) {
    return <AuthRedirect />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="task/[id]" options={{ presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="task-create" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="focus-result" options={{ presentation: "card", animation: "fade" }} />
      <Stack.Screen name="partner-connect" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="settings/index" options={{ presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="settings/wallpaper" options={{ presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="settings/distractions" options={{ presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="settings/permissions" options={{ presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="settings/profile" options={{ presentation: "card", animation: "slide_from_right" }} />
    </Stack>
  );
}
