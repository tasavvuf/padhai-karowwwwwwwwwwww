import { useSettingsStore } from "@/features/settings/store";

export type ColorScheme = "light" | "dark";

export function useColorScheme(): ColorScheme {
  const theme = useSettingsStore((s) => s.theme);
  if (theme === "dark") return "dark";
  return "light";
}
