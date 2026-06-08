import { IconChevronDown } from "@tabler/icons-react-native";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

import { Modal } from "@/components/ui/Modal";
import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
}

/** Accessible select that opens a modal option list. */
export function Select({ label, placeholder = "Select…", value, options, onChange, error }: SelectProps) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  const selected = options.find((o) => o.value === value);

  return (
    <View className="gap-1.5">
      {label ? <Typography variant="label">{label}</Typography> : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label ?? "Select"}
        className={`h-12 flex-row items-center justify-between rounded-xl border bg-white px-4 dark:bg-gray-950 ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <Typography variant="body" className={selected ? "text-gray-900 dark:text-white" : ""}>
          {selected?.label ?? placeholder}
        </Typography>
        <IconChevronDown size={18} color={colors.icon} />
      </Pressable>
      {error ? (
        <Typography variant="caption" className="text-red-600 dark:text-red-400">
          {error}
        </Typography>
      ) : null}

      <Modal visible={open} onClose={() => setOpen(false)} title={label ?? "Select"}>
        <View className="gap-1 pb-4">
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`rounded-xl px-4 py-3 ${opt.value === value ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            >
              <Typography variant="label">{opt.label}</Typography>
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}
