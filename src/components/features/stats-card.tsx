import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react-native";

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string;
  subtitle?: string;
}

export function StatsCard({ icon: Icon, iconColor, label, value, subtitle }: StatsCardProps) {
  const colors = useThemeColors();

  return (
    <Card variant="default" padding={16} style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon size={16} color={iconColor} />
        <Text style={{ fontSize: 12, color: colors.text3, fontWeight: "500" }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>{value}</Text>
      {subtitle && <Text style={{ fontSize: 11, color: colors.text3, marginTop: 2 }}>{subtitle}</Text>}
    </Card>
  );
}
