import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "primary";
  size?: "sm" | "md";
}

export function Badge({ label, variant = "default", size = "sm" }: BadgeProps) {
  const colors = useThemeColors();

  const getBg = () => {
    switch (variant) {
      case "success": return colors.success + "18";
      case "warning": return colors.warning + "20";
      case "danger": return colors.danger + "18";
      case "primary": return colors.primary + "18";
      default: return colors.surface2;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "success": return colors.success;
      case "warning": return colors.warning;
      case "danger": return colors.danger;
      case "primary": return colors.primary;
      default: return colors.text2;
    }
  };

  return (
    <View
      style={{
        backgroundColor: getBg(),
        borderRadius: 9999,
        paddingVertical: size === "sm" ? 4 : 6,
        paddingHorizontal: size === "sm" ? 10 : 14,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          color: getTextColor(),
          fontSize: size === "sm" ? 11 : 13,
          fontWeight: "600",
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
