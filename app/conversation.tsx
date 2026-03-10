import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
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
import WebView, { type WebViewMessageEvent } from "react-native-webview";

import MicSection from "@/components/mic-section";
import { useAudioPermissions } from "@/hooks/use-audio-permissions";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useRecordingStore } from "@/stores/recording-store";

const BRIDGE_JS = `
(function() {
  if (!window.webkit) window.webkit = {};
  if (!window.webkit.messageHandlers) window.webkit.messageHandlers = {};
  window.webkit.messageHandlers.talkmateApp = {
    postMessage: function(msg) {
      window.ReactNativeWebView.postMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };
  true;
})();
`;

const ConversationScreen = () => {
  const webViewRef = useRef<WebView>(null);
  const { requestPermission } = useAudioPermissions();
  const { isRecording, durationMs, metering, startRecording, stopAndSave } =
    useVoiceRecorder();
  const addRecording = useRecordingStore((state) => state.addRecording);

  const handleConversationStart = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      webViewRef.current?.injectJavaScript(
        `window.dispatchEvent(new CustomEvent('nativeMessage', { detail: { type: 'permission_granted' } })); true;`,
      );
      await startRecording();
    } else {
      Alert.alert(
        "마이크 권한 필요",
        "마이크 사용을 위해 설정에서 권한을 허용해 주세요.",
        [
          { text: "취소", style: "cancel" },
          { text: "설정으로 이동", onPress: () => Linking.openSettings() },
        ],
      );
    }
  }, [requestPermission, startRecording]);

  const handleConversationStop = useCallback(async () => {
    const currentDuration = durationMs;
    const savedUri = await stopAndSave();
    if (savedUri) {
      await addRecording(savedUri, currentDuration);
    }
    router.replace("/landing");
  }, [stopAndSave, durationMs, addRecording]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const { data } = event.nativeEvent;
      console.log("webview -> native:", data);

      switch (data) {
        case "conversation_start":
          void handleConversationStart();
          break;
        case "conversation_stop":
          void handleConversationStop();
          break;
        default:
          console.log("unhandled message:", data);
      }
    },
    [handleConversationStart, handleConversationStop],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#11181C" />
        </Pressable>
        <Text style={styles.title}>대화하기</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.body}>
        <WebView
          ref={webViewRef}
          style={styles.webview}
          source={{ uri: "http://10.74.117.30:5173/" }}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          injectedJavaScriptBeforeContentLoaded={BRIDGE_JS}
          onMessage={handleMessage}
        />

        {isRecording && (
          <View style={styles.micOverlay} pointerEvents="none">
            <MicSection
              isRecording={isRecording}
              durationMs={durationMs}
              meteringDb={metering}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#11181C",
  },
  placeholder: {
    width: 40,
  },
  body: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  micOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
});

export default ConversationScreen;
