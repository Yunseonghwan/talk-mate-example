import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const SESSION_KEY = "auth_session";
const SESSION_DURATION_MS = 10 * 60 * 1000; // 10분

type SessionData = {
  expiresAt: number;
};

type SessionState = {
  expiresAt: number | null;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isSessionValid: () => boolean;
  clearSession: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  expiresAt: null,
  isInitialized: false,

  initialize: async (): Promise<void> => {
    if (get().isInitialized) return;

    try {
      const stored = await SecureStore.getItemAsync(SESSION_KEY);
      if (stored) {
        const data = JSON.parse(stored) as SessionData;
        const expiresAt = data.expiresAt;
        if (typeof expiresAt === "number" && Date.now() < expiresAt) {
          set({ expiresAt, isInitialized: true });
        } else {
          await SecureStore.deleteItemAsync(SESSION_KEY);
          set({ expiresAt: null, isInitialized: true });
        }
      } else {
        set({ expiresAt: null, isInitialized: true });
      }
    } catch {
      set({ expiresAt: null, isInitialized: true });
    }
  },

  refreshSession: async (): Promise<void> => {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    const data: SessionData = { expiresAt };
    try {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(data));
      set({ expiresAt });
    } catch {
      set({ expiresAt: null });
    }
  },

  isSessionValid: (): boolean => {
    const { expiresAt } = get();
    if (expiresAt === null) return false;
    return Date.now() < expiresAt;
  },

  clearSession: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } catch {
      // ignore
    }
    set({ expiresAt: null });
  },
}));
