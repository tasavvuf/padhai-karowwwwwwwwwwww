import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

let systemNotificationsEnabled = false;

export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("focus", {
      name: "Focus sessions",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
    });
  }
  const permissions = await Notifications.getPermissionsAsync();
  systemNotificationsEnabled = permissions.granted;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const permissions = await Notifications.requestPermissionsAsync();
  systemNotificationsEnabled = permissions.granted;
  return permissions.granted;
}

async function sendSystemNotification(
  title: string,
  body: string,
): Promise<void> {
  if (!systemNotificationsEnabled) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: "default" },
    trigger:
      Platform.OS === "android" ? { channelId: "focus", seconds: 1 } : null,
  }).catch(() => {});
}

export interface MockNotification {
  id: string;
  title: string;
  body: string;
  type:
    | "study_reminder"
    | "session_alert"
    | "partner_encouragement"
    | "interruption_warning"
    | "session_complete";
  timestamp: number;
  read: boolean;
  data?: Record<string, unknown>;
}

type NotificationHandler = (notification: MockNotification) => void;

const handlers: NotificationHandler[] = [];
const notifications: MockNotification[] = [];

export function onNotification(handler: NotificationHandler): () => void {
  handlers.push(handler);
  return () => {
    const idx = handlers.indexOf(handler);
    if (idx > -1) handlers.splice(idx, 1);
  };
}

function push(
  notification: Omit<MockNotification, "id" | "timestamp" | "read">,
): void {
  const full: MockNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    read: false,
  };
  notifications.unshift(full);
  handlers.forEach((h) => h(full));
  void sendSystemNotification(full.title, full.body);
}

export function getNotifications(): MockNotification[] {
  return [...notifications];
}

export function getUnreadCount(): number {
  return notifications.filter((n) => !n.read).length;
}

export function markAsRead(id: string): void {
  const n = notifications.find((n) => n.id === id);
  if (n) n.read = true;
}

export function markAllAsRead(): void {
  notifications.forEach((n) => (n.read = true));
}

// --- Notification Senders ---

export function sendStudyReminder(subject: string, minutesLeft: number): void {
  push({
    title: "Time to Study",
    body: `Your ${subject} session starts in ${minutesLeft} minutes. Get ready!`,
    type: "study_reminder",
  });
}

export function sendSessionAlert(message: string): void {
  push({
    title: "Focus Session",
    body: message,
    type: "session_alert",
  });
}

export function sendPartnerEncouragement(
  partnerName: string,
  message: string,
): void {
  push({
    title: `${partnerName} says`,
    body: message,
    type: "partner_encouragement",
  });
}

export function sendInterruptionWarning(
  appName: string,
  secondsLeft: number,
): void {
  push({
    title: "Focus Interrupted",
    body: `You opened ${appName}. Return to study in ${secondsLeft}s or your session will be paused.`,
    type: "interruption_warning",
  });
}

export function sendSessionComplete(
  subject: string,
  focusedMinutes: number,
  completionPercent: number,
): void {
  push({
    title: "Session Complete",
    body: `Great work! ${focusedMinutes}min focused on ${subject}. ${Math.round(completionPercent)}% completion.`,
    type: "session_complete",
  });
}
