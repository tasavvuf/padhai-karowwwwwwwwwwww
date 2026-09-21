export const MOCK_DISTRACTION_APPS = [
  { package: "com.instagram.android", name: "Instagram", category: "Social" },
  { package: "com.twitter.android", name: "Twitter", category: "Social" },
  { package: "com.youtube.android", name: "YouTube", category: "Entertainment" },
  { package: "com.zhiliaoapp.musically", name: "TikTok", category: "Social" },
  { package: "com.facebook.katana", name: "Facebook", category: "Social" },
  { package: "com.snapchat.android", name: "Snapchat", category: "Social" },
  { package: "com.reddit.frontpage", name: "Reddit", category: "Social" },
  { package: "com.discord", name: "Discord", category: "Communication" },
  { package: "com.whatsapp", name: "WhatsApp", category: "Communication" },
  { package: "com.telegram.messenger", name: "Telegram", category: "Communication" },
];

export const MOCK_STUDY_APPS = [
  { package: "com.google.android.apps.books", name: "Google Play Books", category: "Education" },
  { package: "com.duolingo", name: "Duolingo", category: "Education" },
  { package: "com.khanacademy", name: "Khan Academy", category: "Education" },
  { package: "org.khanacademy.android", name: "Khan Academy", category: "Education" },
];

export const DEFAULT_DISTRACTION_PROFILE = {
  name: "Default",
  distractingApps: MOCK_DISTRACTION_APPS.map((a) => a.package),
  allowedApps: [],
};

export const STUDY_REMINDER_OPTIONS = [5, 10, 15, 30];
export const FOCUS_SESSION_OPTIONS = [25, 30, 45, 60, 90, 120];
