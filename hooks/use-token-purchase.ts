import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

import { useTokenStore } from "@/stores/token-store";
import type { PurchaseSelection } from "@/types/purchase";

export type { PurchaseSelection };

type UseTokenPurchaseReturn = {
  selection: PurchaseSelection | null;
  selectAnnual: () => void;
  selectTokenPackage: (amount: number) => void;
  confirmPurchase: () => Promise<void>;
  canConfirm: boolean;
  isPurchasing: boolean;
};

/**
 * 결제 전 생체인증(또는 기기 비밀번호). 웹은 생체 미지원이므로 확인 대화상자로 대체.
 */
async function authenticateForPayment(): Promise<boolean> {
  if (Platform.OS === "web") {
    return new Promise((resolve) => {
      Alert.alert(
        "결제 확인",
        "웹에서는 생체 인증을 사용할 수 없습니다. 결제를 진행할까요?",
        [
          { text: "취소", style: "cancel", onPress: () => resolve(false) },
          { text: "진행", onPress: () => resolve(true) },
        ],
      );
    });
  }

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    Alert.alert(
      "생체인증 불가",
      "이 기기는 생체 인증 또는 보안 인증을 지원하지 않습니다.",
    );
    return false;
  }

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) {
    Alert.alert(
      "생체인증 미등록",
      "설정에서 Face ID·지문 등 생체 인증을 등록한 뒤 다시 시도해 주세요.",
    );
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "결제를 진행하려면 인증이 필요합니다",
    cancelLabel: "취소",
    fallbackLabel: "비밀번호 사용",
  });

  return result.success;
}

export function useTokenPurchase(): UseTokenPurchaseReturn {
  const [selection, setSelection] = useState<PurchaseSelection | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const purchaseInFlightRef = useRef(false);
  const saveTokens = useTokenStore((s) => s.saveTokens);
  const activateAnnualSubscription = useTokenStore(
    (s) => s.activateAnnualSubscription,
  );

  const selectAnnual = useCallback((): void => {
    setSelection("annual");
  }, []);

  const selectTokenPackage = useCallback((amount: number): void => {
    setSelection(amount);
  }, []);

  const confirmPurchase = useCallback(async (): Promise<void> => {
    if (selection === null || purchaseInFlightRef.current) return;

    purchaseInFlightRef.current = true;
    setIsPurchasing(true);
    try {
      const authenticated = await authenticateForPayment();
      if (!authenticated) return;

      saveTokens(selection as number);

      router.back();
    } finally {
      purchaseInFlightRef.current = false;
      setIsPurchasing(false);
    }
  }, [selection, saveTokens, activateAnnualSubscription]);

  return {
    selection,
    selectAnnual,
    selectTokenPackage,
    confirmPurchase,
    canConfirm: selection !== null,
    isPurchasing,
  };
}
