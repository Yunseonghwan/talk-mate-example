import {
  authenticateAsync,
  AuthenticationType,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
} from "expo-local-authentication";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import {
  AUTH_TYPE_TO_METHOD,
  type BiometricAuthMethod,
  type BiometricAuthResult,
  type UseBiometricAuthReturn,
} from "@/types/biometric";

/** iOS는 IRIS 미지원, Android만 IRIS 지원 */
const PLATFORM_ALLOWED_METHODS: Record<string, BiometricAuthMethod[]> = {
  ios: ["faceId", "touchId"],
  android: ["faceId", "touchId", "iris"],
  default: ["faceId", "touchId"],
};

/** 에러 코드를 사용자 친화적 메시지로 변환 */
function getErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    not_enrolled: "생체 정보가 등록되지 않았습니다. 설정에서 등록해주세요.",
    user_cancel: "인증이 취소되었습니다.",
    app_cancel: "인증이 취소되었습니다.",
    not_available: "생체 인증을 사용할 수 없습니다.",
    lockout:
      "너무 많은 시도로 인해 일시적으로 잠겼습니다. 기기 비밀번호를 사용해주세요.",
    timeout: "인증 시간이 초과되었습니다.",
    unable_to_process: "인증을 처리할 수 없습니다.",
    system_cancel: "인증이 취소되었습니다.",
    user_fallback: "인증이 취소되었습니다.",
    invalid_context: "인증 컨텍스트가 유효하지 않습니다.",
    passcode_not_set: "기기 비밀번호가 설정되지 않았습니다.",
    authentication_failed: "인증에 실패했습니다.",
  };
  return messages[error] ?? "알 수 없는 오류가 발생했습니다.";
}

export function useBiometricAuth(): UseBiometricAuthReturn {
  const [hasHardware, setHasHardware] = useState<boolean>(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [supportedTypes, setSupportedTypes] = useState<AuthenticationType[]>(
    [],
  );
  const [availableMethods, setAvailableMethods] = useState<
    BiometricAuthMethod[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const [hardware, enrolled, types] = await Promise.all([
        hasHardwareAsync(),
        isEnrolledAsync(),
        supportedAuthenticationTypesAsync(),
      ]);

      setHasHardware(hardware);
      setIsEnrolled(enrolled);
      setSupportedTypes(types);

      if (!hardware || !enrolled) {
        setAvailableMethods([]);
        return;
      }

      const platformKey = Platform.OS === "ios" ? "ios" : "android";
      const allowedMethods =
        PLATFORM_ALLOWED_METHODS[platformKey] ??
        PLATFORM_ALLOWED_METHODS.default;

      const methods = types
        .map((t) => AUTH_TYPE_TO_METHOD[t])
        .filter(
          (method): method is BiometricAuthMethod =>
            method !== undefined && allowedMethods.includes(method),
        );

      setAvailableMethods(methods);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "생체 인증 상태를 확인할 수 없습니다.";
      setError(message);
      setAvailableMethods([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAvailability();
  }, [checkAvailability]);

  const isMethodAvailable = useCallback(
    (method: BiometricAuthMethod): boolean => {
      const platformKey = Platform.OS === "ios" ? "ios" : "android";
      const allowed =
        PLATFORM_ALLOWED_METHODS[platformKey] ??
        PLATFORM_ALLOWED_METHODS.default;
      if (!allowed.includes(method)) return false;
      return availableMethods.includes(method);
    },
    [availableMethods],
  );

  const authenticate = useCallback(
    async (options?: {
      promptMessage?: string;
    }): Promise<BiometricAuthResult> => {
      setError(null);
      setIsLoading(true);

      try {
        const result = await authenticateAsync({
          promptMessage: options?.promptMessage ?? "생체 인증을 진행해주세요",
        });

        if (result.success) {
          return { success: true };
        }

        const errorMessage = getErrorMessage(result.error);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "인증 중 오류가 발생했습니다.";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    hasHardware,
    isEnrolled,
    supportedTypes,
    availableMethods,
    isMethodAvailable,
    authenticate,
    checkAvailability,
    isLoading,
    error,
    clearError,
  };
}
