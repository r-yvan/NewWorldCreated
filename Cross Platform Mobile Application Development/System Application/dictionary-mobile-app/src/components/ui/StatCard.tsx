import { IconArrowDownRight, IconArrowUpRight, IconMinus } from "@tabler/icons-react-native";
import React from "react";
import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { Typography } from "@/components/ui/Typography";
import { statusColors } from "@/constants/theme";
import type { Trend } from "@/types";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  trend?: Trend;
  icon?: React.ReactNode;
}

/** KPI tile used across the dashboard. */
export function StatCard({ label, value, delta, trend = "flat", icon }: StatCardProps) {
  const trendColor =
    trend === "up" ? statusColors.success : trend === "down" ? statusColors.danger : statusColors.info;
  const TrendIcon = trend === "up" ? IconArrowUpRight : trend === "down" ? IconArrowDownRight : IconMinus;

  return (
    <AppCard className="flex-1 gap-3">
      <View className="flex-row items-center justify-between">
        <Typography variant="caption" className="uppercase tracking-wide">
          {label}
        </Typography>
        {icon}
      </View>
      <Typography variant="title">{value}</Typography>
      {typeof delta === "number" ? (
        <View className="flex-row items-center gap-1">
          <TrendIcon size={16} color={trendColor} />
          <Typography variant="caption" style={{ color: trendColor }}>
            {delta > 0 ? "+" : ""}
            {delta}% vs last week
          </Typography>
        </View>
      ) : null}
    </AppCard>
  );
}
