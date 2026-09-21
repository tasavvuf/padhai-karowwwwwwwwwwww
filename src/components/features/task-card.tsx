import React from "react";
import { View, Text, Pressable } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubjectChip } from "@/components/ui/subject-chip";
import { formatTimeShort } from "@/lib/date";
import { ChevronRight } from "lucide-react-native";

interface TaskCardProps {
  id: string;
  subject: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "planned" | "active" | "completed" | "missed";
  priority: "low" | "medium" | "high";
  onPress?: () => void;
}

export function TaskCard({ subject, title, startTime, endTime, status, priority, onPress }: TaskCardProps) {
  const colors = useThemeColors();

  return (
    <Pressable onPress={onPress}>
      <Card variant="default" padding={14} style={{ flexDirection: "row", alignItems: "center", gap: 12, opacity: status === "completed" ? 0.6 : 1 }}>
        <View style={{ width: 4, height: 40, borderRadius: 2, backgroundColor: status === "completed" ? colors.success : status === "active" ? colors.primary : colors.surface3 }} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <SubjectChip subject={subject} />
            {status === "completed" && <Badge label="Done" variant="success" size="sm" />}
            {status === "active" && <Badge label="Active" variant="primary" size="sm" />}
            {priority === "high" && status !== "completed" && <Badge label="High" variant="danger" size="sm" />}
          </View>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, textDecorationLine: status === "completed" ? "line-through" : "none" }}>
            {title}
          </Text>
          <Text style={{ fontSize: 13, color: colors.text3, marginTop: 2 }}>
            {formatTimeShort(startTime)} - {formatTimeShort(endTime)}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.text3} />
      </Card>
    </Pressable>
  );
}
