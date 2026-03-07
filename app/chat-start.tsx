import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { WebViewMessageEvent } from "react-native-webview";
import { WebView } from "react-native-webview";

import { Colors, Layout, Spacing } from "@/constants/theme";
import { useAudioPermissions } from "@/hooks/use-audio-permissions";

const WEBVIEW_URL = "http://10.74.117.30:5173/";

const CONVERSATION_STARTED_MESSAGE = "대화를 시작했습니다";

const ChatStartScreen = () => {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const { checkAndGetStatus, requestPermission } = useAudioPermissions();

  const sendMessageToWeb = useCallback((message: string): void => {
    const script = `
      (function() {
        window.dispatchEvent(new CustomEvent('nativeToWeb', {
          detail: { type: 'conversation_started', message: ${JSON.stringify(message)} }
        }));
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  }, []);

  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent): void => {
      const { data } = event.nativeEvent;
      try {
        const parsed = JSON.parse(data) as unknown;
        console.log("[WebView -> Native]", JSON.stringify(parsed, null, 2));
      } catch {
        console.log("[WebView -> Native]", data);
      }
    },
    [],
  );

  const handleShouldStartLoad = useCallback(
    (request: { url: string }): boolean => {
      const isPermissionButton = request.url.startsWith("permission-button://");
      const isTalkMate = request.url.startsWith("talkmateexample://");
      if (isPermissionButton || isTalkMate) {
        const path = request.url.replace(
          isPermissionButton ? "permission-button://" : "talkmateexample://",
          "",
        );
        console.log("[WebView Custom Scheme]", path);

        if (path === "conversation_start") {
          void (async () => {
            const currentStatus = await checkAndGetStatus();
            if (currentStatus === "granted") {
              sendMessageToWeb(CONVERSATION_STARTED_MESSAGE);
              return;
            }
            const result = await requestPermission();
            if (result === "granted") {
              sendMessageToWeb(CONVERSATION_STARTED_MESSAGE);
            } else {
              Alert.alert(
                "권한 필요",
                "마이크 권한이 필요합니다. 앱 설정에서 권한을 허용한 후 이용해주세요.",
                [
                  { text: "취소", style: "cancel" },
                  {
                    text: "설정 열기",
                    onPress: () => void Linking.openSettings(),
                  },
                ],
              );
            }
          })();
        } else if (path === "conversation_stop") {
          router.replace("/landing");
        }
        return false;
      }
      return true;
    },
    [checkAndGetStatus, requestPermission, sendMessageToWeb, router],
  );

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
          ref={webViewRef}
          source={{ uri: WEBVIEW_URL }}
          style={styles.webView}
          originWhitelist={["*"]}
          javaScriptEnabled
          onMessage={handleWebViewMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
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
