/**
 * RevenueCat **Test store** 전용 상품 ID (대시보드 Test store → Products / Offerings 와 동일)
 * @see https://www.revenuecat.com/docs/test-and-launch/sandbox
 */
const BUNDLE_PRODUCT_PREFIX = "com.seonghwanyun.talkmateexample";

/**
 * RevenueCat 프로젝트 ID (대시보드 URL·REST API용). SDK 결제는 API 키만 사용합니다.
 * `EXPO_PUBLIC_REVENUECAT_PROJECT_ID` 로 덮어쓸 수 있음.
 */
export const REVENUECAT_PROJECT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_PROJECT_ID ?? "projb43c198a";

/** 결제 시 사용할 Offering 식별자 (`getOfferings().all` 키) */
export const REVENUECAT_OFFERING_ID = "token";

/** 연간 구독 — RevenueCat에서 구독 상품으로 등록 */
export const REVENUECAT_PRODUCT_ANNUAL = `${BUNDLE_PRODUCT_PREFIX}.sub.annual`;

/** 5토큰 — Product Identifier (대시보드 Products에 `5token` 과 동일해야 함) */
export const REVENUECAT_PRODUCT_TOKEN_5_ID = "5token";

/** 소모성 토큰 패키지 — Test store Product Identifier 와 동일 */
export const REVENUECAT_PRODUCT_TOKENS = {
  5: REVENUECAT_PRODUCT_TOKEN_5_ID,
  10: `${BUNDLE_PRODUCT_PREFIX}.tokens.10`,
  20: `${BUNDLE_PRODUCT_PREFIX}.tokens.20`,
  50: `${BUNDLE_PRODUCT_PREFIX}.tokens.50`,
  100: `${BUNDLE_PRODUCT_PREFIX}.tokens.100`,
  500: `${BUNDLE_PRODUCT_PREFIX}.tokens.500`,
} as const;

/**
 * RevenueCat Test store Entitlements 식별자 (연간 구독 상품과 연결)
 */
export const REVENUECAT_ENTITLEMENT_ANNUAL = "pro";
