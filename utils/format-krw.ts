/**
 * 원화 금액을 한국어 로케일로 표기합니다. (예: 1,000원)
 */
export function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}
