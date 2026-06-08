import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react-native";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dropdown } from "@/components/ui/Dropdown";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ROLE_LABELS } from "@/constants/rbac";

/** Profile avatar that opens an account dropdown with role-aware actions. */
export function UserMenu() {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const { colors } = useTheme();
  const { success } = useNotifications();
  const router = useRouter();
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  if (!user) return null;

  const items = [
    { key: "profile", label: "My Profile", icon: <IconUser size={18} color={colors.icon} /> },
    ...(can("settings.manage")
      ? [{ key: "settings", label: "Settings", icon: <IconSettings size={18} color={colors.icon} /> }]
      : []),
    { key: "logout", label: "Log out", icon: <IconLogout size={18} color={colors.icon} />, destructive: true },
  ];

  const handleSelect = (key: string) => {
    if (key === "profile") router.push("/profile");
    else if (key === "settings") router.push("/settings");
    else if (key === "logout") setConfirmLogout(true);
  };

  return (
    <>
      <Dropdown
        items={items}
        onSelect={handleSelect}
        trigger={(open) => (
          <Pressable onPress={open} accessibilityLabel={`Account menu for ${user.name}`}>
            <Avatar name={user.name} color={user.avatarColor} size={38} />
          </Pressable>
        )}
      />
      <ConfirmDialog
        visible={confirmLogout}
        title="Log out"
        message={`You are signed in as ${ROLE_LABELS[user.role]}. Log out of LexiTech Dictionary?`}
        confirmLabel="Log out"
        destructive
        onCancel={() => setConfirmLogout(false)}
        onConfirm={async () => {
          setConfirmLogout(false);
          await logout();
          success("Signed out", "You have been logged out.");
          router.replace("/login");
        }}
      />
    </>
  );
}
