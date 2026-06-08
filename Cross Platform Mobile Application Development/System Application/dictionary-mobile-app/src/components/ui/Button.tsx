import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { Typography } from "@/components/ui/Typography";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  className?: string;
}

const CONTAINER: Record<Variant, string> = {
  primary: "bg-gray-900 dark:bg-white",
  secondary: "bg-gray-100 dark:bg-gray-800",
  outline: "border border-gray-300 dark:border-gray-700 bg-transparent",
  ghost: "bg-transparent",
  danger: "bg-danger",
};

const LABEL: Record<Variant, string> = {
  primary: "text-white dark:text-gray-900",
  secondary: "text-gray-900 dark:text-white",
  outline: "text-gray-900 dark:text-white",
  ghost: "text-gray-900 dark:text-white",
  danger: "text-white",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3",
  md: "h-12 px-4",
  lg: "h-14 px-5",
};

/** Primary interactive control with loading + disabled handling. */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  accessibilityLabel,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={`flex-row items-center justify-center gap-2 rounded-xl ${CONTAINER[variant]} ${SIZE[size]} ${
        fullWidth ? "w-full" : ""
      } ${isDisabled ? "opacity-50" : "active:opacity-80"} ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" ? undefined : undefined} />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <Typography variant="label" className={LABEL[variant]}>
            {label}
          </Typography>
        </>
      )}
    </Pressable>
  );
}
