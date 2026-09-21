import { create } from "zustand";
import { getPreference, setPreference } from "@/database/repositories/settings";

interface DistractionProfile {
  name: string;
  distractingApps: string[];
  allowedApps: string[];
}

interface SettingsState {
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  studyReminderMinutes: number;
  distractionProfile: DistractionProfile;
  focusSessionMinutes: number;
  autoStartBreak: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  wallpaper: string;
  wallpaperDim: number;
  wallpaperBlur: number;

  setTheme: (theme: "light" | "dark" | "system") => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setStudyReminderMinutes: (minutes: number) => void;
  setDistractionProfile: (profile: DistractionProfile) => void;
  setFocusSessionMinutes: (minutes: number) => void;
  setAutoStartBreak: (auto: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setWallpaper: (wallpaper: string) => void;
  setWallpaperDim: (dim: number) => void;
  setWallpaperBlur: (blur: number) => void;
  resetWallpaper: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const defaultProfile: DistractionProfile = {
  name: "Default",
  distractingApps: [
    "com.instagram.android",
    "com.twitter.android",
    "com.youtube.android",
    "com.zhiliaoapp.musically",
    "com.facebook.katana",
    "com.snapchat.android",
    "com.reddit.frontpage",
    "com.discord",
  ],
  allowedApps: [],
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: "system",
  notificationsEnabled: true,
  studyReminderMinutes: 10,
  distractionProfile: defaultProfile,
  focusSessionMinutes: 60,
  autoStartBreak: false,
  soundEnabled: true,
  vibrationEnabled: true,
  wallpaper: "none",
  wallpaperDim: 0.35,
  wallpaperBlur: 0,

  setTheme: (theme) => {
    set({ theme });
    void get().saveToStorage();
  },
  setNotificationsEnabled: (notificationsEnabled) => {
    set({ notificationsEnabled });
    void get().saveToStorage();
  },
  setStudyReminderMinutes: (studyReminderMinutes) => {
    set({ studyReminderMinutes });
    void get().saveToStorage();
  },
  setDistractionProfile: (distractionProfile) => {
    set({ distractionProfile });
    void get().saveToStorage();
  },
  setFocusSessionMinutes: (focusSessionMinutes) => {
    set({ focusSessionMinutes });
    void get().saveToStorage();
  },
  setAutoStartBreak: (autoStartBreak) => {
    set({ autoStartBreak });
    void get().saveToStorage();
  },
  setSoundEnabled: (soundEnabled) => {
    set({ soundEnabled });
    void get().saveToStorage();
  },
  setVibrationEnabled: (vibrationEnabled) => {
    set({ vibrationEnabled });
    void get().saveToStorage();
  },
  setWallpaper: (wallpaper) => {
    set({ wallpaper });
    void get().saveToStorage();
  },
  setWallpaperDim: (wallpaperDim) => {
    set({ wallpaperDim });
    void get().saveToStorage();
  },
  setWallpaperBlur: (wallpaperBlur) => {
    set({ wallpaperBlur });
    void get().saveToStorage();
  },
  resetWallpaper: () => {
    set({ wallpaper: "none" });
    void get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const theme = await getPreference("theme");
      const notifications = await getPreference("notifications_enabled");
      const reminder = await getPreference("study_reminder_minutes");
      const profile = await getPreference("distraction_profile");
      const session = await getPreference("focus_session_minutes");
      const wallpaper = await getPreference("wallpaper");
      const wallpaperDim = await getPreference("wallpaper_dim");
      const wallpaperBlur = await getPreference("wallpaper_blur");

      set({
        theme: (theme as any) || "system",
        notificationsEnabled: notifications !== "false",
        studyReminderMinutes: reminder ? parseInt(reminder, 10) : 10,
        distractionProfile: profile ? JSON.parse(profile) : defaultProfile,
        focusSessionMinutes: session ? parseInt(session, 10) : 60,
        wallpaper: wallpaper || "none",
        wallpaperDim: wallpaperDim ? parseFloat(wallpaperDim) : 0.35,
        wallpaperBlur: wallpaperBlur ? parseInt(wallpaperBlur, 10) : 0,
      });
    } catch {}
  },

  saveToStorage: async () => {
    const state = get();
    try {
      await setPreference("theme", state.theme);
      await setPreference("notifications_enabled", String(state.notificationsEnabled));
      await setPreference("study_reminder_minutes", String(state.studyReminderMinutes));
      await setPreference("distraction_profile", JSON.stringify(state.distractionProfile));
      await setPreference("focus_session_minutes", String(state.focusSessionMinutes));
      await setPreference("wallpaper", state.wallpaper);
      await setPreference("wallpaper_dim", String(state.wallpaperDim));
      await setPreference("wallpaper_blur", String(state.wallpaperBlur));
    } catch {}
  },
}));
