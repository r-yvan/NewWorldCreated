import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
}

/** Standard screen shell: themed background + safe area + optional scrolling. */
export function ScreenContainer({
  children,
  scroll = true,
  className = "",
  contentClassName = "",
}: ScreenContainerProps) {
  const Body = (
    <View className={`flex-1 px-4 ${contentClassName}`}>{children}</View>
  );

  return (
    <SafeAreaView edges={["bottom"]} className={`flex-1 bg-white dark:bg-gray-950 ${className}`}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {Body}
        </ScrollView>
      ) : (
        <View className="flex-1 py-4">{Body}</View>
      )}
    </SafeAreaView>
  );
}
