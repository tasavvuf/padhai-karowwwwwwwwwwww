import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PartnerSummaryProps {
  name: string;
  streak: number;
  todayCompleted: number;
  todayTotal: number;
  weeklyCompletion: number;
}

export function PartnerSummary({ name, streak, todayCompleted, todayTotal, weeklyCompletion }: PartnerSummaryProps) {
  const colors = useThemeColors();

  return (
    <Card variant="elevated" padding={16}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Avatar name={name} size={44} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>{name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }} />
            <Text style={{ fontSize: 12, color: colors.text2 }}>Connected</Text>
          </View>
        </View>
        <Badge label={`${streak} day streak`} variant="success" size="sm" />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>{todayCompleted}/{todayTotal}</Text>
          <Text style={{ fontSize: 11, color: colors.text3 }}>Today</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.primary }}>{weeklyCompletion}%</Text>
          <Text style={{ fontSize: 11, color: colors.text3 }}>Weekly</Text>
        </View>
      </View>
    </Card>
  );
}
