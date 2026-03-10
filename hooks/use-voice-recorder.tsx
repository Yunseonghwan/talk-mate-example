import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceRecorderStatus = "idle" | "recording" | "saving";

export type UseVoiceRecorderReturn = {
  status: VoiceRecorderStatus;
  isRecording: boolean;
  durationMs: number;
  startRecording: () => Promise<void>;
  stopAndSave: () => Promise<string | null>;
};

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [status, setStatus] = useState<VoiceRecorderStatus>("idle");
  const permissionReady = useRef(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 500);

  useEffect(() => {
    const setup = async (): Promise<void> => {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) return;

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      permissionReady.current = true;
    };

    void setup();
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    if (!permissionReady.current) return;
    if (status === "recording") return;

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setStatus("recording");
  }, [audioRecorder, status]);

  const stopAndSave = useCallback(async (): Promise<string | null> => {
    if (status !== "recording") return null;

    setStatus("saving");
    await audioRecorder.stop();

    const uri = audioRecorder.uri;
    setStatus("idle");

    if (!uri) return null;

    console.log("[Voice Recorder] saved at:", uri);
    return uri;
  }, [audioRecorder, status]);

  return {
    status,
    isRecording: status === "recording",
    durationMs: recorderState.durationMillis ?? 0,
    startRecording,
    stopAndSave,
  };
}
