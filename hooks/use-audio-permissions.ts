import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  check,
  PERMISSIONS,
  request,
  type Permission,
  type PermissionStatus,
} from "react-native-permissions";

const MICROPHONE_PERMISSION: Permission =
  Platform.OS === "ios"
    ? PERMISSIONS.IOS.MICROPHONE
    : PERMISSIONS.ANDROID.RECORD_AUDIO;

export type UseAudioPermissionsReturn = {
  status: PermissionStatus | null;
  isLoading: boolean;
  isGranted: boolean;
  checkPermission: () => Promise<void>;
  requestPermission: () => Promise<PermissionStatus>;
};

export function useAudioPermissions(): UseAudioPermissionsReturn {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkPermission = useCallback(async (): Promise<void> => {
    try {
      const result = await check(MICROPHONE_PERMISSION);
      setStatus(result);
    } catch {
      setStatus("unavailable");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = useCallback(async (): Promise<PermissionStatus> => {
    setIsLoading(true);
    try {
      const result = await request(MICROPHONE_PERMISSION);
      setStatus(result);
      return result;
    } catch {
      setStatus("unavailable");
      return "unavailable";
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    status,
    isLoading,
    isGranted: status === "granted",
    checkPermission,
    requestPermission,
  };
}
