import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const STORAGE_KEY = "recording_list";

export type RecordingItem = {
  id: string;
  uri: string;
  filename: string;
  durationMs: number;
  createdAt: number;
};

type RecordingState = {
  recordings: RecordingItem[];
  isLoaded: boolean;
  loadRecordings: () => Promise<void>;
  addRecording: (uri: string, durationMs: number) => Promise<void>;
  removeRecording: (id: string) => Promise<void>;
};

export const useRecordingStore = create<RecordingState>((set, get) => ({
  recordings: [],
  isLoaded: false,

  loadRecordings: async () => {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecordingItem[];
        set({ recordings: parsed, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  addRecording: async (uri, durationMs) => {
    const now = Date.now();
    const item: RecordingItem = {
      id: `rec_${now}`,
      uri,
      filename: `녹음 ${new Date(now).toLocaleString("ko-KR")}`,
      durationMs,
      createdAt: now,
    };
    const updated = [item, ...get().recordings];
    set({ recordings: updated });
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));
  },

  removeRecording: async (id) => {
    const updated = get().recordings.filter((r) => r.id !== id);
    set({ recordings: updated });
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));
  },
}));
