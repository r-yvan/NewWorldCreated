import {
  IconDownload,
  IconLogin2,
  IconSearch,
  IconVolume,
  IconX,
} from "@tabler/icons-react-native";
import React from "react";
import { View } from "react-native";

import { Typography } from "@/components/ui/Typography";
import { statusColors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import type { ActivityItem, ActivityType } from "@/types";
import { relativeTime } from "@/utils/format";

const ICONS: Record<ActivityType, typeof IconSearch> = {
  search: IconSearch,
  audio: IconVolume,
  "not-found": IconX,
  auth: IconLogin2,
  export: IconDownload,
};

export interface TimelineProps {
  items: ActivityItem[];
}

/** Vertical activity feed used on the dashboard. */
export function Timeline({ items }: TimelineProps) {
  const { colors } = useTheme();
  return (
    <View>
      {items.map((item, index) => {
        const IconCmp = ICONS[item.type];
        const color = item.type === "not-found" ? statusColors.danger : colors.icon;
        const last = index === items.length - 1;
        return (
          <View key={item.id} className="flex-row gap-3">
            <View className="items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <IconCmp size={16} color={color} />
              </View>
              {!last ? <View className="my-1 w-px flex-1 bg-gray-200 dark:bg-gray-800" /> : null}
            </View>
            <View className={`flex-1 ${last ? "" : "pb-4"}`}>
              <Typography variant="label">{item.title}</Typography>
              <Typography variant="caption">{item.description}</Typography>
              <Typography variant="caption" className="mt-0.5 text-gray-400 dark:text-gray-600">
                {relativeTime(item.timestamp)}
              </Typography>
            </View>
          </View>
        );
      })}
    </View>
  );
}
