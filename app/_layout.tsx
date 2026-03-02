import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { SessionGuard } from "@/components/session-guard";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SessionGuard />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat-history"
          options={{ headerShown: false, title: "대화 기록" }}
        />
        <Stack.Screen
          name="token-purchase"
          options={{ headerShown: false, title: "토큰 구매" }}
        />
        <Stack.Screen
          name="permissions"
          options={{ headerShown: false, title: "권한 설정" }}
        />
        <Stack.Screen
          name="chat-start"
          options={{ headerShown: false, title: "대화 시작" }}
        />
        <Stack.Screen
          name="read-aloud"
          options={{ headerShown: false, title: "읽어주기" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
