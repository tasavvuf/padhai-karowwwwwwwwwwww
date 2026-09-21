import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/use-theme";
import { useSettings, useDistractionApps } from "@/features/settings/hooks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_DISTRACTION_APPS } from "@/constants/defaults";
import { AnimatedEntrance } from "@/components/ui/animated";
import { ArrowLeft, Plus, X, Smartphone } from "lucide-react-native";

export default function DistractionsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { profile, removeDistractionApp, addDistractionApp } = useDistractionApps();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }}>
        <AnimatedEntrance delay={0}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>Distraction Apps</Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={100}>
          <Text style={{ fontSize: 14, color: colors.text2, lineHeight: 20 }}>
            These apps will trigger an interruption alert during focus sessions. Remove apps you want to allow.
          </Text>
        </AnimatedEntrance>

        <AnimatedEntrance delay={200}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
              Blocked ({profile.distractingApps.length})
            </Text>
            {profile.distractingApps.map((pkg) => {
              const app = MOCK_DISTRACTION_APPS.find((a) => a.package === pkg);
              return (
                <Card key={pkg} variant="default" padding={14} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.danger + "15", alignItems: "center", justifyContent: "center" }}>
                    <Smartphone size={18} color={colors.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{app?.name ?? pkg}</Text>
                    <Text style={{ fontSize: 12, color: colors.text3 }}>{app?.category ?? "App"}</Text>
                  </View>
                  <Pressable onPress={() => removeDistractionApp(pkg)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.danger + "15", alignItems: "center", justifyContent: "center" }}>
                    <X size={14} color={colors.danger} />
                  </Pressable>
                </Card>
              );
            })}
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={300}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
              Suggested Apps
            </Text>
            {MOCK_DISTRACTION_APPS.filter((a) => !profile.distractingApps.includes(a.package)).map((app) => (
              <Card key={app.package} variant="default" padding={14} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
                  <Smartphone size={18} color={colors.text3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{app.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.text3 }}>{app.category}</Text>
                </View>
                <Pressable onPress={() => addDistractionApp(app.package)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.success + "15", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={14} color={colors.success} />
                </Pressable>
              </Card>
            ))}
          </View>
        </AnimatedEntrance>
      </ScrollView>
    </SafeAreaView>
  );
}
