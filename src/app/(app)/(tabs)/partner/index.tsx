import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, CalendarCheck, ChevronRight, HeartHandshake, ShieldCheck, Users } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { useAuthStore } from "@/features/auth/store";
import { usePartnerProgress } from "@/features/partner/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function PartnerScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isPartner = user?.role === "partner";
  const progressQuery = usePartnerProgress();
  const progress = progressQuery.data;

  if (!isPartner) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
      <View><Text style={{ fontSize: 30, fontWeight: "800", color: colors.text, letterSpacing: -0.5 }}>Accountability partner</Text><Text style={{ fontSize: 13, color: colors.text3, fontWeight: "600", marginTop: 2 }}>Share verified study progress with someone you trust.</Text></View>
      <Card variant="elevated" padding={24}><View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 16 }}><HeartHandshake size={26} color={colors.primary} /></View><Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>Connect a partner</Text><Text style={{ fontSize: 14, lineHeight: 21, color: colors.text2, marginTop: 8, marginBottom: 20 }}>Your partner can view your plan, focus activity, and weekly analytics. They cannot edit your schedule or sessions.</Text><Button title="Create invite code" size="lg" onPress={() => router.push("/(app)/partner-connect" as any)} /></Card>
      <Card variant="default" padding={20}><View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}><ShieldCheck size={20} color={colors.success} /><View style={{ flex: 1 }}><Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>Read-only access</Text><Text style={{ fontSize: 13, color: colors.text2, lineHeight: 19, marginTop: 4 }}>Partner visibility is limited to progress information. Your plan and focus controls remain yours.</Text></View></View></Card>
    </ScrollView></SafeAreaView>;
  }

  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
    <View><Text style={{ fontSize: 30, fontWeight: "800", color: colors.text, letterSpacing: -0.5 }}>Student account</Text><Text style={{ fontSize: 13, color: colors.text3, fontWeight: "600", marginTop: 2 }}>Read-only accountability overview</Text></View>
    {progressQuery.isLoading ? <SkeletonCard /> : progress ? <>
      <Card variant="elevated" padding={22}><View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}><View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" }}><Users size={24} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={{ fontSize: 19, fontWeight: "800", color: colors.text }}>{progress.student.name}</Text><Text style={{ fontSize: 13, color: colors.text2, marginTop: 2 }}>Connected student</Text></View><ShieldCheck size={22} color={colors.success} /></View></Card>
      <Card variant="default" padding={20}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><View><Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>Today&apos;s study</Text><Text style={{ fontSize: 13, color: colors.text2, marginTop: 4 }}>{progress.today.tasksCompleted} of {progress.today.tasksTotal} tasks complete · {progress.today.focusedMinutes}m focused</Text></View><Pressable accessibilityRole="button" accessibilityLabel="View student progress" hitSlop={10} onPress={() => router.push("/(app)/(tabs)/progress" as any)}><ChevronRight size={22} color={colors.primary} /></Pressable></View></Card>
      <Card variant="default" padding={20}><View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}><CalendarCheck size={20} color={colors.accent} /><View style={{ flex: 1 }}><Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>Keep encouragement focused</Text><Text style={{ fontSize: 13, color: colors.text2, lineHeight: 19, marginTop: 4 }}>Use the notification center to follow study updates. Student schedules and sessions cannot be changed from this account.</Text></View><Bell size={18} color={colors.text3} /></View></Card>
    </> : <Card variant="default" padding={24}><Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>No student connected</Text><Text style={{ fontSize: 13, lineHeight: 20, color: colors.text2, marginTop: 8, marginBottom: 18 }}>Ask a student to create an invite code, then connect it from this account.</Text><Button title="Connect student" onPress={() => router.push("/(app)/partner-connect" as any)} /></Card>}
  </ScrollView></SafeAreaView>;
}
