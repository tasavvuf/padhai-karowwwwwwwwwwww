import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { AlertTriangle } from "lucide-react-native";

interface InterruptionBannerProps {
  appName: string;
  secondsLeft?: number;
}

export function InterruptionBanner({ appName, secondsLeft }: InterruptionBannerProps) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        backgroundColor: colors.danger + "15",
        borderRadius: 12,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <AlertTriangle size={18} color={colors.danger} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.danger }}>
          {appName} detected
        </Text>
        <Text style={{ fontSize: 12, color: colors.text2, marginTop: 2 }}>
          {secondsLeft !== undefined
            ? `Return to study in ${secondsLeft}s`
            : "Return to your study session"}
        </Text>
      </View>
    </View>
  );
}
