import { IconCheck } from "@tabler/icons-react-native";
import React, { useState } from "react";
import { Modal as RNModal, Pressable, View } from "react-native";

import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";

export interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
}

export interface DropdownProps {
  trigger: (open: () => void) => React.ReactNode;
  items: DropdownItem[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  anchor?: "left" | "right";
}

/** Lightweight anchored menu used by the profile dropdown & filters. */
export function Dropdown({ trigger, items, selectedKey, onSelect, anchor = "right" }: DropdownProps) {
  const [visible, setVisible] = useState(false);
  const { colors } = useTheme();

  const handleSelect = (key: string) => {
    setVisible(false);
    onSelect(key);
  };

  return (
    <>
      {trigger(() => setVisible(true))}
      <RNModal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable className="flex-1 bg-black/30" onPress={() => setVisible(false)}>
          <View
            className={`absolute top-24 ${anchor === "right" ? "right-4" : "left-4"} w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900`}
          >
            {items.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => handleSelect(item.key)}
                accessibilityRole="menuitem"
                className="flex-row items-center justify-between px-4 py-3 active:bg-gray-100 dark:active:bg-gray-800"
              >
                <View className="flex-row items-center gap-3">
                  {item.icon}
                  <Typography
                    variant="label"
                    className={item.destructive ? "text-red-600 dark:text-red-400" : ""}
                  >
                    {item.label}
                  </Typography>
                </View>
                {selectedKey === item.key ? <IconCheck size={18} color={colors.icon} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </RNModal>
    </>
  );
}
