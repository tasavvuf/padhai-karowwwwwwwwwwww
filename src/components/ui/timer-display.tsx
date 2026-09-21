import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { formatDuration } from "@/lib/date";

interface TimerDisplayProps {
  elapsedMs: number;
  targetMs?: number;
  size?: "sm" | "md" | "lg";
  showTarget?: boolean;
}

export function TimerDisplay({
  elapsedMs,
  targetMs,
  size = "lg",
  showTarget = true,
}: TimerDisplayProps) {
  const colors = useThemeColors();

  const fontSize = useMemo(() => {
    switch (size) {
      case "sm": return { main: 28, label: 11, target: 14 };
      case "md": return { main: 40, label: 13, target: 16 };
      case "lg": return { main: 56, label: 15, target: 18 };
      default: return { main: 56, label: 15, target: 18 };
    }
  }, [size]);

  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <Text
        style={{
          fontSize: fontSize.main,
          fontWeight: "200",
          color: colors.text,
          fontVariant: ["tabular-nums"],
          letterSpacing: 2,
        }}
      >
        {formatDuration(elapsedMs)}
      </Text>
      {showTarget && targetMs !== undefined && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={{
              fontSize: fontSize.label,
              color: colors.text3,
              fontWeight: "500",
            }}
          >
            of
          </Text>
          <Text
            style={{
              fontSize: fontSize.target,
              color: colors.text2,
              fontWeight: "600",
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatDuration(targetMs)}
          </Text>
        </View>
      )}
    </View>
  );
}
