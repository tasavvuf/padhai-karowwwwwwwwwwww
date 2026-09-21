import React, { useState } from "react";
import { View, Text, TextInput, type TextInputProps } from "react-native";
import { useThemeColors } from "@/hooks/use-theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, style, onFocus, onBlur, editable = true, ...props }: InputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text
          style={{
            color: colors.text2,
            fontSize: 13,
            fontWeight: "600",
            marginLeft: 6,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isFocused ? colors.surface : colors.surface2,
          borderRadius: 18,
          borderWidth: 1.5,
          borderColor: error ? colors.danger : isFocused ? colors.primary : colors.border,
          paddingHorizontal: 16,
          minHeight: 52,
          ...(isFocused
            ? {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 10,
                elevation: 2,
              }
            : {}),
        }}
      >
        {leftIcon && <View style={{ marginRight: 10 }}>{leftIcon}</View>}
        <TextInput
          style={{
            flex: 1,
            color: editable ? colors.text : colors.text2,
            fontSize: 16,
            paddingVertical: 14,
            ...style,
          }}
          placeholderTextColor={colors.text3}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          editable={editable}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
      </View>
      {error && (
        <Text style={{ color: colors.danger, fontSize: 12, marginLeft: 6 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
