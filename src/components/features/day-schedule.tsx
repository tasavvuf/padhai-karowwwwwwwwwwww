import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { formatTimeShort } from "@/lib/date";

interface TimeSlot {
  startTime: string;
  endTime: string;
  title: string;
  subject: string;
  status: "planned" | "active" | "completed";
}

interface DayScheduleProps {
  slots: TimeSlot[];
}

export function DaySchedule({ slots }: DayScheduleProps) {
  const colors = useThemeColors();

  if (slots.length === 0) {
    return (
      <View style={{ alignItems: "center", paddingVertical: 32, gap: 8 }}>
        <Text style={{ fontSize: 14, color: colors.text3 }}>No tasks scheduled</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 2 }}>
      {slots.map((slot, i) => {
        const isCompleted = slot.status === "completed";
        const isActive = slot.status === "active";

        return (
          <View key={i} style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ alignItems: "center", width: 60 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text3 }}>
                {formatTimeShort(slot.startTime)}
              </Text>
              <View style={{ flex: 1, width: 2, backgroundColor: isActive ? colors.primary : colors.surface3, marginVertical: 4 }} />
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text3 }}>
                {formatTimeShort(slot.endTime)}
              </Text>
            </View>
            <Card
              variant={isActive ? "elevated" : "default"}
              padding={12}
              style={{
                flex: 1,
                borderLeftWidth: 3,
                borderLeftColor: isCompleted ? colors.success : isActive ? colors.primary : colors.surface3,
                opacity: isCompleted ? 0.6 : 1,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{slot.title}</Text>
              <Text style={{ fontSize: 12, color: colors.text3, marginTop: 2 }}>{slot.subject}</Text>
            </Card>
          </View>
        );
      })}
    </View>
  );
}
