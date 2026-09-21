import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, ChevronRight, Circle, Flame } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { useStreak } from "@/features/progress/hooks";
import type { StudyStreakDay } from "@/features/progress/api";

const flameAsset = require("../../../assets/streak/download.png");

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function StreakDay({ day }: { day: StudyStreakDay }) {
  const colors = useThemeColors();
  const hasActivity = day.focusedMinutes > 0;

  return (
    <View style={{ flex: 1, alignItems: "center", gap: 7 }}>
      <View
        accessible
        accessibilityLabel={`${day.label}: ${day.completed ? "study goal achieved" : day.isToday && hasActivity ? "study in progress" : "not achieved"}`}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: day.completed ? colors.success : colors.surface2,
          borderWidth: day.isToday && !day.completed ? 3 : 1,
          borderColor: day.isToday && !day.completed ? colors.accent : day.completed ? colors.success : colors.border,
        }}
      >
        {day.completed ? <Check size={18} color={colors.white} strokeWidth={3} /> : <Circle size={11} color={day.isToday && hasActivity ? colors.accent : colors.surface3} fill={day.isToday && hasActivity ? colors.accent : colors.surface3} />}
      </View>
      <Text style={{ color: day.isToday ? colors.text : colors.text3, fontSize: 11, fontWeight: day.isToday ? "800" : "600" }}>
        {day.label}
      </Text>
    </View>
  );
}

export function StudyStreakCard() {
  const colors = useThemeColors();
  const router = useRouter();
  const { data, isLoading } = useStreak();
  const progress = data?.todayPlannedMinutes
    ? Math.min(100, Math.round(((data.todayFocusedMinutes ?? 0) / data.todayPlannedMinutes) * 100))
    : 0;
  const days = data?.days ?? [];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="View detailed study progress"
      onPress={() => router.push("/(app)/(tabs)/progress")}
      style={({ pressed }) => ({ marginBottom: 20, opacity: pressed ? 0.94 : 1 })}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 28,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: "#FFF3E4", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Image source={flameAsset} style={{ width: 132, height: 87, transform: [{ scale: 1.15 }] }} resizeMode="contain" accessibilityLabel="Study streak flame" />
            </View>
            <View>
              <Text style={{ color: colors.text3, fontSize: 11, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" }}>Study streak</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 1 }}>
                <Text style={{ color: colors.text, fontSize: 30, fontWeight: "800", letterSpacing: -0.8 }}>{isLoading ? "—" : data?.streak ?? 0}</Text>
                <Text style={{ color: colors.text2, fontSize: 14, fontWeight: "800" }}>{data?.streak === 1 ? "day" : "days"}</Text>
              </View>
            </View>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" }}>
            <ChevronRight size={20} color={colors.primary} strokeWidth={2.5} />
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: colors.borderLight, marginBottom: 18 }} />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
          {days.length > 0 ? days.map((day) => <StreakDay key={day.date} day={day} />) : Array.from({ length: 7 }, (_, index) => <StreakDay key={index} day={{ date: String(index), label: "·", completed: false, isToday: false, focusedMinutes: 0, plannedMinutes: 0 }} />)}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Flame size={16} color={colors.accent} fill={colors.accent} />
            <Text style={{ color: colors.text2, fontSize: 12, fontWeight: "700" }}>Today&apos;s focus</Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: "800" }}>
            {data?.todayFocusedMinutes ?? 0}m{data?.todayPlannedMinutes ? ` / ${formatMinutes(data.todayPlannedMinutes)}` : " logged"}
          </Text>
        </View>
        <View style={{ height: 9, borderRadius: 99, backgroundColor: colors.surface2, overflow: "hidden" }}>
          <View style={{ height: "100%", width: `${progress}%`, borderRadius: 99, backgroundColor: colors.success }} />
        </View>
      </View>
    </Pressable>
  );
}
