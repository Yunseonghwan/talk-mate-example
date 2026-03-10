import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const BAR_COUNT = 6;
const BAR_WIDTH = 6;
const BAR_GAP = 5;
const BAR_MAX_HEIGHT = 40;
const BAR_MIN_SCALE = 0.15;

const SPRING_CONFIG = {
  damping: 12,
  stiffness: 180,
  mass: 0.4,
};

const SILENCE_THRESHOLD_DB = -50;

type AudioLevelMeterProps = {
  meteringDb: number;
  isActive: boolean;
};

function normalizeMeteringDb(db: number): number {
  "worklet";
  if (db <= SILENCE_THRESHOLD_DB) return 0;
  const clamped = Math.min(db, 0);
  return (clamped - SILENCE_THRESHOLD_DB) / (0 - SILENCE_THRESHOLD_DB);
}

function getBarScale(normalizedLevel: number, barIndex: number): number {
  "worklet";
  const center = (BAR_COUNT - 1) / 2;
  const distFromCenter = Math.abs(barIndex - center) / center;
  const attenuation = 1 - distFromCenter * 0.45;
  const scale = normalizedLevel * attenuation;
  return Math.max(BAR_MIN_SCALE, Math.min(1, scale));
}

const LevelBar = ({
  index,
  meteringDb,
  isActive,
}: {
  index: number;
  meteringDb: number;
  isActive: boolean;
}): React.JSX.Element => {
  const scaleY = useSharedValue(BAR_MIN_SCALE);

  useEffect(() => {
    if (!isActive) {
      scaleY.value = withSpring(BAR_MIN_SCALE, SPRING_CONFIG);
      return;
    }
    const normalized = normalizeMeteringDb(meteringDb);
    const target = getBarScale(normalized, index);
    scaleY.value = withSpring(target, SPRING_CONFIG);
  }, [meteringDb, isActive, index, scaleY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
  }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

const AudioLevelMeter = ({
  meteringDb,
  isActive,
}: AudioLevelMeterProps): React.JSX.Element => {
  console.log("meteringDb", meteringDb);
  return (
    <View style={styles.container}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <LevelBar
          key={i}
          index={i}
          meteringDb={meteringDb}
          isActive={isActive}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: BAR_MAX_HEIGHT,
    gap: BAR_GAP,
  },
  bar: {
    width: BAR_WIDTH,
    height: BAR_MAX_HEIGHT,
    borderRadius: BAR_WIDTH / 2,
    backgroundColor: "#007AFF",
  },
});

export default AudioLevelMeter;
