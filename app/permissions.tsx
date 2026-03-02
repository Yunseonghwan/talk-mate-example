import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Layout, Spacing } from "@/constants/theme";

const PermissionsScreen = () => {
  const router = useRouter();

  const handleOpenSettings = (): void => {
    void Linking.openSettings();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.title}>권한 설정</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>
          앱 권한을 설정하려면 기기 설정으로 이동하세요.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && styles.buttonPressed]}
          onPress={handleOpenSettings}
        >
          <MaterialIcons name="settings" size={24} color="#fff" />
          <Text style={styles.settingsButtonText}>앱 권한 설정 열기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default PermissionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.horizontalPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.horizontalPadding,
    paddingTop: Spacing.xl,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#007AFF",
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
