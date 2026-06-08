import { IconChevronRight } from "@tabler/icons-react-native";
import React from "react";
import { View } from "react-native";

import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";

export interface ScreenHeaderProps {
  title: string;
  /** Breadcrumb-like trail rendered above the title. */
  breadcrumbs?: string[];
  subtitle?: string;
  right?: React.ReactNode;
}

/** In-screen header with a breadcrumb trail and optional right actions. */
export function ScreenHeader({ title, breadcrumbs, subtitle, right }: ScreenHeaderProps) {
  const { colors } = useTheme();
  return (
    <View className="mb-4 gap-1">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <View className="flex-row flex-wrap items-center">
          {breadcrumbs.map((crumb, i) => (
            <View key={`${crumb}-${i}`} className="flex-row items-center">
              <Typography variant="caption">{crumb}</Typography>
              {i < breadcrumbs.length - 1 ? (
                <IconChevronRight size={12} color={colors.textMuted} style={{ marginHorizontal: 2 }} />
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Typography variant="title">{title}</Typography>
          {subtitle ? <Typography variant="body" className="mt-0.5">{subtitle}</Typography> : null}
        </View>
        {right}
      </View>
    </View>
  );
}
