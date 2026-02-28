import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing } from "@/constants/theme";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import type { BiometricAuthMethod } from "@/types/biometric";

const AUTH_OPTIONS: {
  id: BiometricAuthMethod;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  {
    id: "faceId",
    title: "Face ID",
    description: "얼굴 인식으로 빠르고 안전하게 로그인",
    icon: "face",
  },
  {
    id: "touchId",
    title: "Touch ID",
    description: "지문으로 간편하게 인증",
    icon: "fingerprint",
  },
  {
    id: "iris",
    title: "IRIS 인증",
    description: "홍채 인식으로 높은 보안 수준 제공",
    icon: "visibility",
  },
];

const AuthScreen = () => {
  const colors = Colors.light;
  const {
    hasHardware,
    isEnrolled,
    availableMethods,
    isMethodAvailable,
    authenticate,
    isLoading,
    error,
    clearError,
  } = useBiometricAuth();

  const showEnrollAlert = useCallback((): void => {
    Alert.alert(
      "생체 인증 등록 필요",
      "생체 인증을 사용하려면 핸드폰 설정에서 생체 인증(지문, 얼굴, 홍채)을 등록해주세요.",
      [{ text: "확인" }],
    );
  }, []);

  useEffect(() => {
    if (!isLoading && hasHardware && !isEnrolled) {
      showEnrollAlert();
    }
  }, [isLoading, hasHardware, isEnrolled, showEnrollAlert]);

  const handleAuthMethodPress = async (
    method: BiometricAuthMethod,
  ): Promise<void> => {
    if (!isMethodAvailable(method)) return;

    if (!isEnrolled) {
      showEnrollAlert();
      return;
    }

    console.log(method);

    clearError();
    const result = await authenticate({
      promptMessage: `${AUTH_OPTIONS.find((o) => o.id === method)?.title ?? method}로 인증해주세요`,
    });

    if (result.success) {
      // 인증 성공 시 처리 (예: 화면 이동 등)
    } else if (result.error?.includes("등록")) {
      showEnrollAlert();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>보안인증</Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          안전한 로그인을 위해 인증 방법을 선택하세요
        </Text>

        {error !== null && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={clearError} style={styles.errorDismiss}>
              <Text style={styles.errorDismissText}>확인</Text>
            </Pressable>
          </View>
        )}

        {isLoading && availableMethods.length === 0 && error === null ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              생체 인증 확인 중...
            </Text>
          </View>
        ) : !isLoading && !hasHardware ? (
          <View style={styles.unavailableContainer}>
            <Text
              style={[styles.unavailableText, { color: colors.textSecondary }]}
            >
              이 기기에서는 생체 인증을 지원하지 않습니다.
            </Text>
          </View>
        ) : !isLoading && !isEnrolled ? (
          <View style={styles.unavailableContainer}>
            <Text
              style={[styles.unavailableText, { color: colors.textSecondary }]}
            >
              생체 정보가 등록되지 않았습니다. 기기 설정에서 등록해주세요.
            </Text>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            {AUTH_OPTIONS.map((option) => {
              const available = isMethodAvailable(option.id);
              return (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.authButton,
                    {
                      backgroundColor: "#fff",
                      borderColor: "#E5E7EB",
                      opacity: available ? 1 : 0.5,
                    },
                    pressed && available && styles.authButtonPressed,
                  ]}
                  onPress={() => void handleAuthMethodPress(option.id)}
                  disabled={!available}
                >
                  <View style={styles.iconWrapper}>
                    <MaterialIcons
                      name={option.icon}
                      size={32}
                      color={colors.tint}
                    />
                  </View>
                  <View style={styles.textWrapper}>
                    <Text style={[styles.buttonTitle, { color: colors.text }]}>
                      {option.title}
                    </Text>
                    <Text
                      style={[
                        styles.buttonDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.textTertiary}
                  />
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FEF2F2",
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#DC2626",
  },
  errorDismiss: {
    paddingHorizontal: Spacing.sm,
  },
  errorDismissText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
  },
  unavailableContainer: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  unavailableText: {
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  authButtonPressed: {
    opacity: 0.7,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  textWrapper: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  buttonDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
});
