import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  onNotification,
  type MockNotification,
} from "@/services/notifications";
import { Bell, BookOpen, Users, AlertTriangle, CheckCircle2, X } from "lucide-react-native";

const typeConfig: Record<
  MockNotification["type"],
  { icon: React.ReactNode; color: string }
> = {
  study_reminder: { icon: <BookOpen size={16} color="#3D5CF5" />, color: "#3D5CF5" },
  session_alert: { icon: <Bell size={16} color="#FFA940" />, color: "#FFA940" },
  partner_encouragement: { icon: <Users size={16} color="#FF6B8B" />, color: "#FF6B8B" },
  interruption_warning: { icon: <AlertTriangle size={16} color="#FF5A79" />, color: "#FF5A79" },
  session_complete: { icon: <CheckCircle2 size={16} color="#00C9A7" />, color: "#00C9A7" },
};

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface NotificationItemProps {
  notification: MockNotification;
  onPress: (id: string) => void;
}

function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const colors = useThemeColors();
  const config = typeConfig[notification.type];

  return (
    <Pressable onPress={() => onPress(notification.id)}>
      <Card
        variant={notification.read ? "default" : "elevated"}
        padding={14}
        style={{
          borderLeftWidth: 3,
          borderLeftColor: config.color,
          opacity: notification.read ? 0.7 : 1,
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: config.color + "15",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {config.icon}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                {notification.title}
              </Text>
              <Text style={{ fontSize: 11, color: colors.text3 }}>
                {timeAgo(notification.timestamp)}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.text2, lineHeight: 18 }}>
              {notification.body}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

interface NotificationCenterProps {
  onClose?: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const colors = useThemeColors();
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  }, []);

  useEffect(() => {
    refresh();
    const unsub = onNotification(() => refresh());
    return unsub;
  }, [refresh]);

  const handlePress = (id: string) => {
    markAsRead(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    refresh();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Badge label={`${unreadCount}`} variant="warning" size="sm" />
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllRead}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: colors.surface2,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary }}>
                Read All
              </Text>
            </Pressable>
          )}
          {onClose && (
            <Pressable
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: colors.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color={colors.text3} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
            <Bell size={40} color={colors.surface3} />
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text3 }}>
              No notifications yet
            </Text>
            <Text style={{ fontSize: 13, color: colors.text3, textAlign: "center" }}>
              Study reminders, session alerts, and partner messages will appear here
            </Text>
          </View>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onPress={handlePress} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
