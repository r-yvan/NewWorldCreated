import React from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Typography } from "@/components/ui/Typography";

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

/** Segmented, scrollable tab control. */
export function Tabs({ tabs, activeKey, onChange, className = "" }: TabsProps) {
  return (
    <View className={`rounded-xl bg-gray-100 p-1 dark:bg-gray-800 ${className}`}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-row gap-1">
          {tabs.map((tab) => {
            const active = tab.key === activeKey;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onChange(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                className={`rounded-lg px-4 py-2 ${active ? "bg-white dark:bg-gray-950" : ""}`}
              >
                <Typography
                  variant="label"
                  className={active ? "" : "text-gray-500 dark:text-gray-400"}
                >
                  {tab.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
