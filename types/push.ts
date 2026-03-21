import type { PermissionStatus } from "expo-notifications";

export type PushNotificationState = {
  fcmToken: string | null;
  permissionStatus: PermissionStatus | null;
  error: string | null;
};
