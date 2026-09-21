import React from "react";
import { View, Text, type ViewProps } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, size = 44, color }: AvatarProps) {
  const colors = useThemeColors();
  const bgColor = color || colors.primary;
  const initial = name?.[0]?.toUpperCase() ?? "?";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor + "20",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.4, fontWeight: "700", color: bgColor }}>
        {initial}
      </Text>
    </View>
  );
}
