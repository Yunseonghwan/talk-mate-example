import type { PushNotificationState } from "@/types/push";

/** 웹: FCM 네이티브 모듈 없음 */
export function usePushNotifications(): PushNotificationState {
  return {
    fcmToken: null,
    permissionStatus: null,
    error: "푸시는 웹에서 지원되지 않습니다.",
  };
}
