import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Layout, Spacing } from "@/constants/theme";

const TokenPurchaseScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.title}>토큰 구매</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.emptyText}>토큰 구매 기능 준비 중입니다.</Text>
      </View>
    </SafeAreaView>
  );
};

export default TokenPurchaseScreen;

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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Layout.horizontalPadding,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
});
