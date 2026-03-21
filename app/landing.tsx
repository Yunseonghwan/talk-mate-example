import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MenuModal from "@/components/menu-modal";

import MicSection from "@/components/mic-section";
import {
  TOKEN_COST_CONVERSATION,
  TOKEN_COST_READ_ALOUD,
} from "@/constants/tokens";
import { useSession } from "@/hooks/use-session";
import {
  isAnnualSubscriptionActive,
  useTokenStore,
} from "@/stores/token-store";

const LandingScreen = () => {
  const { isInitialized, hasValidSession } = useSession();
  const tokens = useTokenStore((state) => state.tokens);
  const hasAnnualSubscription = useTokenStore(
    (state) => state.hasAnnualSubscription,
  );
  const subscriptionExpiresAt = useTokenStore(
    (state) => state.subscriptionExpiresAt,
  );
  const refreshSubscriptionStatus = useTokenStore(
    (state) => state.refreshSubscriptionStatus,
  );
  const [menuVisible, setMenuVisible] = useState(false);

  const isSubscriptionActive = isAnnualSubscriptionActive(
    hasAnnualSubscription,
    subscriptionExpiresAt,
  );

  useEffect(() => {
    refreshSubscriptionStatus();
  }, [refreshSubscriptionStatus]);

  useEffect(() => {
    if (isInitialized && !hasValidSession) {
      router.replace("/");
    }
  }, [isInitialized, hasValidSession]);

  const handleStartConversation = useCallback((): void => {
    refreshSubscriptionStatus();
    const state = useTokenStore.getState();
    if (
      isAnnualSubscriptionActive(
        state.hasAnnualSubscription,
        state.subscriptionExpiresAt,
      )
    ) {
      router.push("/conversation");
      return;
    }
    if (!state.useTokens(TOKEN_COST_CONVERSATION)) {
      router.push("/token-purchase");
      return;
    }
    router.push("/conversation");
  }, [refreshSubscriptionStatus]);

  const handleReadAloud = useCallback((): void => {
    refreshSubscriptionStatus();
    const state = useTokenStore.getState();
    if (
      isAnnualSubscriptionActive(
        state.hasAnnualSubscription,
        state.subscriptionExpiresAt,
      )
    ) {
      router.push("/read-aloud");
      return;
    }
    if (!state.useTokens(TOKEN_COST_READ_ALOUD)) {
      router.push("/token-purchase");
      return;
    }
    router.push("/read-aloud");
  }, [refreshSubscriptionStatus]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileIcon}>
            <MaterialIcons name="smart-toy" size={24} color="#fff" />
          </View>
          <Text style={styles.profileName}>AI 선생님</Text>
        </View>
        <Pressable
          style={styles.meatballButton}
          onPress={() => setMenuVisible(true)}
        >
          <MaterialIcons name="more-horiz" size={24} color="#333" />
        </Pressable>
      </View>

      <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* Token Display — 연간 구독 중에는 숨김 */}
      {!isSubscriptionActive && (
        <View style={styles.tokenSection}>
          <MaterialIcons name="toll" size={20} color="#007AFF" />
          <Text style={styles.tokenCount}>{tokens}</Text>
        </View>
      )}

      {/* Center Content */}
      <View style={styles.centerContent}>
        <MicSection />
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.outlineButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleReadAloud}
        >
          <Text style={styles.outlineButtonText}>
            {isSubscriptionActive ? "읽어주기" : "읽어주기 5토큰"}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleStartConversation}
        >
          <Text style={styles.primaryButtonText}>
            {isSubscriptionActive ? "대화시작하기" : "대화시작하기 10토큰"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#11181C",
  },
  meatballButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tokenSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  tokenCount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomButtons: {
    gap: 10,
    paddingBottom: 16,
  },
  outlineButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

export default LandingScreen;
