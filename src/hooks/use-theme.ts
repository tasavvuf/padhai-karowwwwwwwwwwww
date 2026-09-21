import { Colors } from "@/constants/theme";
import { useColorScheme } from "./use-color-scheme";
import { useSettingsStore } from "@/features/settings/store";

export type ThemeColors = {
  primary: string;
  primaryLight: string;
  accent: string;
  accentTeal: string;
  accentCoral: string;
  accentPurple: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  surface: string;
  surface2: string;
  surface3: string;
  text: string;
  text2: string;
  text3: string;
  border: string;
  borderLight: string;
  white: string;
  black: string;
  overlay: string;
};

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const base = Colors[scheme] ?? Colors.light;
  const hasWallpaper = Boolean(wallpaper && wallpaper !== "none");

  return {
    ...base,
    background: hasWallpaper ? "transparent" : base.background,
  };
}

export function useIsDark(): boolean {
  const scheme = useColorScheme();
  return scheme === "dark";
}
