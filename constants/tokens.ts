/** 읽어주기 진입 시 소모 토큰 */
export const TOKEN_COST_READ_ALOUD = 5;

/** 대화 시작 진입 시 소모 토큰 */
export const TOKEN_COST_CONVERSATION = 10;

/** 토큰 1개당 충전 가격 (원) */
export const TOKEN_PRICE_WON_PER_TOKEN = 10;

/** 연간 구독 결제 금액 (원) — 상품 정책에 맞게 조정 */
export const ANNUAL_SUBSCRIPTION_PRICE_WON = 36_500;

/** 토큰 충전 패키지 (개수) */
export const TOKEN_PACKAGE_AMOUNTS = [5, 10, 20, 50, 100, 500] as const;

/** 연간 구독 유효 기간 (1년, ms) */
export const ANNUAL_SUBSCRIPTION_DURATION_MS =
  365 * 24 * 60 * 60 * 1000;
