import { DrawerActions } from "@react-navigation/native";
import { IconMenu2, IconMoon, IconSun } from "@tabler/icons-react-native";
import { useNavigation } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "@/components/ui/IconButton";
import { Typography } from "@/components/ui/Typography";
import { UserMenu } from "@/components/navigation/UserMenu";
import { useTheme } from "@/contexts/ThemeContext";

export interface TopNavBarProps {
  title: string;
}

/** Sticky app header: drawer toggle, screen title, theme switch, profile menu. */
export function TopNavBar({ title }: TopNavBarProps) {
  const navigation = useNavigation();
  const { colors, isDark, toggle } = useTheme();

  return (
    <SafeAreaView edges={["top"]} className="bg-white dark:bg-gray-950">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-800">
        <View className="flex-row items-center gap-1">
          <IconButton
            accessibilityLabel="Open navigation menu"
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <IconMenu2 size={22} color={colors.icon} />
          </IconButton>
          <Typography variant="heading">{title}</Typography>
        </View>
        <View className="flex-row items-center gap-1">
          <IconButton accessibilityLabel="Toggle theme" onPress={toggle}>
            {isDark ? <IconSun size={20} color={colors.icon} /> : <IconMoon size={20} color={colors.icon} />}
          </IconButton>
          <UserMenu />
        </View>
      </View>
    </SafeAreaView>
  );
}
