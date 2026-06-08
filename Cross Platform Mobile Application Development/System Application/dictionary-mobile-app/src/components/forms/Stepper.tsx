import { IconCheck } from "@tabler/icons-react-native";
import React from "react";
import { View } from "react-native";

import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";

export interface StepperProps {
  steps: string[];
  current: number;
}

/** Horizontal progress indicator for multi-step forms. */
export function Stepper({ steps, current }: StepperProps) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} className="flex-1 flex-row items-center">
            <View className="items-center">
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  done || active
                    ? "bg-gray-900 dark:bg-white"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                {done ? (
                  <IconCheck size={16} color={colors.background} />
                ) : (
                  <Typography
                    variant="caption"
                    className={
                      active ? "text-white dark:text-gray-900" : "text-gray-500"
                    }
                  >
                    {i + 1}
                  </Typography>
                )}
              </View>
              <Typography variant="caption" className="mt-1 text-[10px]">
                {label}
              </Typography>
            </View>
            {i < steps.length - 1 ? (
              <View
                className={`mx-1 h-px flex-1 ${done ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-gray-800"}`}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
