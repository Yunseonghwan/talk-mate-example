import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { Colors, Layout, Spacing } from "@/constants/theme";

const ChatStartScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.light.text}
          />
        </Pressable>
        <Text style={styles.title}>대화 시작</Text>
      </View>
      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: "http://172.22.209.30:5175/" }}
          style={styles.webView}
          originWhitelist={["*"]}
          javaScriptEnabled
        />
      </View>
    </SafeAreaView>
  );
};

export default ChatStartScreen;

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
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
