import React from "react";
import { View, Text, Pressable, Modal as RNModal, type ModalProps } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";
import { X } from "lucide-react-native";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: CustomModalProps) {
  const colors = useThemeColors();

  return (
    <RNModal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 20,
            paddingBottom: 40,
            maxHeight: "80%",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}
            >
              <X size={16} color={colors.text3} />
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 20 }}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
}
