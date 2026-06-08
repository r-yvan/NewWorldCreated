import { IconSearch, IconTrash, IconVolume } from "@tabler/icons-react-native";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";

import { FormTextInput } from "@/components/forms/FormTextInput";
import { EmptyState } from "@/components/feedback/StateView";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/IconButton";
import { Typography } from "@/components/ui/Typography";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { TopNavBar } from "@/components/navigation/TopNavBar";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { useDictionary } from "@/contexts/DictionaryContext";
import { useHistory } from "@/contexts/HistoryContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { relativeTime } from "@/utils/format";

const PAGE_SIZE = 8;

function HistoryContent() {
  const router = useRouter();
  const { colors } = useTheme();
  const { history, removeFromHistory, clearHistory } = useHistory();
  const { search } = useDictionary();
  const { can } = usePermissions();
  const { info, success } = useNotifications();
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(
    () => history.filter((h) => h.word.toLowerCase().includes(query.trim().toLowerCase())),
    [history, query],
  );
  const paged = filtered.slice(0, visible);

  const openWord = async (word: string) => {
    info("Searching", `Looking up "${word}"…`);
    const ok = await search(word);
    if (ok) router.push("/word-detail");
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <TopNavBar title="Search History" />
      <FlatList
        data={paged}
        keyExtractor={(item) => item.word}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="gap-4 pb-1">
            <ScreenHeader
              title="Search History"
              breadcrumbs={["Home", "History"]}
              subtitle={`${history.length} saved search${history.length === 1 ? "" : "es"}`}
              right={
                history.length > 0 && can("history.clear") ? (
                  <Button
                    label="Clear all"
                    variant="outline"
                    size="sm"
                    icon={<IconTrash size={16} color={colors.text} />}
                    onPress={() => setConfirmClear(true)}
                  />
                ) : undefined
              }
            />
            {history.length > 0 ? (
              <FormTextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Filter your history…"
                autoCapitalize="none"
                leftIcon={<IconSearch size={18} color={colors.icon} />}
              />
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => openWord(item.word)} accessibilityLabel={`Search ${item.word} again`}>
            <AppCard className="flex-row items-center justify-between gap-3 py-4">
              <View className="flex-1 gap-1.5">
                <Typography variant="subheading" className="capitalize">
                  {item.word}
                </Typography>
                <View className="flex-row flex-wrap items-center gap-1.5">
                  {item.partsOfSpeech.slice(0, 3).map((pos) => (
                    <Badge key={pos} label={pos} tone="neutral" />
                  ))}
                  {item.hasAudio ? (
                    <Badge label="audio" tone="info" icon={<IconVolume size={12} color={colors.accent} />} />
                  ) : null}
                </View>
                <Typography variant="caption">{relativeTime(item.searchedAt)}</Typography>
              </View>
              <IconButton
                accessibilityLabel={`Remove ${item.word} from history`}
                onPress={() => removeFromHistory(item.word)}
                variant="surface"
              >
                <IconTrash size={18} color={colors.icon} />
              </IconButton>
            </AppCard>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            title={query ? "No matches" : "No history yet"}
            description={
              query
                ? "No saved searches match your filter."
                : "Words you successfully search will appear here for quick access."
            }
            actionLabel={query ? undefined : "Go to Search"}
            onAction={query ? undefined : () => router.replace("/search")}
          />
        }
        ListFooterComponent={
          filtered.length > visible ? (
            <Button
              label={`Load more (${filtered.length - visible})`}
              variant="ghost"
              onPress={() => setVisible((v) => v + PAGE_SIZE)}
            />
          ) : null
        }
      />

      <ConfirmDialog
        visible={confirmClear}
        title="Clear history"
        message="This permanently removes all saved searches on this device."
        confirmLabel="Clear all"
        destructive
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearHistory();
          setConfirmClear(false);
          success("History cleared", "All saved searches removed.");
        }}
      />
    </View>
  );
}

export default function HistoryScreen() {
  return (
    <RequirePermission permission="history.view">
      <HistoryContent />
    </RequirePermission>
  );
}
