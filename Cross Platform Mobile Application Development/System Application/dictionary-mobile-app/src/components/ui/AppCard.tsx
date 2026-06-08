import React from "react";
import { View, ViewProps } from "react-native";

export interface AppCardProps extends ViewProps {
  className?: string;
  /** Adds a subtle translucent treatment for premium hero/dialog surfaces. */
  glass?: boolean;
  children: React.ReactNode;
}

/** Base surface for the whole design system: rounded, bordered, soft-shadowed. */
export function AppCard({ className = "", glass = false, children, ...rest }: AppCardProps) {
  const base = glass
    ? "bg-white/80 dark:bg-gray-900/70 border-gray-200/70 dark:border-gray-800/70"
    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800";
  return (
    <View
      className={`rounded-2xl border ${base} p-5 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
