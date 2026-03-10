import {
  AudioModule,
  type RecordingOptions,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { AudioQuality, IOSOutputFormat } from "expo-audio/src/RecordingConstants";
import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceRecorderStatus = "idle" | "recording" | "saving";

export type UseVoiceRecorderReturn = {
  status: VoiceRecorderStatus;
  isRecording: boolean;
  durationMs: number;
  metering: number;
  startRecording: () => Promise<void>;
  stopAndSave: () => Promise<string | null>;
};

const RECORDING_OPTIONS: RecordingOptions = {
  isMeteringEnabled: true,
  extension: ".m4a",
  sampleRate: 44100,
  numberOfChannels: 2,
  bitRate: 128000,
  android: {
    outputFormat: "mpeg4",
    audioEncoder: "aac",
  },
  ios: {
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.MAX,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

const METERING_INTERVAL_MS = 80;

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [status, setStatus] = useState<VoiceRecorderStatus>("idle");
  const permissionReady = useRef(false);

  const audioRecorder = useAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(
    audioRecorder,
    METERING_INTERVAL_MS,
  );

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
    metering: recorderState.metering ?? -160,
    startRecording,
    stopAndSave,
  };
}
