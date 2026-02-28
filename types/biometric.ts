import type { AuthenticationType } from 'expo-local-authentication';

/** 앱에서 사용하는 생체 인증 방법 식별자 */
export type BiometricAuthMethod = 'faceId' | 'touchId' | 'iris';

/** expo AuthenticationType을 BiometricAuthMethod로 매핑 */
export const AUTH_TYPE_TO_METHOD: Record<number, BiometricAuthMethod> = {
  1: 'touchId',
  2: 'faceId',
  3: 'iris',
} as const;

/** 생체 인증 availability 체크 결과 */
export type BiometricAvailabilityResult = {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: AuthenticationType[];
  availableMethods: BiometricAuthMethod[];
};

/** 생체 인증 실행 결과 */
export type BiometricAuthResult =
  | { success: true }
  | { success: false; error: string };

/** 훅 반환 타입 */
export type UseBiometricAuthReturn = {
  /** 생체 인증 하드웨어 존재 여부 */
  hasHardware: boolean;
  /** 생체 정보 등록 여부 */
  isEnrolled: boolean;
  /** 지원되는 인증 타입 (expo AuthenticationType) */
  supportedTypes: AuthenticationType[];
  /** 사용 가능한 인증 방법 (앱 레벨) */
  availableMethods: BiometricAuthMethod[];
  /** 특정 방법이 사용 가능한지 */
  isMethodAvailable: (method: BiometricAuthMethod) => boolean;
  /** 생체 인증 실행 */
  authenticate: (options?: { promptMessage?: string }) => Promise<BiometricAuthResult>;
  /** availability 재확인 */
  checkAvailability: () => Promise<void>;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 메시지 (없으면 null) */
  error: string | null;
  /** 에러 초기화 */
  clearError: () => void;
};
