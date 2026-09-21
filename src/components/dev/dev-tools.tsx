import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useFocusStore } from "@/features/focus/store";
import { Wifi, WifiOff, Database, Smartphone } from "lucide-react-native";

export function DevTools() {
  const colors = useThemeColors();
  const isOnline = useOnlineStatus();
  const { activeSession, isMockMode } = useFocusStore();

  if (!__DEV__) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 6,
        backgroundColor: colors.surface2,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {isOnline ? (
          <Wifi size={12} color={colors.success} />
        ) : (
          <WifiOff size={12} color={colors.danger} />
        )}
        <Text style={{ fontSize: 10, color: colors.text3, fontWeight: "500" }}>
          {isOnline ? "Online" : "Offline"}
        </Text>
      </View>

      {activeSession && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Smartphone size={12} color={colors.primary} />
          <Text style={{ fontSize: 10, color: colors.text3, fontWeight: "500" }}>
            {activeSession.status}
          </Text>
        </View>
      )}

      {isMockMode && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Database size={12} color={colors.warning} />
          <Text style={{ fontSize: 10, color: colors.warning, fontWeight: "500" }}>
            Mock
          </Text>
        </View>
      )}
    </View>
  );
}
