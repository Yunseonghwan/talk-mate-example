import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const TOKEN_KEY = "user_tokens";

type TokenState = {
  count: number;
  /** 토큰 가져오기 - SecureStore에서 로드 */
  fetchTokens: () => Promise<void>;
  /** 토큰 저장하기 - SecureStore에 저장 */
  saveTokens: (count: number) => Promise<void>;
  /** 토큰 사용하기 - count만큼 차감 후 저장 */
  consumeTokens: (amount: number) => boolean;
};

export const useTokenStore = create<TokenState>((set, get) => ({
  count: 0,

  fetchTokens: async (): Promise<void> => {
    try {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        set({ count: Number.isNaN(parsed) ? 0 : parsed });
      } else {
        set({ count: 0 });
      }
    } catch {
      set({ count: 0 });
    }
  },

  saveTokens: async (count: number): Promise<void> => {
    const value = Math.max(0, count);
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, String(value));
      set({ count: value });
    } catch {
      // ignore
    }
  },

  consumeTokens: (amount: number): boolean => {
    const { count } = get();
    if (amount <= 0 || count < amount) return false;
    const newCount = count - amount;
    void useTokenStore.getState().saveTokens(newCount);
    return true;
  },
}));
