import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/features/auth/store";

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    if (user?.role === "partner") {
      return <Redirect href="/(app)/(tabs)/home" />;
    }
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="student/login" />
      <Stack.Screen name="student/register" />
      <Stack.Screen name="partner/login" />
      <Stack.Screen name="partner/register" />
    </Stack>
  );
}
