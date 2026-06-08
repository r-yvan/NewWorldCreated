import { IconX } from "@tabler/icons-react-native";
import React from "react";
import { Modal as RNModal, Pressable, View } from "react-native";

import { IconButton } from "@/components/ui/IconButton";
import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/** Bottom-sheet style modal with a translucent scrim and glass surface. */
export function Modal({ visible, onClose, title, children }: ModalProps) {
  const { colors } = useTheme();
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose} accessibilityLabel="Close modal">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-t-3xl border-t border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
        >
          <View className="mb-3 flex-row items-center justify-between">
            {title ? <Typography variant="heading">{title}</Typography> : <View />}
            <IconButton accessibilityLabel="Close" onPress={onClose}>
              <IconX size={20} color={colors.icon} />
            </IconButton>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
