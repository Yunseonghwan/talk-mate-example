# RevenueCat **Test store** 결제만 사용

실제 App Store / Play 스토어 프로덕션 키·별도 iOS·Android 프로덕션 분기는 사용하지 않습니다.  
**Test store** 공개 키와 RevenueCat 대시보드의 Test store 상품만으로 결제를 시험합니다.

- **프로젝트 ID**: `projb43c198a` (`constants/revenuecat.ts` 의 `REVENUECAT_PROJECT_ID`, 선택적으로 `EXPO_PUBLIC_REVENUECAT_PROJECT_ID`)

## 1. 환경 변수 (`.env`)

RevenueCat **Project settings → API keys → Test store** 탭의 **Public API key** 를 복사합니다.

| 변수 | 설명 |
|------|------|
| `EXPO_PUBLIC_REVENUECAT_TEST_STORE_IOS_API_KEY` | Test store — Apple 용 공개 키 |
| `EXPO_PUBLIC_REVENUECAT_TEST_STORE_ANDROID_API_KEY` | Test store — Google 용 공개 키 |
| `EXPO_PUBLIC_REVENUECAT_PROJECT_ID` | (선택) 프로젝트 ID, 기본값 `projb43c198a` |

`.env` 변경 후 Metro/번들을 다시 띄우고, 네이티브 변경이 있으면 `npx expo prebuild` 후 빌드합니다.

## 2. Offering

앱은 `getOfferings().all` 에서 **`constants/revenuecat.ts` 의 `REVENUECAT_OFFERING_ID`** 만 사용합니다.  
(예: Identifier `token`, Display name `tokenpay` → 코드에 `REVENUECAT_OFFERING_ID = "token"`)

패키지를 **`$rc_annual`** 슬롯에만 넣은 경우에도 SDK의 `annual` 과 `availablePackages` 를 합쳐서 찾습니다.

## 3. 상품 ID (`constants/revenuecat.ts`)

Test store **Products** 에 동일한 식별자로 상품을 만들고, 위 Offering 안에 패키지로 넣습니다.

- 연간: `com.seonghwanyun.talkmateexample.sub.annual`
- 토큰 5개: Product Identifier **`5token`** (SDK는 `product.identifier` 로 조회 — REST API의 `entl…` 와 다를 수 있음)
- 그 외 토큰: `constants/revenuecat.ts` 의 식별자와 Test store Products·Offerings 가 일치해야 함

## 4. Entitlements

- 코드의 `REVENUECAT_ENTITLEMENT_ANNUAL`(`pro`)와 대시보드 Entitlement 가 일치해야 연간 만료가 반영됩니다.

## 5. 앱 동작

- SDK는 **항상** `DEBUG` 로그로 초기화됩니다 (Test store 전용).
- 결제는 시뮬레이션된 Test store 플로우를 사용합니다 (실제 스토어 과금 없음).

## 6. 네이티브

`react-native-purchases` 가 필요로 하는 권한·설정은 패키지 쪽에서 병합됩니다.  
별도 `expo-build-properties` 나 수동 BILLING 권한 나열은 이 프로젝트 `app.json` 에서 제거되어 있습니다.
