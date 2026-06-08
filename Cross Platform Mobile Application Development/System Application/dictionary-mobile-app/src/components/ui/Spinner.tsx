import React from "react";
import { ActivityIndicator, View } from "react-native";

import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";

export interface SpinnerProps {
  label?: string;
  size?: "small" | "large";
  className?: string;
}

/** Centered loading spinner with an optional caption. */
export function Spinner({ label, size = "large", className = "" }: SpinnerProps) {
  const { colors } = useTheme();
  return (
    <View className={`items-center justify-center gap-3 py-6 ${className}`} accessibilityRole="progressbar">
      <ActivityIndicator size={size} color={colors.text} />
      {label ? <Typography variant="caption">{label}</Typography> : null}
    </View>
  );
}
