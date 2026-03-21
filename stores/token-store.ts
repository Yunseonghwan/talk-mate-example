import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const TOKEN_STORAGE_KEY = "talk_mate_tokens";
const DEFAULT_TOKENS = 0;

/** 구독 활성화 시 기본 유효 기간 (10분) */
export const DEFAULT_SUBSCRIPTION_DURATION_MS = 10 * 60 * 1000;

type PersistedTokenState = {
  tokens: number;
  hasAnnualSubscription: boolean;
  subscriptionExpiresAt: number | null;
};

type TokenState = PersistedTokenState & {
  saveTokens: (amount: number) => void;
  useTokens: (amount: number) => boolean;
  /**
   * 구독 활성화. `expiresAtMs` 생략 시 지금부터 {@link DEFAULT_SUBSCRIPTION_DURATION_MS}(10분) 후 만료
   */
  activateAnnualSubscription: (expiresAtMs?: number) => void;
  /**
   * 구독 만료 시각이 지났으면 `hasAnnualSubscription`을 false, `subscriptionExpiresAt`을 null로 갱신
   */
  refreshSubscriptionStatus: () => void;
};

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

/** UI 등에서 구독 중 여부 판별용 (만료 시각 기준) */
export function isAnnualSubscriptionActive(
  hasAnnualSubscription: boolean,
  subscriptionExpiresAt: number | null,
): boolean {
  if (!hasAnnualSubscription || subscriptionExpiresAt === null) {
    return false;
  }
  return Date.now() <= subscriptionExpiresAt;
}

/**
 * 만료 시각이 지났는지 여부 (스토어 갱신 없이 판별만)
 */
export function isSubscriptionExpired(
  subscriptionExpiresAt: number | null,
): boolean {
  if (subscriptionExpiresAt === null) return false;
  return Date.now() > subscriptionExpiresAt;
}

/**
 * 구독 만료 시 상태를 false로 맞추는 순수 값 (persist/리듀서용)
 */
export function getClearedSubscriptionIfExpired(
  hasAnnualSubscription: boolean,
  subscriptionExpiresAt: number | null,
): Pick<
  PersistedTokenState,
  "hasAnnualSubscription" | "subscriptionExpiresAt"
> {
  if (
    hasAnnualSubscription &&
    subscriptionExpiresAt !== null &&
    Date.now() > subscriptionExpiresAt
  ) {
    return { hasAnnualSubscription: false, subscriptionExpiresAt: null };
  }
  return { hasAnnualSubscription, subscriptionExpiresAt };
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      tokens: DEFAULT_TOKENS,
      hasAnnualSubscription: false,
      subscriptionExpiresAt: null,

      refreshSubscriptionStatus: (): void => {
        const { hasAnnualSubscription, subscriptionExpiresAt } = get();
        const next = getClearedSubscriptionIfExpired(
          hasAnnualSubscription,
          subscriptionExpiresAt,
        );
        if (
          next.hasAnnualSubscription !== hasAnnualSubscription ||
          next.subscriptionExpiresAt !== subscriptionExpiresAt
        ) {
          set(next);
        }
      },

      activateAnnualSubscription: (expiresAtMs?: number): void => {
        const end =
          expiresAtMs ?? Date.now() + DEFAULT_SUBSCRIPTION_DURATION_MS;
        set({
          hasAnnualSubscription: true,
          subscriptionExpiresAt: end,
        });
      },

      saveTokens: (amount: number): void => {
        set((state) => ({ tokens: state.tokens + amount }));
      },

      useTokens: (amount: number): boolean => {
        get().refreshSubscriptionStatus();
        const state = get();
        if (
          isAnnualSubscriptionActive(
            state.hasAnnualSubscription,
            state.subscriptionExpiresAt,
          )
        ) {
          return true;
        }
        const { tokens } = state;
        if (tokens < amount) return false;
        set({ tokens: tokens - amount });
        return true;
      },
    }),
    {
      name: TOKEN_STORAGE_KEY,
      storage: createJSONStorage<PersistedTokenState>(() => secureStorage),
      partialize: (state) => ({
        tokens: state.tokens,
        hasAnnualSubscription: state.hasAnnualSubscription,
        subscriptionExpiresAt: state.subscriptionExpiresAt,
      }),
    },
  ),
);
