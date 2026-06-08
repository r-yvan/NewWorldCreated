import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Typography } from "@/components/ui/Typography";
import {
  useNotifications,
  type ToastVariant,
} from "@/contexts/NotificationContext";
import { statusColors } from "@/constants/theme";

const CONFIG: Record<
  ToastVariant,
  { icon: typeof IconInfoCircle; color: string }
> = {
  success: { icon: IconCircleCheck, color: statusColors.success },
  error: { icon: IconAlertCircle, color: statusColors.danger },
  warning: { icon: IconAlertTriangle, color: statusColors.warning },
  info: { icon: IconInfoCircle, color: statusColors.info },
};

/** Global toast host. Mount once near the app root, above all screens. */
export function ToastViewport() {
  const { toasts, dismiss } = useNotifications();
  if (toasts.length === 0) return null;

  return (
    <SafeAreaView
      pointerEvents="box-none"
      className="absolute inset-x-0 top-0 z-50 px-4"
    >
      <View className="gap-2 pt-6" pointerEvents="box-none">
        {toasts.map((toast) => {
          const cfg = CONFIG[toast.variant];
          const IconCmp = cfg.icon;
          return (
            <View
              key={toast.id}
              accessibilityRole="alert"
              className="flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900/95"
            >
              <IconCmp size={22} color={cfg.color} />
              <View className="flex-1">
                <Typography variant="label">{toast.title}</Typography>
                {toast.message ? (
                  <Typography variant="caption" className="mt-0.5">
                    {toast.message}
                  </Typography>
                ) : null}
              </View>
              <Pressable
                onPress={() => dismiss(toast.id)}
                accessibilityLabel="Dismiss notification"
                hitSlop={8}
              >
                <IconX size={18} color={statusColors.info} />
              </Pressable>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
