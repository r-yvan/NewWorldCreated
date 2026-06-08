import { IconBook2 } from "@tabler/icons-react-native";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Typography } from "@/components/ui/Typography";
import { APP_META } from "@/constants/config";
import { useTheme } from "@/contexts/ThemeContext";

export interface AuthScaffoldProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Shared, keyboard-aware layout for every authentication screen. */
export function AuthScaffold({ title, subtitle, children, footer }: AuthScaffoldProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8 items-center gap-3">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 dark:bg-white">
              <IconBook2 size={32} color={colors.background} />
            </View>
            <Typography variant="caption" className="uppercase tracking-widest">
              {APP_META.company}
            </Typography>
          </View>

          <View className="gap-1">
            <Typography variant="title">{title}</Typography>
            <Typography variant="body">{subtitle}</Typography>
          </View>

          <View className="mt-6 gap-4">{children}</View>

          {footer ? <View className="mt-6">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
