import { IconQuote } from "@tabler/icons-react-native";
import React from "react";
import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";
import type { Meaning } from "@/types";

export interface MeaningSectionProps {
  meaning: Meaning;
  index: number;
}

/** Renders one part-of-speech block with all of its definitions + examples. */
export function MeaningSection({ meaning, index }: MeaningSectionProps) {
  const { colors } = useTheme();
  return (
    <AppCard className="gap-4">
      <View className="flex-row items-center gap-2">
        <Badge label={meaning.partOfSpeech} tone="accent" />
        <Typography variant="caption">{meaning.definitions.length} definition(s)</Typography>
      </View>

      {meaning.definitions.map((def, i) => (
        <View key={`${index}-${i}`} className="gap-2">
          <View className="flex-row gap-2">
            <Typography variant="label" className="text-gray-400 dark:text-gray-600">
              {i + 1}.
            </Typography>
            <Typography variant="body" className="flex-1 text-gray-900 dark:text-white">
              {def.definition}
            </Typography>
          </View>
          {def.example ? (
            <View className="ml-5 flex-row items-start gap-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <IconQuote size={16} color={colors.textMuted} />
              <Typography variant="body" className="flex-1 italic text-gray-600 dark:text-gray-400">
                {def.example}
              </Typography>
            </View>
          ) : null}
          {def.synonyms && def.synonyms.length > 0 ? (
            <View className="ml-5 flex-row flex-wrap items-center gap-1.5">
              <Typography variant="caption" className="font-medium">
                Synonyms:
              </Typography>
              {def.synonyms.slice(0, 6).map((syn) => (
                <Badge key={syn} label={syn} tone="neutral" />
              ))}
            </View>
          ) : null}
          {i < meaning.definitions.length - 1 ? <Divider className="mt-1" /> : null}
        </View>
      ))}

      {meaning.synonyms && meaning.synonyms.length > 0 ? (
        <View className="flex-row flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3 dark:border-gray-800">
          <Typography variant="caption" className="font-medium">
            Related:
          </Typography>
          {meaning.synonyms.slice(0, 8).map((syn) => (
            <Badge key={syn} label={syn} tone="info" />
          ))}
        </View>
      ) : null}
    </AppCard>
  );
}
