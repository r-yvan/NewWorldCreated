import { IconVolume } from "@tabler/icons-react-native";
import React from "react";
import { Pressable, View } from "react-native";

import { Typography } from "@/components/ui/Typography";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudio } from "@/hooks/useAudio";
import type { Phonetic } from "@/types";

export interface AudioSelectorProps {
  phonetics: Phonetic[];
  word: string;
}

function accentLabel(p: Phonetic, index: number): string {
  const url = p.audio ?? "";
  if (url.includes("-us.")) return "US";
  if (url.includes("-uk.") || url.includes("-gb.")) return "UK";
  if (url.includes("-au.")) return "AU";
  return p.text ?? `Audio ${index + 1}`;
}

/** Lets users pick between multiple available pronunciation audios. */
export function AudioSelector({ phonetics, word }: AudioSelectorProps) {
  const { colors } = useTheme();
  const { can } = usePermissions();
  const { error } = useNotifications();
  const { play } = useAudio();

  if (phonetics.length < 2 || !can("dictionary.audio.play")) return null;

  const handlePlay = async (p: Phonetic) => {
    const url = p.audio?.startsWith("//") ? `https:${p.audio}` : p.audio;
    if (!url) return;
    try {
      await play(url, word);
    } catch {
      error("Playback failed", "Could not play this pronunciation.");
    }
  };

  return (
    <View className="gap-2">
      <Typography variant="caption" className="uppercase tracking-wide">
        Pronunciations
      </Typography>
      <View className="flex-row flex-wrap gap-2">
        {phonetics.map((p, i) => (
          <Pressable
            key={`${p.audio}-${i}`}
            onPress={() => handlePlay(p)}
            accessibilityRole="button"
            accessibilityLabel={`Play ${accentLabel(p, i)} pronunciation`}
            className="flex-row items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 active:opacity-70 dark:border-gray-700"
          >
            <IconVolume size={14} color={colors.icon} />
            <Typography variant="caption" className="text-gray-900 dark:text-white">
              {accentLabel(p, i)}
            </Typography>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
