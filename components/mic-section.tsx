import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

type MicSectionProps = {
  isRecording?: boolean;
  durationMs?: number;
  title?: string;
  subtitle?: string;
};

const formatDuration = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const MicSection = ({
  isRecording = false,
  durationMs = 0,
  title = "대화시작하기",
  subtitle = "아래 버튼을 눌러서 AI와 대화를 시작해 보세요",
}: MicSectionProps): React.JSX.Element => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }

    pulseAnim.setValue(1);
  }, [isRecording, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerCircle,
          isRecording && styles.outerCircleRecording,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            isRecording && styles.innerCircleRecording,
          ]}
        >
          <MaterialIcons name="mic" size={48} color="#fff" />
        </View>
      </Animated.View>

      {isRecording ? (
        <>
          <Text style={styles.recordingText}>녹음 중...</Text>
          <Text style={styles.durationText}>{formatDuration(durationMs)}</Text>
        </>
      ) : (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  outerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  outerCircleRecording: {
    backgroundColor: "#E53935",
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircleRecording: {
    backgroundColor: "#EF5350",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#11181C",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#687076",
    textAlign: "center",
    lineHeight: 20,
  },
  recordingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E53935",
    textAlign: "center",
    marginBottom: 8,
  },
  durationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#687076",
    textAlign: "center",
  },
});

export default MicSection;
