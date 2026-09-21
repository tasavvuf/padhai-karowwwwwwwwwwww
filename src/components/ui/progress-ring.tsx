import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useThemeColors } from "@/hooks/use-theme";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  label?: string;
  progressColor?: string;
  trackColor?: string;
  textColor?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  label,
  progressColor,
  trackColor,
  textColor,
}: ProgressRingProps) {
  const colors = useThemeColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const activeProgressColor = progressColor ?? colors.primary;
  const activeTrackColor = trackColor ?? colors.surface3;
  const activeTextColor = textColor ?? colors.text;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeProgressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {showPercentage && (
          <Text
            style={{
              fontSize: Math.round(size * 0.22),
              fontWeight: "700",
              color: activeTextColor,
              letterSpacing: -0.5,
            }}
          >
            {Math.round(clampedProgress)}%
          </Text>
        )}
        {label && (
          <Text
            style={{
              fontSize: Math.max(Math.round(size * 0.09), 11),
              color: textColor ? textColor : colors.text2,
              fontWeight: "500",
              marginTop: 2,
            }}
          >
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}
