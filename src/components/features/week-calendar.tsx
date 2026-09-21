import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";

interface Day {
  date: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
  hasData: boolean;
  completion?: number;
}

interface WeekCalendarProps {
  days: Day[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function WeekCalendar({ days, selectedDate, onSelectDate }: WeekCalendarProps) {
  const colors = useThemeColors();

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const bgColor = isSelected ? colors.primary : day.isToday ? colors.surface2 : "transparent";
          const textColor = isSelected ? "#FFFFFF" : colors.text;

          return (
            <Pressable
              key={day.date}
              onPress={() => onSelectDate(day.date)}
              style={{
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: bgColor,
                minWidth: 56,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "500", color: isSelected ? "rgba(255,255,255,0.7)" : colors.text3 }}>
                {day.dayName}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: textColor, marginTop: 2 }}>
                {day.dayNum}
              </Text>
              {day.hasData && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: (day.completion ?? 0) >= 80 ? colors.success : (day.completion ?? 0) > 0 ? colors.warning : colors.surface3,
                    marginTop: 4,
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
