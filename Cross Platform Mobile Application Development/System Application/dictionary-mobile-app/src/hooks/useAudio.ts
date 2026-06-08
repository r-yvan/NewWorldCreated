import { Audio, AVPlaybackStatus } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";

import { trackEvent } from "@/services/analytics.service";

export type AudioState = "idle" | "loading" | "playing" | "paused";

/**
 * Manages a single Expo AV sound instance with play / pause / stop and full
 * cleanup. Guarantees only one audio instance plays at a time and releases
 * native resources on unmount.
 */
export function useAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentUrl = useRef<string | null>(null);
  const [state, setState] = useState<AudioState>("idle");

  const unload = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch {
        // ignore — sound may already be stopped/unloaded
      }
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // ignore
      }
      soundRef.current = null;
      currentUrl.current = null;
    }
  }, []);

  const onStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      setState("idle");
      return;
    }
    setState(status.isPlaying ? "playing" : "paused");
  }, []);

  const play = useCallback(
    async (url: string, word?: string) => {
      try {
        setState("loading");
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

        // Reuse the loaded sound if the same URL is requested again.
        if (soundRef.current && currentUrl.current === url) {
          await soundRef.current.replayAsync();
          setState("playing");
        } else {
          // Avoid overlapping playback by unloading any previous instance first.
          await unload();
          const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: true },
            onStatus,
          );
          soundRef.current = sound;
          currentUrl.current = url;
          setState("playing");
        }
        void trackEvent({ type: "audio", word });
      } catch {
        setState("idle");
        await unload();
        throw new Error("Unable to play pronunciation audio.");
      }
    },
    [onStatus, unload],
  );

  const pause = useCallback(async () => {
    if (soundRef.current && state === "playing") {
      await soundRef.current.pauseAsync();
      setState("paused");
    }
  }, [state]);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch {
        // ignore
      }
      setState("idle");
    }
  }, []);

  // Clean up native resources on unmount.
  useEffect(() => {
    return () => {
      void unload();
    };
  }, [unload]);

  return { state, play, pause, stop, isPlaying: state === "playing", isLoading: state === "loading" };
}
