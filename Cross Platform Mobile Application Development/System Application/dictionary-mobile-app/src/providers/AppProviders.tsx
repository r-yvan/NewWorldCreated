import React from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { DictionaryProvider } from "@/contexts/DictionaryContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

/** Single composition root for every app-wide context provider. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <PermissionProvider>
            <HistoryProvider>
              <DictionaryProvider>{children}</DictionaryProvider>
            </HistoryProvider>
          </PermissionProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
