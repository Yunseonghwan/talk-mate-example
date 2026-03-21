import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import Purchases, {
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesOffering,
  type PurchasesPackage,
} from "react-native-purchases";

import {
  REVENUECAT_ENTITLEMENT_ANNUAL,
  REVENUECAT_OFFERING_ID,
  REVENUECAT_PRODUCT_ANNUAL,
  REVENUECAT_PRODUCT_TOKENS,
} from "@/constants/revenuecat";
import type { PurchaseSelection } from "@/types/purchase";

/**
 * RevenueCat 대시보드 **Test store → Public API key** (플랫폼별 1개씩)
 */
function getTestStoreApiKey(): string {
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_IOS_API_KEY ?? "";
  }
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_ANDROID_API_KEY ?? "";
  }
  return "";
}

function isPurchasesError(error: unknown): error is PurchasesError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as PurchasesError).code === "string"
  );
}

function getProductIdForSelection(selection: PurchaseSelection): string {
  if (selection === "annual") {
    return REVENUECAT_PRODUCT_ANNUAL;
  }
  const id =
    REVENUECAT_PRODUCT_TOKENS[
      selection as keyof typeof REVENUECAT_PRODUCT_TOKENS
    ];
  if (!id) {
    throw new Error(`지원하지 않는 토큰 패키지입니다: ${selection}`);
  }
  return id;
}

/**
 * Offering 안의 모든 패키지 후보 (availablePackages + annual 등 슬롯).
 * 대시보드에서 `$rc_annual` 등 슬롯만 채운 경우 `annual` 로도 노출됩니다.
 */
function collectPackagesFromOffering(
  offering: PurchasesOffering,
): PurchasesPackage[] {
  const slots: (PurchasesPackage | null | undefined)[] = [
    offering.annual,
    offering.monthly,
    offering.weekly,
    offering.lifetime,
    offering.sixMonth,
    offering.threeMonth,
    offering.twoMonth,
    ...offering.availablePackages,
  ];
  const seen = new Set<string>();
  const out: PurchasesPackage[] = [];
  for (const p of slots) {
    if (!p) continue;
    const key = `${p.identifier}::${p.product.identifier}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

function findPackageForProduct(
  offering: PurchasesOffering,
  productId: string,
): PurchasesPackage | undefined {
  const all = collectPackagesFromOffering(offering);
  return all.find((p: PurchasesPackage) => {
    if (p.product.identifier === productId) return true;
    if (p.identifier === productId) return true;
    return false;
  });
}

/**
 * Offering 패키지 또는 getProducts로 조회한 상품으로 결제 시도 (Test store)
 */
async function purchaseProductForSelection(
  selection: PurchaseSelection,
): Promise<CustomerInfo> {
  const productId = getProductIdForSelection(selection);
  const isSubscription = selection === "annual";

  const offerings = await Purchases.getOfferings();
  const offering = offerings.all[REVENUECAT_OFFERING_ID];
  if (!offering) {
    throw new Error(
      `Offering을 찾을 수 없습니다: ${REVENUECAT_OFFERING_ID}\nRevenueCat 대시보드의 Offering 식별자와 constants/revenuecat.ts 를 맞춰 주세요.`,
    );
  }
  const matchedPackage = findPackageForProduct(offering, productId);

  if (matchedPackage) {
    const { customerInfo } = await Purchases.purchasePackage(matchedPackage);
    return customerInfo;
  }

  const purchaseType = isSubscription
    ? Purchases.PURCHASE_TYPE.SUBS
    : Purchases.PURCHASE_TYPE.INAPP;

  const products = await Purchases.getProducts([productId], purchaseType);
  const product = products[0];
  if (!product) {
    throw new Error(
      `Test store에서 상품을 찾을 수 없습니다. (${productId})\nRevenueCat Test store Products·Offerings를 확인해 주세요.`,
    );
  }

  const { customerInfo } = await Purchases.purchaseStoreProduct(product);
  return customerInfo;
}

export type RevenueCatPurchaseResult =
  | { ok: true; customerInfo: CustomerInfo }
  | {
      ok: false;
      reason: "cancelled" | "unavailable" | "error";
      message?: string;
    };

/**
 * RevenueCat **Test store** 결제 (iOS / Android 네이티브). 웹은 미지원.
 */
export async function purchaseWithRevenueCat(
  selection: PurchaseSelection,
): Promise<RevenueCatPurchaseResult> {
  if (Platform.OS === "web") {
    Alert.alert(
      "앱에서만 가능",
      "Test store 결제는 iOS 또는 Android 앱에서만 이용할 수 있습니다.",
    );
    return { ok: false, reason: "unavailable" };
  }

  const apiKey = getTestStoreApiKey();
  if (apiKey.length === 0) {
    Alert.alert(
      "설정 필요",
      "RevenueCat Test store 공개 키를 .env에 설정해 주세요.\n(EXPO_PUBLIC_REVENUECAT_TEST_STORE_IOS_API_KEY / ANDROID_API_KEY)",
    );
    return { ok: false, reason: "error", message: "missing_api_key" };
  }

  try {
    const customerInfo = await purchaseProductForSelection(selection);
    return { ok: true, customerInfo };
  } catch (e: unknown) {
    if (isPurchasesError(e)) {
      if (e.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return { ok: false, reason: "cancelled" };
      }
      Alert.alert("결제 오류", e.message ?? "결제를 완료할 수 없습니다.");
      return { ok: false, reason: "error", message: e.message };
    }
    const message = e instanceof Error ? e.message : String(e);
    Alert.alert("결제 오류", message);
    return { ok: false, reason: "error", message };
  }
}

/**
 * 연간 구독 만료 시각을 CustomerInfo에서 반영 (entitlement 없으면 로컬 기본 기간 사용)
 */
export function getAnnualExpiresAtMs(
  customerInfo: CustomerInfo,
  fallbackMs: number,
): number {
  const entitlement =
    customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ANNUAL];
  if (
    entitlement?.expirationDateMillis !== null &&
    entitlement?.expirationDateMillis !== undefined
  ) {
    return entitlement.expirationDateMillis;
  }
  return fallbackMs;
}

export function useRevenueCatInitialization(): {
  isConfigured: boolean;
} {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      setIsConfigured(false);
      return;
    }

    const apiKey = getTestStoreApiKey();
    if (apiKey.length === 0) {
      setIsConfigured(false);
      return;
    }

    try {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      Purchases.configure({ apiKey });
      setIsConfigured(true);
    } catch {
      setIsConfigured(false);
    }
  }, []);

  return { isConfigured };
}
