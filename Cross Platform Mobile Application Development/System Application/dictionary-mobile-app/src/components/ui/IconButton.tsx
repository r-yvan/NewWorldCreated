import React from "react";
import { Pressable } from "react-native";

export interface IconButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
  disabled?: boolean;
  variant?: "ghost" | "surface";
  className?: string;
}

/** Square, touch-friendly icon control (min 44px target for accessibility). */
export function IconButton({
  onPress,
  children,
  accessibilityLabel,
  disabled = false,
  variant = "ghost",
  className = "",
}: IconButtonProps) {
  const bg = variant === "surface" ? "bg-gray-100 dark:bg-gray-800" : "bg-transparent";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={8}
      className={`h-11 w-11 items-center justify-center rounded-xl ${bg} ${
        disabled ? "opacity-40" : "active:opacity-70"
      } ${className}`}
    >
      {children}
    </Pressable>
  );
}
