import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart3, Clock, Flame, Target, TrendingUp } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { useAuthStore } from "@/features/auth/store";
import { useWeeklyProgress } from "@/features/progress/hooks";
import { usePartnerWeeklyProgress } from "@/features/partner/hooks";
import type { WeeklyProgressResponse } from "@/features/progress/api";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

function ProgressContent({ progress, title }: { progress: WeeklyProgressResponse; title: string }) {
  const colors = useThemeColors();
  const plannedDays = progress.days.filter((day) => day.plannedMinutes > 0);
  const strongDays = plannedDays.filter((day) => day.completionPercentage >= 90).length;
  const partialDays = plannedDays.filter((day) => day.completionPercentage > 0 && day.completionPercentage < 90).length;
  const missedDays = plannedDays.filter((day) => day.completionPercentage === 0).length;
  const maxMinutes = Math.max(...progress.days.map((day) => Math.max(day.focusedMinutes, day.plannedMinutes)), 1);
  const states: Array<[number, string, string]> = [[strongDays, "Strong", colors.success], [partialDays, "Partial", colors.warning], [missedDays, "Missed", colors.danger]];

  return <>
    <View>
      <Text style={{ fontSize: 30, fontWeight: "800", color: colors.text, letterSpacing: -0.5 }}>{title}</Text>
      <Text style={{ fontSize: 13, color: colors.text3, fontWeight: "600", marginTop: 2 }}>Current week&apos;s study overview</Text>
    </View>
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Card variant="default" padding={18} style={{ flex: 1 }}><View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 10 }}><Clock size={18} color={colors.primary} /></View><Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>{formatMinutes(progress.totalFocusedMinutes)}</Text><Text style={{ fontSize: 12, color: colors.text3, fontWeight: "600", marginTop: 2 }}>Focused</Text></Card>
      <Card variant="default" padding={18} style={{ flex: 1 }}><View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFF4E5", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><Target size={18} color={colors.accent} /></View><Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>{formatMinutes(progress.totalPlannedMinutes)}</Text><Text style={{ fontSize: 12, color: colors.text3, fontWeight: "600", marginTop: 2 }}>Planned</Text></Card>
    </View>
    <Card variant="elevated" padding={24} style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 13, color: colors.text3, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>Weekly completion</Text>
      <ProgressRing progress={progress.overallCompletion} size={160} strokeWidth={11} label="weekly completion" />
      <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 24, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.border }}>
        {states.map(([value, label, color], index) => <React.Fragment key={label}>{index > 0 && <View style={{ width: 1, backgroundColor: colors.border }} />}<View style={{ alignItems: "center" }}><Text style={{ fontSize: 20, fontWeight: "800", color }}>{value}</Text><Text style={{ fontSize: 12, color: colors.text3, fontWeight: "500", marginTop: 2 }}>{label}</Text></View></React.Fragment>)}
      </View>
    </Card>
    <Card variant="default" padding={20}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 }}><BarChart3 size={18} color={colors.primary} /><Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>Daily breakdown</Text></View>
      {progress.days.map((day) => {
        const color = day.completionPercentage >= 90 ? colors.success : day.completionPercentage >= 50 ? colors.warning : colors.danger;
        return <View key={day.date} style={{ marginBottom: 14 }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><Text style={{ fontSize: 13, fontWeight: "700", color: day.isToday ? colors.primary : colors.text, width: 40 }}>{day.label}</Text><Text style={{ fontSize: 12, color: colors.text3, fontWeight: "500" }}>{formatMinutes(day.focusedMinutes)} / {formatMinutes(day.plannedMinutes)}</Text><Badge label={day.plannedMinutes ? `${day.completionPercentage}%` : "—"} variant={day.completionPercentage >= 90 ? "success" : day.completionPercentage >= 50 ? "warning" : "default"} size="sm" /></View><View style={{ height: 10, backgroundColor: colors.surface2, borderRadius: 5, overflow: "hidden" }}><View style={{ height: "100%", width: `${Math.round((day.focusedMinutes / maxMinutes) * 100)}%`, backgroundColor: color, borderRadius: 5 }} /></View></View>;
      })}
    </Card>
    <Card variant="default" padding={18}><View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}><View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#FFF4E5", alignItems: "center", justifyContent: "center" }}><Flame size={24} color={colors.accent} /></View><View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>{progress.streak} day{progress.streak === 1 ? "" : "s"} streak</Text><Text style={{ fontSize: 13, color: colors.text3, marginTop: 2, fontWeight: "500" }}>Best day: {progress.strongestDay} · Needs attention: {progress.weakestDay}</Text></View><TrendingUp size={20} color={colors.success} /></View></Card>
  </>;
}

export default function ProgressScreen() {
  const colors = useThemeColors();
  const isPartner = useAuthStore((state) => state.user?.role === "partner");
  const studentQuery = useWeeklyProgress();
  const partnerQuery = usePartnerWeeklyProgress();
  const query = isPartner ? partnerQuery : studentQuery;

  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}><ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>{query.isLoading ? <SkeletonList count={4} /> : query.data ? <ProgressContent progress={query.data} title={isPartner ? "Student progress" : "Progress"} /> : <EmptyState icon={<BarChart3 size={32} color={colors.primary} />} title="No progress yet" description={isPartner ? "Connect to a student to see their study analytics." : "Complete a focus session to begin building your progress history."} />}</ScrollView></SafeAreaView>;
}
