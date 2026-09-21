import { Card } from "@/components/ui/card";
import { useThemeColors } from "@/hooks/use-theme";
import {
    getNotifications,
    markAsRead,
    onNotification,
    type MockNotification,
} from "@/services/notifications";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    MessageCircle,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const colors = useThemeColors();

  const [notifications, setNotifications] =
    React.useState<MockNotification[]>(getNotifications);

  React.useEffect(
    () =>
      onNotification((notification) =>
        setNotifications((current) => [notification, ...current]),
      ),
    [],
  );

  const getNotificationStyle = (notification: MockNotification) => {
    if (notification.type === "session_complete")
      return {
        icon: <CheckCircle2 size={18} color={colors.success} />,
        bg: colors.success + "15",
      };
    if (notification.type === "interruption_warning")
      return {
        icon: <AlertTriangle size={18} color={colors.warning} />,
        bg: colors.warning + "18",
      };
    if (notification.type === "partner_encouragement")
      return {
        icon: <MessageCircle size={18} color={colors.accent} />,
        bg: colors.accent + "18",
      };
    return {
      icon: <Clock size={18} color={colors.primary} />,
      bg: colors.primaryLight,
    };
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            color: colors.text,
            letterSpacing: -0.5,
            marginBottom: 8,
          }}
        >
          Notifications
        </Text>

        {notifications.length === 0 ? (
          <Text
            style={{ color: colors.text3, textAlign: "center", marginTop: 40 }}
          >
            No notifications yet
          </Text>
        ) : (
          notifications.map((notif) => {
            const style = getNotificationStyle(notif);
            return (
              <Card
                key={notif.id}
                variant="default"
                padding={16}
                onTouchEnd={() => markAsRead(notif.id)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: style.bg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {style.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: colors.text,
                        }}
                      >
                        {notif.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.text3,
                          fontWeight: "500",
                        }}
                      >
                        {new Date(notif.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.text2,
                        lineHeight: 18,
                        marginTop: 2,
                      }}
                    >
                      {notif.body}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
