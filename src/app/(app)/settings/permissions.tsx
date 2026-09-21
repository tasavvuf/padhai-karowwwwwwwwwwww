import { AnimatedEntrance } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/features/settings/hooks";
import { useThemeColors } from "@/hooks/use-theme";
import {
    getNativeFocusStatus,
    openNativeUsageAccessSettings,
} from "@/services/focus-engine";
import { requestNotificationPermission } from "@/services/notifications";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell, Moon, Smartphone } from "lucide-react-native";
import React from "react";
import { AppState, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PermissionsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const {
    notificationsEnabled,
    setNotificationsEnabled,
    vibrationEnabled,
    setVibrationEnabled,
    soundEnabled,
    setSoundEnabled,
  } = useSettings();
  const [focusStatus, setFocusStatus] = React.useState(getNativeFocusStatus);

  const handleNotificationsChange = async (enabled: boolean) => {
    if (enabled && !(await requestNotificationPermission())) return;
    setNotificationsEnabled(enabled);
  };

  React.useEffect(() => {
    const refresh = () => setFocusStatus(getNativeFocusStatus());
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}
      >
        <AnimatedEntrance delay={0}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
            <Text
              style={{ fontSize: 28, fontWeight: "700", color: colors.text }}
            >
              Permissions
            </Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={100}>
          <Text style={{ fontSize: 14, color: colors.text2, lineHeight: 20 }}>
            Configure notifications and monitoring permissions for focus
            sessions.
          </Text>
        </AnimatedEntrance>

        <AnimatedEntrance delay={200}>
          <View style={{ gap: 2 }}>
            <Card variant="default" padding={16} style={{ borderRadius: 16 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: colors.primary + "15",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    Notifications
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: colors.text3, marginTop: 1 }}
                  >
                    Study reminders and alerts
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsChange}
                  trackColor={{
                    false: colors.surface3,
                    true: colors.primary + "60",
                  }}
                  thumbColor={
                    notificationsEnabled ? colors.primary : colors.text3
                  }
                />
              </View>
            </Card>

            <Card variant="default" padding={16} style={{ borderRadius: 0 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: colors.accent + "15",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Smartphone size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    Vibration
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: colors.text3, marginTop: 1 }}
                  >
                    Haptic feedback during sessions
                  </Text>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{
                    false: colors.surface3,
                    true: colors.primary + "60",
                  }}
                  thumbColor={vibrationEnabled ? colors.primary : colors.text3}
                />
              </View>
            </Card>

            <Card variant="default" padding={16} style={{ borderRadius: 16 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: colors.success + "15",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Moon size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    Sound
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: colors.text3, marginTop: 1 }}
                  >
                    Audio cues for interruptions
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{
                    false: colors.surface3,
                    true: colors.primary + "60",
                  }}
                  thumbColor={soundEnabled ? colors.primary : colors.text3}
                />
              </View>
            </Card>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={300}>
          <Card
            variant="outlined"
            padding={16}
            style={{ borderColor: colors.warning + "40" }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.warning,
                marginBottom: 4,
              }}
            >
              Focus Monitoring
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.text2,
                lineHeight: 18,
                marginBottom: 12,
              }}
            >
              {focusStatus.available
                ? focusStatus.usageAccessGranted
                  ? focusStatus.monitoring
                    ? "Focus monitoring is active for the current session."
                    : "Usage Access is ready. Start a focus session to enable monitoring."
                  : "Allow Usage Access so Padhai Karo can detect distracting apps during focus sessions."
                : "Focus monitoring is available in the Android development build, not Expo Go."}
            </Text>
            {focusStatus.available && !focusStatus.usageAccessGranted && (
              <Button
                title="Open Usage Access"
                size="sm"
                onPress={openNativeUsageAccessSettings}
              />
            )}
          </Card>
        </AnimatedEntrance>
      </ScrollView>
    </SafeAreaView>
  );
}
