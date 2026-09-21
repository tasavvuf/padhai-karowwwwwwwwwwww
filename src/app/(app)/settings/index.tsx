import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/use-theme";
import { useAuthStore } from "@/features/auth/store";
import { useSettingsStore } from "@/features/settings/store";
import { WALLPAPER_PRESETS } from "@/constants/wallpapers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Bell,
  Shield,
  Moon,
  LogOut,
  ChevronRight,
  Smartphone,
  User,
  BookOpen,
  Users,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react-native";

export default function SettingsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const currentWallpaper = WALLPAPER_PRESETS.find((w) => w.id === wallpaper);
  const isPartner = user?.role === "partner";
  const roleColor = isPartner ? colors.accent : colors.primary;

  const wallpaperDescription = currentWallpaper
    ? `Active: ${currentWallpaper.title}`
    : "Customize study background";

  const settingsItems = isPartner
    ? [
        {
          icon: <User size={20} color={colors.accent} />,
          label: "Profile",
          description: "Edit your name and email",
          onPress: () => router.push("/(app)/settings/profile" as any),
        },
        {
          icon: currentWallpaper ? (
            <Image
              source={currentWallpaper.source}
              style={{ width: 28, height: 28, borderRadius: 6 }}
              resizeMode="cover"
            />
          ) : (
            <ImageIcon size={20} color={colors.primary} />
          ),
          label: "Background Wallpaper",
          description: wallpaperDescription,
          onPress: () => router.push("/(app)/settings/wallpaper" as any),
        },
        {
          icon: <Bell size={20} color={colors.accent} />,
          label: "Notifications",
          description: "Manage reminders and alerts",
          onPress: () => router.push("/notifications"),
        },
      ]
    : [
        {
          icon: <User size={20} color={colors.primary} />,
          label: "Profile",
          description: "Edit your name and email",
          onPress: () => router.push("/(app)/settings/profile" as any),
        },
        {
          icon: currentWallpaper ? (
            <Image
              source={currentWallpaper.source}
              style={{ width: 28, height: 28, borderRadius: 6 }}
              resizeMode="cover"
            />
          ) : (
            <ImageIcon size={20} color={colors.primary} />
          ),
          label: "Background Wallpaper",
          description: wallpaperDescription,
          onPress: () => router.push("/(app)/settings/wallpaper" as any),
        },
        {
          icon: <Bell size={20} color={colors.accent} />,
          label: "Notifications",
          description: "Manage reminders and alerts",
          onPress: () => router.push("/notifications"),
        },
        {
          icon: <Smartphone size={20} color={colors.success} />,
          label: "Focus Monitoring",
          description: "Permissions and background access",
          onPress: () => router.push("/(app)/settings/permissions" as any),
        },
        {
          icon: <Shield size={20} color={colors.danger} />,
          label: "Distraction Apps",
          description: "Configure which apps interrupt focus",
          onPress: () => router.push("/(app)/settings/distractions" as any),
        },
      ];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: currentWallpaper ? "transparent" : colors.background,
      }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
            Settings
          </Text>
        </View>

        {/* Profile Card */}
        <Card variant="elevated" padding={20}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: roleColor + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isPartner ? (
                <Users size={24} color={colors.accent} />
              ) : (
                <BookOpen size={24} color={colors.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
                  {user?.name ?? "User"}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                    backgroundColor: roleColor + "15",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "600", color: roleColor }}>
                    {isPartner ? "Partner" : "Student"}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 14, color: colors.text3, marginTop: 2 }}>
                {user?.email ?? "user@padhaikaro.app"}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.text3} />
          </View>
        </Card>

        {/* Settings List */}
        <View style={{ gap: 2 }}>
          {settingsItems.map((item, i) => (
            <Pressable key={i} onPress={item.onPress}>
              <Card variant="default" padding={16} style={{ borderRadius: i === 0 ? 16 : i === settingsItems.length - 1 ? 16 : 0, marginBottom: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: colors.surface2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                      {item.label}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text3, marginTop: 1 }}>
                      {item.description}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.text3} />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Button
          title="Sign Out"
          variant="ghost"
          icon={<LogOut size={18} color={colors.danger} />}
          onPress={() => {
            logout();
            router.replace("/(auth)/index" as any);
          }}
        />

        {/* Version */}
        <Text style={{ fontSize: 12, color: colors.text3, textAlign: "center", marginTop: 8 }}>
          Padhai Karo v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
