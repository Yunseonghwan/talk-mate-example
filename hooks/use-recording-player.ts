import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useCallback, useRef, useState } from "react";

export type UseRecordingPlayerReturn = {
  currentId: string | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  play: (id: string, uri: string) => void;
  stop: () => void;
};

export function useRecordingPlayer(): UseRecordingPlayerReturn {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const currentUriRef = useRef<string | null>(null);

  const player = useAudioPlayer(currentUriRef.current);
  const status = useAudioPlayerStatus(player);

  const play = useCallback(
    (id: string, uri: string): void => {
      if (currentId === id) {
        if (status.playing) {
          player.pause();
        } else {
          player.play();
        }
        return;
      }

      if (status.playing) {
        player.pause();
      }

      currentUriRef.current = uri;
      player.replace(uri);
      setCurrentId(id);

      setTimeout(() => {
        player.play();
      }, 100);
    },
    [currentId, player, status.playing],
  );

  const stop = useCallback((): void => {
    if (currentId) {
      player.pause();
      player.seekTo(0);
      setCurrentId(null);
      currentUriRef.current = null;
    }
  }, [currentId, player]);

  return {
    currentId,
    isPlaying: status.playing,
    positionMs: (status.currentTime ?? 0) * 1000,
    durationMs: (status.duration ?? 0) * 1000,
    play,
    stop,
  };
}
