import { Platform } from "react-native";

export const Colors = {
  light: {
    primary: "#3D5CF5",
    primaryLight: "#EBF0FF",
    accent: "#FFA940",
    accentTeal: "#00D2D3",
    accentCoral: "#FF6B8B",
    accentPurple: "#7B61FF",
    success: "#00C9A7",
    warning: "#FFA940",
    danger: "#FF5A79",
    background: "#EFF2F9",
    surface: "#FFFFFF",
    surface2: "#F4F6FC",
    surface3: "#E2E7F5",
    text: "#181B34",
    text2: "#5F6782",
    text3: "#9EA7C4",
    border: "#E8EEFA",
    borderLight: "#F2F5FD",
    white: "#FFFFFF",
    black: "#000000",
    overlay: "rgba(24, 27, 52, 0.5)",
  },
  dark: {
    primary: "#3D5CF5",
    primaryLight: "#EBF0FF",
    accent: "#FFA940",
    accentTeal: "#00D2D3",
    accentCoral: "#FF6B8B",
    accentPurple: "#7B61FF",
    success: "#00C9A7",
    warning: "#FFA940",
    danger: "#FF5A79",
    background: "#EFF2F9",
    surface: "#FFFFFF",
    surface2: "#F4F6FC",
    surface3: "#E2E7F5",
    text: "#181B34",
    text2: "#5F6782",
    text3: "#9EA7C4",
    border: "#E8EEFA",
    borderLight: "#F2F5FD",
    white: "#FFFFFF",
    black: "#000000",
    overlay: "rgba(24, 27, 52, 0.5)",
  },
};

export type ThemeColorSet = typeof Colors.light;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
  ten: 40,
  twelve: 48,
  sixteen: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 32,
  full: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 56,
} as const;

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const FontFamily = {
  sans: Platform.select({
    ios: "Inter",
    android: "Inter",
    default: "Inter",
  }),
  mono: Platform.select({
    ios: "JetBrainsMono",
    android: "JetBrainsMono",
    default: "monospace",
  }),
};

export const Shadows = Platform.select({
  ios: {
    sm: {
      shadowColor: "#2C3E8C",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    md: {
      shadowColor: "#2C3E8C",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 16,
    },
    lg: {
      shadowColor: "#2C3E8C",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.10,
      shadowRadius: 28,
    },
  },
  android: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
  },
  default: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
  },
}) as Record<string, object>;

export const Layout = {
  screenWidth: 375,
  maxContentWidth: 480,
  headerHeight: 56,
  tabBarHeight: 64,
  bottomInset: Platform.OS === "ios" ? 34 : 16,
} as const;
