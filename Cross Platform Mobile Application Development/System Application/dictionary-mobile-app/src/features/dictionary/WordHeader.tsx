import React from "react";
import { View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import { PronunciationButton } from "@/features/dictionary/PronunciationButton";
import { findAudioUrl, findPhoneticText } from "@/services/dictionary.service";
import type { DictionaryEntry } from "@/types";

export interface WordHeaderProps {
  entry: DictionaryEntry;
}

/** Prominent word title, phonetic spelling and audio control. */
export function WordHeader({ entry }: WordHeaderProps) {
  const phonetic = findPhoneticText(entry);
  const audioUrl = findAudioUrl(entry);
  const partsOfSpeech = Array.from(
    new Set(entry.meanings.map((m) => m.partOfSpeech)),
  );

  return (
    <View className="gap-3">
      <Typography variant="display" className="capitalize">
        {entry.word}
      </Typography>
      {phonetic ? (
        <Tooltip text="Phonetic spelling (IPA)">
          <Typography
            variant="heading"
            className="self-start text-gray-500 dark:text-gray-400"
          >
            {phonetic}
          </Typography>
        </Tooltip>
      ) : null}
      <View className="flex-row flex-wrap gap-2">
        {partsOfSpeech.map((pos) => (
          <Badge key={pos} label={pos} tone="neutral" />
        ))}
      </View>
      <PronunciationButton audioUrl={audioUrl} word={entry.word} />
    </View>
  );
}
