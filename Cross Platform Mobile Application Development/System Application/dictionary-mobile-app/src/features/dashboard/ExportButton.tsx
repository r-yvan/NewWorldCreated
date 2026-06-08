import { IconDownload } from "@tabler/icons-react-native";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";

import { SuccessState } from "@/components/feedback/StateView";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Typography } from "@/components/ui/Typography";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { trackEvent } from "@/services/analytics.service";

export interface ExportButtonProps {
  /** CSV-like payload to "export". */
  payload: string;
  filename?: string;
}

/**
 * Simulated export action. Generates a CSV preview, shows it in a modal and
 * confirms the (local) export with a toast — no native file APIs required.
 */
export function ExportButton({
  payload,
  filename = "analytics-export.csv",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const { success } = useNotifications();
  const { colors } = useTheme();

  const close = () => {
    setOpen(false);
    setDone(false);
  };

  return (
    <>
      <Button
        label="Export"
        variant="outline"
        size="sm"
        icon={<IconDownload size={16} color={colors.text} />}
        onPress={() => setOpen(true)}
        accessibilityLabel="Export dashboard data"
      />
      <Modal visible={open} onClose={close} title="Export analytics">
        {done ? (
          <View className="pb-4">
            <SuccessState
              title="Export complete"
              description={`${filename} was generated successfully.`}
              actionLabel="Done"
              onAction={close}
            />
          </View>
        ) : (
          <View className="gap-3 pb-4">
            <Typography variant="caption">{filename}</Typography>
            <ScrollView className="max-h-60 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <Typography variant="body" className="font-mono text-xs">
                {payload}
              </Typography>
            </ScrollView>
            <Button
              label="Confirm export"
              onPress={() => {
                void trackEvent({ type: "export" });
                success("Export ready", `${filename} generated successfully.`);
                setDone(true);
              }}
              fullWidth
            />
          </View>
        )}
      </Modal>
    </>
  );
}
