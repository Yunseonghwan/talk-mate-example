# 푸시 알림 (expo-notifications + FCM)

## Firebase 콘솔

1. Firebase 프로젝트 생성 후 **Android / iOS** 앱 등록 (번들 ID: `com.seonghwanyun.talkmateexample`)
2. **google-services.json** (Android) · **GoogleService-Info.plist** (iOS) 다운로드
3. 프로젝트 루트에 두 파일을 두고, 내용은 **콘솔에서 받은 값으로 교체**합니다. (현재 저장소의 파일은 자리 표시용입니다.)

## 빌드

```bash
npx expo prebuild --clean
npx expo run:ios
npx expo run:android
```

**Expo Go**에서는 FCM 네이티브가 제한될 수 있어 **development / production 빌드**를 권장합니다.

## 앱 동작

- `app/_layout.tsx`에서 `usePushNotifications()` 호출
- Android: 알림 채널 `default` (`constants/push.ts`)
- 권한: `Notifications.requestPermissionsAsync()` + Android 13+ `POST_NOTIFICATIONS` (`app.json`)
- iOS: `UIBackgroundModes`에 `remote-notification` (`app.json`)
- FCM 토큰: `@react-native-firebase/messaging` 의 `getToken()`

## APNs (iOS)

Firebase 콘솔에 **APNs 인증 키 또는 인증서**를 업로드해야 원격 푸시가 동작합니다.

## CocoaPods: `GoogleUtilities` / Swift pods (정적 라이브러리)

`FirebaseCoreInternal` 등이 `GoogleUtilities` 모듈 맵 없이 실패하면, `plugins/with-firebase-modular-headers.js` 가 Podfile에 `use_modular_headers!` 를 넣습니다.

설정 반영 후:

```bash
cd ios && pod install --repo-update
```

또는 `npx expo prebuild --clean` 후 다시 빌드합니다.

여전히 충돌하면 `app.json` 의 `expo-build-properties` → `ios` 에 `useFrameworks: "static"` 을 검토할 수 있습니다 (다른 Pod과 상호작용이 있을 수 있음).
