import { IconBook2, IconSparkles } from "@tabler/icons-react-native";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, View } from "react-native";

import { SearchForm } from "@/components/forms/SearchForm";
import { Alert } from "@/components/feedback/Alert";
import { EmptyState, ErrorState } from "@/components/feedback/StateView";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WordDetailSkeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { TopNavBar } from "@/components/navigation/TopNavBar";
import { ScreenContainer } from "@/components/navigation/ScreenContainer";
import { useDictionary } from "@/contexts/DictionaryContext";
import { useTheme } from "@/contexts/ThemeContext";

const SUGGESTIONS = ["serendipity", "ephemeral", "resilience", "eloquent", "innovate"];

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { search, loading, error, entries, hasSearched, word, retry } = useDictionary();

  const handleSearch = useCallback(
    async (value: string) => {
      const ok = await search(value);
      if (ok) router.push("/word-detail");
    },
    [search, router],
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <TopNavBar title="Search" />
      <ScreenContainer>
        <AppCard glass className="mb-5 gap-3">
          <View className="flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-gray-900 dark:bg-white">
              <IconBook2 size={20} color={colors.background} />
            </View>
            <View className="flex-1">
              <Typography variant="subheading">Find any English word</Typography>
              <Typography variant="caption">Definitions, phonetics, examples & audio.</Typography>
            </View>
          </View>
          <SearchForm initialValue={word} loading={loading} onSearch={handleSearch} />
        </AppCard>

        {loading ? (
          <WordDetailSkeleton />
        ) : error ? (
          error.kind === "not-found" ? (
            <ErrorState
              title="Word not found"
              description={`We couldn't find "${word}". Check the spelling and try again.`}
              actionLabel="Retry"
              onAction={retry}
            />
          ) : (
            <View className="gap-3">
              <Alert variant="error" title="Search failed" message={error.message} />
              <Button label="Try again" variant="secondary" onPress={retry} />
            </View>
          )
        ) : hasSearched && entries.length > 0 ? (
          <AppCard className="gap-3">
            <Badge label="Last result" tone="success" />
            <Typography variant="title" className="capitalize">
              {entries[0].word}
            </Typography>
            <Typography variant="body" numberOfLines={3}>
              {entries[0].meanings[0]?.definitions[0]?.definition ?? "Definition available."}
            </Typography>
            <Button label="View full details" onPress={() => router.push("/word-detail")} />
          </AppCard>
        ) : (
          <View className="gap-4">
            <EmptyState
              title="Start exploring"
              description="Search a word above or try one of these to get started."
            />
            <View className="flex-row flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => handleSearch(s)}
                  accessibilityRole="button"
                  accessibilityLabel={`Search ${s}`}
                >
                  <Badge label={s} tone="accent" icon={<IconSparkles size={12} color={colors.accent} />} />
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScreenContainer>
    </View>
  );
}
