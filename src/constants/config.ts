export const APP_NAME = "Padhai Karo";

export const DEFAULT_COMPLETION_THRESHOLD = 0.9;

export const DEFAULT_DISTRACTING_APPS = [
  { name: "Instagram", package: "com.instagram.android", icon: "instagram" },
  { name: "YouTube", package: "com.google.android.youtube", icon: "youtube" },
  { name: "Facebook", package: "com.facebook.katana", icon: "facebook" },
  { name: "Snapchat", package: "com.snapchat.android", icon: "ghost" },
  { name: "Reddit", package: "com.reddit.frontpage", icon: "reddit" },
  { name: "Twitter/X", package: "com.twitter.android", icon: "twitter" },
  { name: "TikTok", package: "com.zhiliaoapp.musically", icon: "music" },
  { name: "WhatsApp", package: "com.whatsapp", icon: "message-circle" },
] as const;

export const STUDY_CATEGORIES = [
  "Lecture",
  "Self Study",
  "Revision",
  "Practice",
  "Assignment",
  "Lab",
  "Reading",
  "Mock Test",
] as const;

export const PRIORITY_LEVELS = ["low", "medium", "high"] as const;

export const PLAN_STATUSES = ["draft", "ready", "locked", "active", "completed"] as const;

export const TASK_STATUSES = [
  "planned",
  "available",
  "active",
  "completed",
  "missed",
  "expired",
] as const;

export const SESSION_STATUSES = [
  "active",
  "paused",
  "interrupted",
  "completed",
  "expired",
  "failed",
] as const;

export const EVENT_TYPES = [
  "start",
  "pause",
  "resume",
  "end",
  "interruption_start",
  "interruption_end",
] as const;

export const MOCK_APPS = [
  { name: "Instagram", package: "com.instagram.android" },
  { name: "YouTube", package: "com.google.android.youtube" },
  { name: "Reddit", package: "com.reddit.frontpage" },
  { name: "TikTok", package: "com.zhiliaoapp.musically" },
] as const;
