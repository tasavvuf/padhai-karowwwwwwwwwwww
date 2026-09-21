import React from "react";
import { Pressable, type ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  Layout,
} from "react-native-reanimated";

interface AnimatedEntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewProps["style"];
}

export function AnimatedEntrance({
  children,
  delay = 0,
  duration = 400,
  style,
}: AnimatedEntranceProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(duration)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export function AnimatedPressable({
  children,
  onPress,
  style,
  scaleTo = 0.97,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewProps["style"];
  scaleTo?: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    "worklet";
    scale.value = withSpring(scaleTo, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    "worklet";
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function AnimatedCard({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewProps["style"];
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      layout={Layout.springify().damping(15)}
      style={animatedStyle}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          "worklet";
          scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          "worklet";
          scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
