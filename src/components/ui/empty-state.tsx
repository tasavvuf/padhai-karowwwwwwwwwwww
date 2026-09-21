import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 16,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.surface2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.text,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: 14,
            color: colors.text2,
            textAlign: "center",
            lineHeight: 20,
            maxWidth: 280,
          }}
        >
          {description}
        </Text>
      )}
      {action && <View style={{ marginTop: 8 }}>{action}</View>}
    </View>
  );
}
