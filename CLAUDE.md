# RaceOn Mobile

React Native CLI 프로젝트 (raceon-mobile)

## 앱 개요

마라톤 대회 일정 조회 및 신청 대회 관리 앱

## 기술 스택

- **React Native**: 0.85.3
- **React**: 19.2.3
- **TypeScript**: ^5.8.3
- **react-native-safe-area-context**: ^5.5.2
- **nativewind**: 4.2.5 — React Native용 Tailwind CSS
- **tailwindcss**: (nativewind peer dep) — 유틸리티 기반 스타일링
- **@react-navigation/native**: 네비게이션 컨테이너
- **@react-navigation/bottom-tabs**: 하단 탭 네비게이터
- **react-native-screens**: 네이티브 화면 최적화
- **@react-native-seoul/naver-login**: 네이버 소셜 로그인
- **@react-native-kakao/core**, **@react-native-kakao/user**: 카카오 소셜 로그인

## 프로젝트 구조

```
raceon-mobile/
├── App.tsx                          # 루트 컴포넌트 (NavigationContainer)
├── index.js                         # 앱 진입점
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Bottom Tab 네비게이터
│   └── screens/
│       ├── RaceListScreen.tsx       # 대회 일정 화면
│       └── MyRacesScreen.tsx        # 내 대회 화면
├── android/                         # Android 네이티브 코드
├── ios/                             # iOS 네이티브 코드
└── __tests__/                       # 테스트 파일
```

## 개발 명령어

```bash
# Android 실행
npm run android

# iOS 실행
npm run ios

# Metro 번들러 시작
npm run start

# 린트
npm run lint

# 테스트
npm run test
```

## 화면 목록

> 화면이 추가될 때마다 여기에 기록됩니다.

| 화면 | 파일 경로 | 설명 | 추가일 |
|------|-----------|------|--------|
| 대회 일정 | `src/screens/RaceListScreen.tsx` | 마라톤 대회 목록 (더미 데이터) | 2026-06-06 |
| 내 대회 | `src/screens/MyRacesScreen.tsx` | 신청한 대회 관리 (빈 상태) | 2026-06-06 |

## 네비게이션 구조

Bottom Tab Navigator (AppNavigator.tsx)
- 🗓️ 대회 일정 → RaceListScreen
- 🏅 내 대회 → MyRacesScreen

## 스타일링

NativeWind v4 (Tailwind CSS) 사용. `StyleSheet.create()` 대신 `className` prop으로 스타일 적용.

```tsx
// 사용 예시
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-gray-800">Hello</Text>
</View>
```

설정 파일:
- `tailwind.config.js` — content 경로: `./App.{js,jsx,ts,tsx}`, `./src/**/*.{js,jsx,ts,tsx}`
- `global.css` — Tailwind directives (App.tsx에서 import)
- `nativewind-env.d.ts` — TypeScript 타입 선언

## 주요 컨벤션

- 컴포넌트 파일: PascalCase (예: `HomeScreen.tsx`)
- 스타일: NativeWind `className` 사용 (StyleSheet.create 지양)
- Safe Area: `react-native-safe-area-context` 사용

## CLAUDE.md 업데이트 규칙

**파일이나 라이브러리를 추가/수정할 때마다 반드시 이 파일을 업데이트한다.**

| 변경 종류 | 업데이트할 섹션 |
|-----------|----------------|
| 새 화면 추가 | `화면 목록` 테이블에 행 추가 |
| 네비게이션 구조 변경 | `네비게이션 구조` 섹션 수정 |
| 라이브러리 설치/제거 | `기술 스택` 섹션 수정 |
| 프로젝트 구조 변경 | `프로젝트 구조` 트리 수정 |
| 새 개발 명령어 추가 | `개발 명령어` 섹션 수정 |
