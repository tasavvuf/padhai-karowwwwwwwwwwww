import React from "react";
import { View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/use-theme";
import { useSettingsStore } from "@/features/settings/store";

interface ScreenContainerProps extends ViewProps {
  safeArea?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
  padding?: boolean;
}

export function ScreenContainer({
  safeArea = true,
  edges = ["top"],
  padding = true,
  style,
  children,
  ...props
}: ScreenContainerProps) {
  const colors = useThemeColors();
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const hasWallpaper = wallpaper && wallpaper !== "none";

  const content = (
    <View
      style={[
        { flex: 1, backgroundColor: hasWallpaper ? "transparent" : colors.background },
        padding && { padding: 20 },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (safeArea) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: hasWallpaper ? "transparent" : colors.background }}
        edges={edges}
      >
        {content}
      </SafeAreaView>
    );
  }

  return content;
}

