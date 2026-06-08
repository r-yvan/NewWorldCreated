import React from "react";
import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { Typography } from "@/components/ui/Typography";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** Consistent wrapper for every chart so analytics styling stays uniform. */
export function ChartCard({ title, subtitle, action, children }: ChartCardProps) {
  return (
    <AppCard className="gap-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Typography variant="subheading">{title}</Typography>
          {subtitle ? <Typography variant="caption">{subtitle}</Typography> : null}
        </View>
        {action}
      </View>
      {children}
    </AppCard>
  );
}
