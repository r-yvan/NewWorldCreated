import { IconExternalLink } from "@tabler/icons-react-native";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Linking, Pressable, View } from "react-native";

import { EmptyState } from "@/components/feedback/StateView";
import { AppCard } from "@/components/ui/AppCard";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Typography } from "@/components/ui/Typography";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { TopNavBar } from "@/components/navigation/TopNavBar";
import { AudioSelector } from "@/features/dictionary/AudioSelector";
import { MeaningSection } from "@/features/dictionary/MeaningSection";
import { WordHeader } from "@/features/dictionary/WordHeader";
import { useDictionary } from "@/contexts/DictionaryContext";
import { useTheme } from "@/contexts/ThemeContext";
import { collectAudioPhonetics } from "@/services/dictionary.service";
import type { Meaning } from "@/types";

export default function WordDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { entries, word } = useDictionary();

  const primary = entries[0];
  const audioPhonetics = useMemo(() => collectAudioPhonetics(primary), [primary]);

  // Flatten meanings across all entries while keeping a stable key.
  const meanings = useMemo<{ meaning: Meaning; key: string }[]>(
    () =>
      entries.flatMap((entry, ei) =>
        entry.meanings.map((meaning, mi) => ({ meaning, key: `${ei}-${mi}-${meaning.partOfSpeech}` })),
      ),
    [entries],
  );

  if (!primary) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <TopNavBar title="Word Details" />
        <View className="flex-1 items-center justify-center">
          <EmptyState
            title="No word selected"
            description="Search for a word to see its full definition here."
            actionLabel="Go to Search"
            onAction={() => router.replace("/search")}
          />
        </View>
      </View>
    );
  }

  const sourceUrl = primary.sourceUrls?.[0];

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <TopNavBar title="Word Details" />
      <FlatList
        data={meanings}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="gap-4 pb-1">
            <ScreenHeader title="" breadcrumbs={["Search", word]} />
            <AppCard className="gap-4">
              <WordHeader entry={primary} />
              {audioPhonetics.length > 1 ? (
                <>
                  <Divider />
                  <AudioSelector phonetics={audioPhonetics} word={primary.word} />
                </>
              ) : null}
              {primary.origin ? (
                <>
                  <Divider />
                  <View className="gap-1">
                    <Typography variant="caption" className="uppercase tracking-wide">
                      Origin
                    </Typography>
                    <Typography variant="body">{primary.origin}</Typography>
                  </View>
                </>
              ) : null}
            </AppCard>
            <Typography variant="heading" className="mt-1">
              Meanings
            </Typography>
          </View>
        }
        renderItem={({ item, index }) => <MeaningSection meaning={item.meaning} index={index} />}
        ListFooterComponent={
          <View className="mt-4 gap-3">
            {sourceUrl ? (
              <Pressable
                onPress={() => Linking.openURL(sourceUrl)}
                accessibilityRole="link"
                accessibilityLabel="Open source"
                className="flex-row items-center gap-2"
              >
                <IconExternalLink size={16} color={colors.icon} />
                <Typography variant="label" className="text-violet-600 dark:text-violet-400">
                  Source: {sourceUrl.replace("https://", "")}
                </Typography>
              </Pressable>
            ) : null}
            <Button label="New search" variant="secondary" onPress={() => router.push("/search")} />
          </View>
        }
      />
    </View>
  );
}
