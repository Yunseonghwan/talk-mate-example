import { useRouter, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useSessionStore } from "@/stores/session-store";

/** 세션 초기화, AppState 기반 만료 체크, 세션 유지 시 landing 리다이렉트 */
export function SessionGuard(): null {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const initialize = useSessionStore((s) => s.initialize);

  useEffect(() => {
    void initialize().then(() => {
      setIsReady(true);
    });
  }, [initialize]);

  useEffect(() => {
    if (!isReady) return;

    const isRoot = pathname === "/" || pathname === "";
    if (useSessionStore.getState().isSessionValid() && isRoot) {
      router.replace("/landing");
    }
  }, [isReady, pathname, router]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState !== "active") return;

        if (!useSessionStore.getState().isSessionValid()) {
          router.replace("/");
        }
      },
    );

    return () => subscription.remove();
  }, [router]);

  return null;
}
