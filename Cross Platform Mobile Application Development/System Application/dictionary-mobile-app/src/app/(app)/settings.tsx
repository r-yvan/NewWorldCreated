import {
  IconDeviceLaptop,
  IconInfoCircle,
  IconMoon,
  IconSun,
} from "@tabler/icons-react-native";
import React, { useState } from "react";
import { Switch, View } from "react-native";

import { FileUpload } from "@/components/forms/FileUpload";
import { Tabs } from "@/components/ui/Tabs";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { Typography } from "@/components/ui/Typography";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { ScreenContainer } from "@/components/navigation/ScreenContainer";
import { TopNavBar } from "@/components/navigation/TopNavBar";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { APP_META } from "@/constants/config";
import { ROLE_LABELS } from "@/constants/rbac";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTheme, type ThemePreference } from "@/contexts/ThemeContext";
import { palette } from "@/constants/theme";

const THEME_TABS = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
];

function Row({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-1">
      <View className="flex-1">
        <Typography variant="label">{title}</Typography>
        {description ? <Typography variant="caption">{description}</Typography> : null}
      </View>
      {children}
    </View>
  );
}

function SettingsContent() {
  const { user } = useAuth();
  const { preference, setPreference, isDark } = useTheme();
  const { success, info } = useNotifications();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <TopNavBar title="Settings" />
      <ScreenContainer>
        <ScreenHeader title="Settings" breadcrumbs={["Home", "Settings"]} subtitle="Manage appearance and preferences." />

        <View className="gap-4">
          {/* Appearance */}
          <AppCard className="gap-4">
            <View className="flex-row items-center gap-2">
              {isDark ? <IconMoon size={18} color={palette.gray400} /> : <IconSun size={18} color={palette.gray600} />}
              <Typography variant="subheading">Appearance</Typography>
            </View>
            <Tabs
              tabs={THEME_TABS}
              activeKey={preference}
              onChange={(key) => {
                setPreference(key as ThemePreference);
                info("Theme updated", `Switched to ${key} mode.`);
              }}
            />
            <View className="flex-row items-center gap-2">
              <IconDeviceLaptop size={16} color={palette.gray500} />
              <Typography variant="caption">
                System option follows your device&apos;s appearance settings.
              </Typography>
            </View>
          </AppCard>

          {/* Notifications */}
          <AppCard className="gap-3">
            <Typography variant="subheading">Notifications</Typography>
            <Row title="Push notifications" description="Receive in-app alerts and updates.">
              <Switch
                value={pushEnabled}
                onValueChange={(v) => {
                  setPushEnabled(v);
                  success("Preference saved", `Push notifications ${v ? "enabled" : "disabled"}.`);
                }}
                trackColor={{ true: palette.accent }}
              />
            </Row>
            <Divider />
            <Row title="Pronunciation sounds" description="Auto-prepare audio playback.">
              <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ true: palette.accent }} />
            </Row>
          </AppCard>

          {/* Data import (mock file upload) */}
          <AppCard className="gap-3">
            <Typography variant="subheading">Data import</Typography>
            <FileUpload
              label="Import word list"
              hint="Tap to import a CSV of words (simulated)"
              sampleFileName="vocabulary.csv"
            />
          </AppCard>

          {/* Account summary */}
          {user ? (
            <AppCard className="gap-3">
              <Typography variant="subheading">Account</Typography>
              <Row title="Signed in as" description={user.email}>
                <Badge label={ROLE_LABELS[user.role]} tone="accent" />
              </Row>
            </AppCard>
          ) : null}

          {/* About */}
          <AppCard className="gap-2">
            <View className="flex-row items-center gap-2">
              <IconInfoCircle size={18} color={palette.gray500} />
              <Typography variant="subheading">About</Typography>
            </View>
            <Row title="Application" description={`${APP_META.name} v${APP_META.version}`} />
            <Row title="Company" description={`${APP_META.company}, ${APP_META.location}`} />
            <Row title="Data source" description="Free Dictionary API (dictionaryapi.dev)" />
          </AppCard>
        </View>
      </ScreenContainer>
    </View>
  );
}

export default function SettingsScreen() {
  return (
    <RequirePermission permission="settings.manage">
      <SettingsContent />
    </RequirePermission>
  );
}
