# RaceOn Mobile

React Native CLI 프로젝트 (raceon-mobile)

## 기술 스택

- **React Native**: 0.85.3
- **React**: 19.2.3
- **TypeScript**: ^5.8.3
- **react-native-safe-area-context**: ^5.5.2
- **nativewind**: 4.2.5 — React Native용 Tailwind CSS
- **tailwindcss**: (nativewind peer dep) — 유틸리티 기반 스타일링

## 프로젝트 구조

```
raceon-mobile/
├── App.tsx              # 루트 컴포넌트
├── index.js             # 앱 진입점
├── android/             # Android 네이티브 코드
├── ios/                 # iOS 네이티브 코드
└── __tests__/           # 테스트 파일
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
| (아직 없음) | - | - | - |

## 네비게이션 구조

> 네비게이션이 추가되면 여기에 기록됩니다.

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
