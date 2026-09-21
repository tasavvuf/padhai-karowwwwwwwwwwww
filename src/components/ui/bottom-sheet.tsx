import React from "react";
import { View, Text, Pressable, ScrollView, type ViewProps } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <Pressable style={{ flex: 1 }} onPress={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 16,
              paddingBottom: 32,
              maxHeight: "70%",
            }}
          >
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surface3, alignSelf: "center", marginBottom: 12 }} />
            {title && (
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, paddingHorizontal: 20, marginBottom: 12 }}>
                {title}
              </Text>
            )}
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </View>
        </Pressable>
      </View>
    </Pressable>
  );
}
