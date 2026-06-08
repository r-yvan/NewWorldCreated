import React from "react";
import { Modal as RNModal, Pressable, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Centered confirmation dialog for destructive / important actions. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/50 px-6" onPress={onCancel}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-md gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
        >
          <Typography variant="heading">{title}</Typography>
          <Typography variant="body">{message}</Typography>
          <View className="mt-2 flex-row justify-end gap-3">
            <Button label={cancelLabel} variant="outline" onPress={onCancel} />
            <Button
              label={confirmLabel}
              variant={destructive ? "danger" : "primary"}
              onPress={onConfirm}
            />
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
