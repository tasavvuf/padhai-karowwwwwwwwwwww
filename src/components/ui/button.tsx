import React from "react";
import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/hooks/use-theme";

interface ButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();

  const getBg = () => {
    if (disabled) return colors.surface3;
    switch (variant) {
      case "primary": return colors.primary;
      case "secondary": return colors.surface2;
      case "ghost": return "transparent";
      case "danger": return colors.danger;
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.text3;
    switch (variant) {
      case "primary": return "#FFFFFF";
      case "secondary": return colors.text;
      case "ghost": return colors.primary;
      case "danger": return "#FFFFFF";
      default: return "#FFFFFF";
    }
  };

  const getPadding = () => {
    switch (size) {
      case "sm": return { paddingVertical: 9, paddingHorizontal: 18 };
      case "md": return { paddingVertical: 14, paddingHorizontal: 26 };
      case "lg": return { paddingVertical: 16, paddingHorizontal: 32 };
      default: return { paddingVertical: 14, paddingHorizontal: 26 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm": return 13;
      case "md": return 15;
      case "lg": return 17;
      default: return 15;
    }
  };

  const getShadow = () => {
    if (variant === "primary" && !disabled) {
      return {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 14,
        elevation: 4,
      };
    }
    return {};
  };

  return (
    <Pressable
      onPress={(e) => {
        if (!disabled && !loading) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(e);
        }
      }}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        backgroundColor: getBg(),
        borderRadius: 9999,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: disabled ? 0.6 : pressed ? 0.9 : 1,
        transform: [{ scale: pressed && !disabled ? 0.96 : 1 }],
        ...getShadow(),
        ...getPadding(),
      })}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : icon ? (
        <>{icon}</>
      ) : null}
      <Text
        style={{
          color: getTextColor(),
          fontSize: getFontSize(),
          fontWeight: "600",
          letterSpacing: 0.3,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
