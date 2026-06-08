import { IconError404 } from "@tabler/icons-react-native";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";

/** Fallback screen for any unmatched route. */
export default function NotFound() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <IconError404 size={40} color={colors.icon} />
        </View>
        <Typography variant="title" className="text-center">
          Screen not found
        </Typography>
        <Typography variant="body" className="text-center">
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button label="Back to Search" onPress={() => router.replace("/search")} />
      </View>
    </SafeAreaView>
  );
}
