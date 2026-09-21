import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useSettingsStore } from "@/features/settings/store";
import { resolveWallpaperSource } from "@/constants/wallpapers";
import { useIsDark } from "@/hooks/use-theme";

export function AppBackground() {
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const wallpaperDim = useSettingsStore((s) => s.wallpaperDim);
  const wallpaperBlur = useSettingsStore((s) => s.wallpaperBlur);
  const isDark = useIsDark();

  const source = resolveWallpaperSource(wallpaper);
  if (!source) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={wallpaperBlur}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark ? "#0D111D" : "#EFF2F9",
            opacity: wallpaperDim,
          },
        ]}
      />
    </View>
  );
}
