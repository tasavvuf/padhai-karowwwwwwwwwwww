import { DevTools } from "@/components/dev/dev-tools";
import { AppBackground } from "@/components/layout/app-background";
import { useAuthStore } from "@/features/auth/store";
import { useSettingsStore } from "@/features/settings/store";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryProvider } from "@/providers/query-provider";
import { configureNotifications } from "@/services/notifications";
import { startSyncService, stopSyncService } from "@/services/sync";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const { restoreSession } = useAuthStore();
  const { loadFromStorage } = useSettingsStore();

  useEffect(() => {
    Promise.all([restoreSession(), loadFromStorage()]).finally(() => {
      SplashScreen.hideAsync();
    });
  }, [restoreSession, loadFromStorage]);

  useEffect(() => {
    startSyncService();
    void configureNotifications();
    return stopSyncService;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <AppBackground />
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <DevTools />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="notifications" />
        </Stack>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}

