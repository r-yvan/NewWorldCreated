import React, { useState } from "react";
import { Pressable, View } from "react-native";

import { Typography } from "@/components/ui/Typography";

export interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

/**
 * Press-and-hold tooltip — the closest accessible equivalent to a hover popover
 * on touch devices. Reveals a small bubble above the wrapped element.
 */
export function Tooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  return (
    <View className="relative items-center">
      {visible ? (
        <View className="absolute -top-10 z-10 rounded-lg bg-gray-900 px-3 py-1.5 dark:bg-gray-700">
          <Typography variant="caption" className="text-white dark:text-white">
            {text}
          </Typography>
        </View>
      ) : null}
      <Pressable
        onPressIn={() => setVisible(true)}
        onPressOut={() => setVisible(false)}
        accessibilityLabel={text}
      >
        {children}
      </Pressable>
    </View>
  );
}
