import React from "react";
import { View, type ViewProps } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "outlined" | "primary";
  padding?: number;
}

export function Card({
  variant = "default",
  padding = 18,
  style,
  children,
  ...props
}: CardProps) {
  const colors = useThemeColors();

  const getBg = () => {
    switch (variant) {
      case "primary": return colors.primary;
      case "outlined": return "transparent";
      case "default":
      case "elevated":
      default:
        return colors.surface;
    }
  };

  const getBorder = () => {
    if (variant === "outlined") return { borderWidth: 1, borderColor: colors.border };
    return {};
  };

  const getShadow = () => {
    if (variant === "primary") {
      return {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.32,
        shadowRadius: 22,
        elevation: 7,
      };
    }
    if (variant === "elevated") {
      return {
        shadowColor: "#3D5CF5",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.09,
        shadowRadius: 20,
        elevation: 4,
      };
    }
    return {
      shadowColor: "#3D5CF5",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 2,
    };
  };

  return (
    <View
      style={{
        backgroundColor: getBg(),
        borderRadius: 28,
        padding,
        ...getBorder(),
        ...getShadow(),
        ...style,
      }}
      {...props}
    >
      {children}
    </View>
  );
}
