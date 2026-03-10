import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRecordingPlayer } from "@/hooks/use-recording-player";
import {
  type RecordingItem,
  useRecordingStore,
} from "@/stores/recording-store";
import { formatDate, formatDurationMs } from "@/utils/format-duration";

const ChatHistoryScreen = () => {
  const { recordings, isLoaded, loadRecordings, removeRecording } =
    useRecordingStore();
  const { currentId, isPlaying, positionMs, durationMs, play, stop } =
    useRecordingPlayer();

  useEffect(() => {
    if (!isLoaded) {
      void loadRecordings();
    }
  }, [isLoaded, loadRecordings]);

  const handlePlay = useCallback(
    (item: RecordingItem) => {
      play(item.id, item.uri);
    },
    [play],
  );

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleDelete = useCallback(
    (item: RecordingItem) => {
      Alert.alert("녹음 삭제", "이 녹음을 삭제하시겠습니까?", [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            if (currentId === item.id) {
              stop();
            }
            try {
              await FileSystem.deleteAsync(item.uri, { idempotent: true });
            } catch {
              // 파일이 이미 삭제된 경우 무시
            }
            await removeRecording(item.id);
          },
        },
      ]);
    },
    [currentId, stop, removeRecording],
  );

  const renderItem = useCallback(
    ({ item }: { item: RecordingItem }) => {
      const isActive = currentId === item.id;
      const isItemPlaying = isActive && isPlaying;

      return (
        <View style={styles.recordingItem}>
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingName} numberOfLines={1}>
              {item.filename}
            </Text>
            <View style={styles.recordingMeta}>
              <Text style={styles.recordingDuration}>
                {isActive
                  ? `${formatDurationMs(positionMs)} / ${formatDurationMs(durationMs || item.durationMs)}`
                  : formatDurationMs(item.durationMs)}
              </Text>
              <Text style={styles.recordingDate}>
                {formatDate(item.createdAt)}
              </Text>
            </View>

            {isActive && (
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${durationMs > 0 ? (positionMs / durationMs) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
            )}
          </View>

          <View style={styles.recordingActions}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                isItemPlaying && styles.activePlayButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={() => handlePlay(item)}
            >
              <MaterialIcons
                name={isItemPlaying ? "pause" : "play-arrow"}
                size={22}
                color={isItemPlaying ? "#fff" : "#007AFF"}
              />
            </Pressable>

            {isActive && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={handleStop}
              >
                <MaterialIcons name="stop" size={22} color="#6B7280" />
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={() => handleDelete(item)}
            >
              <MaterialIcons name="delete-outline" size={22} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      );
    },
    [
      currentId,
      isPlaying,
      positionMs,
      durationMs,
      handlePlay,
      handleStop,
      handleDelete,
    ],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="mic-off" size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>녹음 기록이 없습니다</Text>
        <Text style={styles.emptySubtitle}>
          대화를 시작하면 녹음이 저장됩니다
        </Text>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#11181C" />
        </Pressable>
        <Text style={styles.title}>대화기록</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          recordings.length === 0 ? styles.listEmpty : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listEmpty: {
    flex: 1,
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#11181C",
  },
  recordingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  recordingDuration: {
    fontSize: 13,
    color: "#6B7280",
    fontVariant: ["tabular-nums"],
  },
  recordingDate: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "#E5E7EB",
    borderRadius: 1.5,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 1.5,
  },
  recordingActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  activePlayButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  actionButtonPressed: {
    opacity: 0.6,
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});

export default ChatHistoryScreen;
