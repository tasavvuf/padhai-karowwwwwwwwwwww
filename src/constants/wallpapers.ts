import type { ImageSourcePropType } from "react-native";

export interface WallpaperItem {
  id: string;
  title: string;
  subtitle: string;
  source: ImageSourcePropType;
  accentColor: string;
}

export const WALLPAPER_PRESETS: WallpaperItem[] = [
  {
    id: "bg-vision-2026",
    title: "Vision & Wellness",
    subtitle: "Health & vision board mood",
    source: require("../../assets/images/bg/2026 Vision Board Ideas Health.jpeg"),
    accentColor: "#FFA940",
  },
  {
    id: "bg-pixel-quote",
    title: "Pixel Wisdom",
    subtitle: "Retro pixel art & quote",
    source: require("../../assets/images/bg/#heartimages #pixelart #emotionalintelligence  Quote of the day.jpeg"),
    accentColor: "#FF6B8B",
  },
  {
    id: "bg-study-cafe",
    title: "Cozy Study Corner",
    subtitle: "Warm study sanctuary",
    source: require("../../assets/images/bg/04eaf5a40affd2054db3e20960d439d3.jpg"),
    accentColor: "#D4A574",
  },
  {
    id: "bg-study-serenity",
    title: "Silent Sanctuary",
    subtitle: "Calm aesthetic focus",
    source: require("../../assets/images/bg/ee1871d807be2877b0a4d14c051e6346.jpg"),
    accentColor: "#7B61FF",
  },
  {
    id: "bg-study-b34",
    title: "Minimal Haven",
    subtitle: "Serene desk & notes",
    source: require("../../assets/images/bg/b34.jpeg"),
    accentColor: "#3D5CF5",
  },
  {
    id: "bg-ambiance-2",
    title: "Pastel Atmosphere",
    subtitle: "Soft tones for deep study",
    source: require("../../assets/images/bg/bg2.jpeg"),
    accentColor: "#00C9A7",
  },
  {
    id: "bg-ambiance-6",
    title: "Nordic Sunset",
    subtitle: "Warm calming glow",
    source: require("../../assets/images/bg/bg6.jpeg"),
    accentColor: "#FFA940",
  },
  {
    id: "bg-ambiance-7",
    title: "Deep Focus",
    subtitle: "Midnight focus vibes",
    source: require("../../assets/images/bg/bg7.jpeg"),
    accentColor: "#1E3A5F",
  },
  {
    id: "bg-ambiance-8",
    title: "Aesthetic Glow",
    subtitle: "Ambient lighting & calm",
    source: require("../../assets/images/bg/bg8.jpeg"),
    accentColor: "#00D2D3",
  },
  {
    id: "bg-aesthetic-star",
    title: "Dreamy Horizons",
    subtitle: "Whimsical aesthetic atmosphere",
    source: require("../../assets/images/bg/_.jpeg"),
    accentColor: "#C4956A",
  },
];

export function resolveWallpaperSource(wallpaperId: string | null | undefined): ImageSourcePropType | null {
  if (!wallpaperId || wallpaperId === "none" || wallpaperId === "") {
    return null;
  }
  const preset = WALLPAPER_PRESETS.find((w) => w.id === wallpaperId);
  if (preset) {
    return preset.source;
  }
  return null;
}
