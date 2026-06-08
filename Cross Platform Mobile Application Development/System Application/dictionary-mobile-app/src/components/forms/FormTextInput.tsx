import React from "react";
import { TextInput, TextInputProps, View } from "react-native";

import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";

export interface FormTextInputProps extends Omit<TextInputProps, "onChange"> {
  label?: string;
  error?: string;
  touched?: boolean;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerClassName?: string;
}

/** Labelled text field with inline validation messaging. */
export function FormTextInput({
  label,
  error,
  touched,
  leftIcon,
  rightSlot,
  containerClassName = "",
  ...rest
}: FormTextInputProps) {
  const { colors } = useTheme();
  const showError = !!error && !!touched;

  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {label ? <Typography variant="label">{label}</Typography> : null}
      <View
        className={`h-12 flex-row items-center gap-2 rounded-xl border bg-white px-4 dark:bg-gray-950 ${
          showError ? "border-red-500" : "border-gray-300 dark:border-gray-700"
        }`}
      >
        {leftIcon}
        <TextInput
          className="flex-1 text-base text-gray-900 dark:text-white"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          accessibilityState={{ disabled: rest.editable === false }}
          {...rest}
        />
        {rightSlot}
      </View>
      {showError ? (
        <Typography
          variant="caption"
          className="text-red-600 dark:text-red-400"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Typography>
      ) : null}
    </View>
  );
}
