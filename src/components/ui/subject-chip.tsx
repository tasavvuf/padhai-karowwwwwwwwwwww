import React from "react";
import { View, Text } from "react-native";
import { getSubjectColor } from "@/lib/format";

interface SubjectChipProps {
  subject: string;
  size?: "sm" | "md";
}

export function SubjectChip({ subject, size = "sm" }: SubjectChipProps) {
  const color = getSubjectColor(subject);
  const fontSize = size === "sm" ? 11 : 13;
  const paddingV = size === "sm" ? 4 : 6;
  const paddingH = size === "sm" ? 10 : 12;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: color + "14",
        borderRadius: 9999,
        paddingVertical: paddingV,
        paddingHorizontal: paddingH,
        alignSelf: "flex-start",
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          color,
          fontSize,
          fontWeight: "600",
          letterSpacing: 0.2,
        }}
      >
        {subject}
      </Text>
    </View>
  );
}
