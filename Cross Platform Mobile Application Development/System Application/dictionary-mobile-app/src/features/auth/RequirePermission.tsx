import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

import { ErrorState } from "@/components/feedback/StateView";
import { usePermissions } from "@/contexts/PermissionContext";
import type { Permission } from "@/types";

export interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
}

/** Route guard: blocks a screen's content when the role lacks the permission. */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { can } = usePermissions();
  const router = useRouter();

  if (!can(permission)) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <ErrorState
          title="Access restricted"
          description="Your role does not have permission to view this section."
          actionLabel="Back to Search"
          onAction={() => router.replace("/search")}
        />
      </View>
    );
  }

  return <>{children}</>;
}
