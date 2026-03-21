import messaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

import {
  ANDROID_PUSH_CHANNEL_ID,
  ANDROID_PUSH_CHANNEL_NAME,
} from "@/constants/push";
import type { PushNotificationState } from "@/types/push";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * iOS/Android: 알림 권한·Android 채널·FCM 토큰.
 * 웹은 `use-push-notifications.web.ts` 사용.
 */
export function usePushNotifications(): PushNotificationState {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshFcmToken = useCallback(async (): Promise<void> => {
    if (!Device.isDevice) {
      setError("실기기에서만 FCM 토큰을 받을 수 있습니다.");
      return;
    }

    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let next = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        next = status;
      }
      setPermissionStatus(next);

      if (next !== "granted") {
        setFcmToken(null);
        setError("알림 권한이 거부되었습니다.");
        return;
      }

      if (Platform.OS === "ios") {
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();
      console.log("FCM 토큰:", token);
      setFcmToken(token);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setFcmToken(null);
      setError(
        `FCM 토큰 오류: ${message}\nFirebase 설정(google-services.json, GoogleService-Info.plist)을 확인해 주세요.`,
      );
    }
  }, []);

  useEffect(() => {
    const setup = async (): Promise<void> => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
          ANDROID_PUSH_CHANNEL_ID,
          {
            name: ANDROID_PUSH_CHANNEL_NAME,
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#007AFF",
          },
        );
      }
      await refreshFcmToken();
    };

    void setup();

    const unsubTokenRefresh = messaging().onTokenRefresh((newToken) => {
      setFcmToken(newToken);
    });

    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        void refreshFcmToken();
      }
    });

    return () => {
      unsubTokenRefresh();
      sub.remove();
    };
  }, [refreshFcmToken]);

  return { fcmToken, permissionStatus, error };
}
