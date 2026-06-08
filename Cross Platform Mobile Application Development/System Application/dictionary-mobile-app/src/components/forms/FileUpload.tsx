import { IconCloudUpload, IconFileCheck } from "@tabler/icons-react-native";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

import { Typography } from "@/components/ui/Typography";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme } from "@/contexts/ThemeContext";

export interface FileUploadProps {
  label?: string;
  hint?: string;
  /** Simulated file name produced when the user "uploads". */
  sampleFileName?: string;
  onUploaded?: (fileName: string) => void;
}

/**
 * Mocked file-upload control. Tapping simulates picking a file and reports a
 * success state — no native file picker dependency is required for the demo.
 */
export function FileUpload({
  label = "Upload file",
  hint = "Tap to select a file (simulated)",
  sampleFileName = "word-list.csv",
  onUploaded,
}: FileUploadProps) {
  const { colors } = useTheme();
  const { success } = useNotifications();
  const [uploaded, setUploaded] = useState<string | null>(null);

  const handleUpload = () => {
    setUploaded(sampleFileName);
    onUploaded?.(sampleFileName);
    success("Upload complete", `${sampleFileName} was processed.`);
  };

  return (
    <View className="gap-1.5">
      {label ? (
        <Typography variant="label" className="text-center">
          {label}
        </Typography>
      ) : null}
      <Pressable
        onPress={handleUpload}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="items-center justify-center gap-2 w-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-6 px-14 active:opacity-70 dark:border-gray-700 dark:bg-gray-900"
      >
        {uploaded ? (
          <IconFileCheck size={26} color={colors.icon} />
        ) : (
          <IconCloudUpload size={26} color={colors.icon} />
        )}
        <Typography variant="body" className="text-gray-900 dark:text-white">
          {uploaded ?? hint}
        </Typography>
      </Pressable>
    </View>
  );
}
