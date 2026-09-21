import { Colors } from "@/constants/theme";
import type { ColorScheme } from "@/hooks/use-color-scheme";

export type ThemeColors = Record<string, string>;

export function getThemeColors(scheme: ColorScheme): ThemeColors {
  return Colors[scheme] ?? Colors.light;
}
