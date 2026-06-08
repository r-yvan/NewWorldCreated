import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react-native";
import React from "react";
import { View } from "react-native";

import { Typography } from "@/components/ui/Typography";
import { statusColors } from "@/constants/theme";

export type AlertVariant = "success" | "warning" | "error" | "info";

const CONFIG = {
  success: { icon: IconCircleCheck, color: statusColors.success, bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30" },
  warning: { icon: IconAlertTriangle, color: statusColors.warning, bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30" },
  error: { icon: IconAlertCircle, color: statusColors.danger, bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/30" },
  info: { icon: IconInfoCircle, color: statusColors.info, bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/30" },
} as const;

export interface AlertProps {
  variant?: AlertVariant;
  title: string;
  message?: string;
  className?: string;
}

/** Inline contextual banner. Status colour is paired with an icon (never colour-only). */
export function Alert({ variant = "info", title, message, className = "" }: AlertProps) {
  const cfg = CONFIG[variant];
  const IconCmp = cfg.icon;
  return (
    <View
      className={`flex-row gap-3 rounded-xl border p-4 ${cfg.bg} ${cfg.border} ${className}`}
      accessibilityRole="alert"
    >
      <IconCmp size={20} color={cfg.color} />
      <View className="flex-1">
        <Typography variant="label">{title}</Typography>
        {message ? (
          <Typography variant="caption" className="mt-0.5 text-gray-600 dark:text-gray-400">
            {message}
          </Typography>
        ) : null}
      </View>
    </View>
  );
}
