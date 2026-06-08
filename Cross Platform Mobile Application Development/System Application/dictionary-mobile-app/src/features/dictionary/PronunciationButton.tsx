import { IconPlayerPause, IconVolume } from "@tabler/icons-react-native";
import React from "react";
import { ActivityIndicator, Pressable } from "react-native";

import { Typography } from "@/components/ui/Typography";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudio } from "@/hooks/useAudio";

export interface PronunciationButtonProps {
  audioUrl: string | null;
  word: string;
}

/**
 * Speaker control. Only rendered when audio exists AND the role may play it.
 * Reflects loading / playing / paused states and prevents overlapping audio.
 */
export function PronunciationButton({ audioUrl, word }: PronunciationButtonProps) {
  const { colors } = useTheme();
  const { can } = usePermissions();
  const { error } = useNotifications();
  const { play, pause, isPlaying, isLoading } = useAudio();

  // Hide when there is no audio or the role lacks the permission.
  if (!audioUrl || !can("dictionary.audio.play")) return null;

  const handlePress = async () => {
    try {
      if (isPlaying) await pause();
      else await play(audioUrl, word);
    } catch {
      error("Playback failed", "Could not play the pronunciation audio.");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? `Pause pronunciation of ${word}` : `Play pronunciation of ${word}`}
      accessibilityState={{ busy: isLoading }}
      className="h-11 flex-row items-center gap-2 self-start rounded-full border border-gray-300 px-4 active:opacity-70 dark:border-gray-700"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.icon} />
      ) : isPlaying ? (
        <IconPlayerPause size={18} color={colors.icon} />
      ) : (
        <IconVolume size={18} color={colors.icon} />
      )}
      <Typography variant="label">{isPlaying ? "Pause" : "Listen"}</Typography>
    </Pressable>
  );
}
