import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Layout, Spacing } from "@/constants/theme";
import { useTokenStore } from "@/stores/token-store";

const PRIMARY_COLOR = "#007AFF";
const SECONDARY_BLUE = "#4A90E2";
const MIC_INNER_SIZE = 100;
const MIC_OUTER_SIZE = 120;

const LandingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const count = useTokenStore((s) => s.count);
  const fetchTokens = useTokenStore((s) => s.fetchTokens);
  const consumeTokens = useTokenStore((s) => s.consumeTokens);

  useEffect(() => {
    void fetchTokens().finally(() => setIsLoading(false));
  }, [fetchTokens]);

  const handleReadPress = (): void => {
    if (consumeTokens(5)) {
      // 읽어주기 로직
    }
  };

  const handleChatPress = (): void => {
    if (consumeTokens(10)) {
      // 대화시작하기 로직
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.profileArea}
            onPress={() => {
              // AI 프로필 화면 이동
            }}
          >
            <View style={styles.profileIconWrapper}>
              <MaterialIcons name="smart-toy" size={28} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.profileText}>AI 선생님</Text>
          </Pressable>

          <Pressable style={styles.iconButton}>
            <MaterialIcons
              name="more-vert"
              size={28}
              color={Colors.light.text}
            />
          </Pressable>
        </View>

        <View style={styles.tokenRow}>
          <MaterialIcons
            name="monetization-on"
            size={24}
            color={PRIMARY_COLOR}
          />
          <Text style={styles.tokenCount}>
            {isLoading ? "..." : count.toLocaleString()}
          </Text>
        </View>

        <View style={styles.centerSection}>
          <View style={styles.micWrapper}>
            <View style={styles.micOuterCircle}>
              <View style={styles.micInnerCircle}>
                <MaterialIcons name="mic" size={48} color="#fff" />
              </View>
            </View>
          </View>

          <Text style={styles.mainTitle}>대화시작하기</Text>
          <Text style={styles.subTitle}>
            아래 버튼을 눌러서 ai와 대화를 시작해 보세요
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.outlineButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleReadPress}
        >
          <Text style={styles.outlineButtonText}>읽어주기(5토큰)</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleChatPress}
        >
          <Text style={styles.primaryButtonText}>대화시작하기(10토큰)</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.horizontalPadding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  profileArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  profileIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tokenCount: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  micWrapper: {
    marginBottom: Spacing.lg,
  },
  micOuterCircle: {
    width: MIC_OUTER_SIZE,
    height: MIC_OUTER_SIZE,
    borderRadius: MIC_OUTER_SIZE / 2,
    backgroundColor: SECONDARY_BLUE,
    justifyContent: "center",
    alignItems: "center",
  },
  micInnerCircle: {
    width: MIC_INNER_SIZE,
    height: MIC_INNER_SIZE,
    borderRadius: MIC_INNER_SIZE / 2,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  buttonContainer: {
    paddingHorizontal: Layout.horizontalPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
    backgroundColor: "#fff",
  },
  outlineButton: {
    width: "100%",
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
