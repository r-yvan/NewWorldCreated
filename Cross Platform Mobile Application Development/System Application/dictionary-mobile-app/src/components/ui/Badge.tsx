import React from "react";
import { View } from "react-native";

import { Typography } from "@/components/ui/Typography";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

const TONE: Record<Tone, { bg: string; text: string }> = {
  neutral: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
  success: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  warning: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  danger: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  info: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  accent: { bg: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
};

export interface BadgeProps {
  label: string;
  tone?: Tone;
  icon?: React.ReactNode;
  className?: string;
}

/** Compact status pill. Status tones never used as primary branding. */
export function Badge({ label, tone = "neutral", icon, className = "" }: BadgeProps) {
  const t = TONE[tone];
  return (
    <View className={`flex-row items-center gap-1 self-start rounded-full px-2.5 py-1 ${t.bg} ${className}`}>
      {icon}
      <Typography variant="caption" className={`font-medium ${t.text}`}>
        {label}
      </Typography>
    </View>
  );
}
