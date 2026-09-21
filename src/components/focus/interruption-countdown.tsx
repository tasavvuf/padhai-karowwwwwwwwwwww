import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { AlertTriangle } from "lucide-react-native";

interface InterruptionCountdownProps {
  secondsLeft: number;
  appName: string;
}

export function InterruptionCountdown({ secondsLeft, appName }: InterruptionCountdownProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1.1, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
  }, [secondsLeft, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isUrgent = secondsLeft <= 3;
  const bgColor = isUrgent ? colors.danger + "20" : colors.warning + "20";
  const textColor = isUrgent ? colors.danger : colors.warning;

  return (
    <Animated.View
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: 16,
          padding: 20,
          alignItems: "center",
          gap: 12,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: textColor + "20",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AlertTriangle size={24} color={textColor} />
      </View>

      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, textAlign: "center" }}>
        Return to Study
      </Text>

      <Text style={{ fontSize: 13, color: colors.text2, textAlign: "center" }}>
        You opened <Text style={{ fontWeight: "600" }}>{appName}</Text>
      </Text>

      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
        <Text
          style={{
            fontSize: 48,
            fontWeight: "800",
            color: textColor,
            fontVariant: ["tabular-nums"],
          }}
        >
          {secondsLeft}
        </Text>
        <Text style={{ fontSize: 14, color: colors.text3 }}>seconds</Text>
      </View>

      <View
        style={{
          width: "100%",
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.surface3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${(secondsLeft / 10) * 100}%`,
            height: "100%",
            backgroundColor: textColor,
            borderRadius: 2,
          }}
        />
      </View>
    </Animated.View>
  );
}
