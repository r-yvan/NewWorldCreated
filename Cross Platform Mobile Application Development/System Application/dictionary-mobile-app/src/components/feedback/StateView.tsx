import { IconAlertTriangle, IconCircleCheck, IconMoodEmpty, type Icon as TablerIcon } from "@tabler/icons-react-native";
import React from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";
import { statusColors } from "@/constants/theme";

interface BaseStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function StateShell({
  icon: IconCmp,
  iconColor,
  title,
  description,
  actionLabel,
  onAction,
}: BaseStateProps & { icon: TablerIcon; iconColor: string }) {
  return (
    <View className="items-center justify-center gap-3 px-6 py-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <IconCmp size={30} color={iconColor} />
      </View>
      <Typography variant="heading" className="text-center">
        {title}
      </Typography>
      {description ? (
        <Typography variant="body" className="text-center">
          {description}
        </Typography>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} className="mt-2" />
      ) : null}
    </View>
  );
}

/** Shown before any search / when a list has no items. */
export function EmptyState(props: BaseStateProps) {
  const { colors } = useTheme();
  return <StateShell {...props} icon={IconMoodEmpty} iconColor={colors.icon} />;
}

/** Shown when a request fails; pairs with a retry action. */
export function ErrorState(props: BaseStateProps) {
  return <StateShell {...props} icon={IconAlertTriangle} iconColor={statusColors.danger} />;
}

/** Shown to confirm a successful operation. */
export function SuccessState(props: BaseStateProps) {
  return <StateShell {...props} icon={IconCircleCheck} iconColor={statusColors.success} />;
}
