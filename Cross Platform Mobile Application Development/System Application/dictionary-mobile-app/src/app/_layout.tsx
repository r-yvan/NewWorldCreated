import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Spinner } from "@/components/ui/Spinner";
import { ToastViewport } from "@/components/feedback/ToastViewport";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { applyGlobalRalewayFont, ralewayFonts } from "@/lib/fonts";
import { AppProviders } from "@/providers/AppProviders";

import "../../global.css";

// Force every Text/TextInput to render in Raleway before the tree mounts.
applyGlobalRalewayFont();

/** Redirects between the auth stack and the protected app based on session. */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/search");
    }
  }, [isAuthenticated, isInitializing, segments, router]);

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <Spinner label="Loading LexiTech…" />
      </View>
    );
  }

  return <>{children}</>;
}

function RootNavigator() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </AuthGate>
      <ToastViewport />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(ralewayFonts);

  if (!fontsLoaded) {
    // Rendered before AppProviders mounts, so it must not depend on any context.
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <ActivityIndicator size="large" color="#8a2be2" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <RootNavigator />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
