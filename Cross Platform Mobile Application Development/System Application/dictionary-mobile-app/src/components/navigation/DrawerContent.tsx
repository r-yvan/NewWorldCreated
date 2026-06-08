import { DrawerContentComponentProps } from "@react-navigation/drawer";
import {
  IconBook2,
  IconChartHistogram,
  IconHistory,
  IconLayoutDashboard,
  IconSearch,
  IconSettings,
  IconTrash,
  IconUser,
  IconVolume,
} from "@tabler/icons-react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Divider } from "@/components/ui/Divider";
import { IconButton } from "@/components/ui/IconButton";
import { Typography } from "@/components/ui/Typography";
import { APP_META } from "@/constants/config";
import { ROLE_LABELS } from "@/constants/rbac";
import { useAuth } from "@/contexts/AuthContext";
import { useDictionary } from "@/contexts/DictionaryContext";
import { useHistory } from "@/contexts/HistoryContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Permission } from "@/types";

interface NavLink {
  key: string;
  label: string;
  route: "/search" | "/dashboard" | "/history" | "/settings" | "/profile";
  icon: typeof IconSearch;
  permission?: Permission;
}

const NAV_LINKS: NavLink[] = [
  { key: "search", label: "Search", route: "/search", icon: IconSearch, permission: "dictionary.search" },
  { key: "dashboard", label: "Dashboard", route: "/dashboard", icon: IconLayoutDashboard, permission: "dashboard.view" },
  { key: "history", label: "Search History", route: "/history", icon: IconHistory, permission: "history.view" },
  { key: "settings", label: "Settings", route: "/settings", icon: IconSettings, permission: "settings.manage" },
  { key: "profile", label: "My Profile", route: "/profile", icon: IconUser },
];

/** Custom drawer: brand, permission-filtered navigation and live search history. */
export function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { can } = usePermissions();
  const { history, clearHistory } = useHistory();
  const { search } = useDictionary();
  const { info, success } = useNotifications();
  const [confirmClear, setConfirmClear] = useState(false);

  const activeRoute = props.state.routeNames[props.state.index];

  const go = (route: NavLink["route"]) => {
    props.navigation.closeDrawer();
    router.push(route);
  };

  const openHistoryWord = async (word: string) => {
    props.navigation.closeDrawer();
    info("Searching", `Looking up "${word}"…`);
    const ok = await search(word);
    if (ok) router.push("/word-detail");
  };

  const visibleLinks = NAV_LINKS.filter((l) => !l.permission || can(l.permission));

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center gap-3 px-5 py-4">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-gray-900 dark:bg-white">
            <IconBook2 size={22} color={colors.background} />
          </View>
          <View>
            <Typography variant="subheading">{APP_META.name}</Typography>
            <Typography variant="caption">{APP_META.company}</Typography>
          </View>
        </View>
      </SafeAreaView>
      <Divider />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 12 }}>
        <View className="px-3">
          {visibleLinks.map((link) => {
            const active = activeRoute === link.key;
            const IconCmp = link.icon;
            return (
              <Pressable
                key={link.key}
                onPress={() => go(link.route)}
                accessibilityRole="link"
                accessibilityState={{ selected: active }}
                className={`mb-1 flex-row items-center gap-3 rounded-xl px-3 py-3 ${
                  active ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
              >
                <IconCmp size={20} color={active ? colors.text : colors.icon} />
                <Typography variant="label" className={active ? "" : "text-gray-600 dark:text-gray-300"}>
                  {link.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>

        {can("history.view") ? (
          <>
            <View className="mt-4 flex-row items-center justify-between px-5">
              <Typography variant="caption" className="uppercase tracking-wide">
                Recent Searches
              </Typography>
              {history.length > 0 && can("history.clear") ? (
                <IconButton accessibilityLabel="Clear search history" onPress={() => setConfirmClear(true)}>
                  <IconTrash size={16} color={colors.icon} />
                </IconButton>
              ) : null}
            </View>
            <View className="px-3 pt-1">
              {history.length === 0 ? (
                <Typography variant="caption" className="px-2 py-2">
                  No searches yet. Look up a word to build your history.
                </Typography>
              ) : (
                history.slice(0, 12).map((item) => (
                  <Pressable
                    key={item.word}
                    onPress={() => openHistoryWord(item.word)}
                    accessibilityLabel={`Search ${item.word} again`}
                    className="mb-0.5 flex-row items-center justify-between rounded-xl px-3 py-2.5 active:bg-gray-100 dark:active:bg-gray-800"
                  >
                    <View className="flex-1 flex-row items-center gap-2">
                      <IconSearch size={16} color={colors.icon} />
                      <Typography variant="body" className="flex-1 capitalize text-gray-900 dark:text-white">
                        {item.word}
                      </Typography>
                    </View>
                    {item.hasAudio ? <IconVolume size={14} color={colors.textMuted} /> : null}
                  </Pressable>
                ))
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      <Divider />
      {user ? (
        <SafeAreaView edges={["bottom"]}>
          <Pressable
            onPress={() => go("/profile")}
            className="flex-row items-center gap-3 px-5 py-4"
            accessibilityLabel="Open profile"
          >
            <Avatar name={user.name} color={user.avatarColor} size={40} />
            <View className="flex-1">
              <Typography variant="label" numberOfLines={1}>
                {user.name}
              </Typography>
              <Badge label={ROLE_LABELS[user.role]} tone="accent" icon={<IconChartHistogram size={12} color={colors.accent} />} />
            </View>
          </Pressable>
        </SafeAreaView>
      ) : null}

      <ConfirmDialog
        visible={confirmClear}
        title="Clear history"
        message="This will permanently remove all your saved searches on this device."
        confirmLabel="Clear"
        destructive
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearHistory();
          setConfirmClear(false);
          success("History cleared", "Your search history has been removed.");
        }}
      />
    </View>
  );
}
