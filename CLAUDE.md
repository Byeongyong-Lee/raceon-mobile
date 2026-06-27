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
- **@react-navigation/native-stack**: 스택 네비게이터 (설정 화면)
- **react-native-screens**: 네이티브 화면 최적화
- **@react-native-seoul/naver-login**: 네이버 소셜 로그인
- **@react-native-kakao/core**, **@react-native-kakao/user**: 카카오 소셜 로그인
- **@react-native-google-signin/google-signin**: 구글 소셜 로그인
- **react-native-config**: 환경별 `.env` 파일로 민감 정보 및 설정 관리 (`.env.local`, `.env.dev`, `.env.prod`는 `.gitignore`에 포함)
- **cross-env**: Windows 호환 환경변수 설정 (npm 스크립트에서 `ENVFILE` 전달 시 사용)
- **@react-native-async-storage/async-storage**: JWT 토큰 영구 저장
- **react-native-image-picker**: 갤러리에서 이미지 선택 (기록증 업로드)
- **react-native-bootsplash**: 앱 아이콘 및 스플래시 스크린 관리 — 네이티브 splash 표시 후 JS에서 `BootSplash.hide()` 호출로 제거

## 프로젝트 구조

```
raceon-mobile/
├── App.tsx                          # 루트 컴포넌트 (NavigationContainer + UserProvider)
├── index.js                         # 앱 진입점
├── src/
│   ├── components/
│   │   ├── AdSlider.tsx             # 광고 배너 슬라이더
│   │   ├── CourseBadges.tsx         # 코스 배지 (RaceCard·RaceDetail 공유)
│   │   ├── LoginSheet.tsx           # 소셜 로그인 바텀시트
│   │   ├── RaceCard.tsx             # 대회 카드
│   │   ├── MeetupDateTimePicker.tsx # 약속 날짜(캘린더)·시간(오전/오후·시·분) 선택기
│   │   └── YearMonthPicker.tsx      # 연/월 선택기
│   ├── context/
│   │   ├── AreaContext.tsx           # 행정구역 전역 상태 (앱 시작 시 level=1 시도 목록 fetch)
│   │   ├── GroupContext.tsx          # 모임 전역 상태 (groups·myGroups 모두 API 연동, 낙관적 업데이트)
│   │   └── UserContext.tsx          # 유저·토큰·내 대회 전역 상태 관리
│   ├── hooks/
│   │   └── useLogin.ts              # 소셜 로그인 공통 훅 (소셜 SDK → 서버 API → 토큰 저장)
│   ├── services/
│   │   ├── apiClient.ts             # Bearer 토큰 자동 첨부 fetch 래퍼
│   │   ├── areasApi.ts              # GET /api/areas — 행정구역 조회 (인증 불필요)
│   │   ├── authApi.ts               # POST /api/auth/{provider} — JWT 발급
│   │   ├── groupApi.ts              # 모임 CRUD·멤버·신청·게시판·댓글·약속 전체 API
│   │   ├── tokenStorage.ts          # AsyncStorage 기반 JWT 저장/조회/삭제
│   │   └── userRaceApi.ts           # GET·POST·DELETE /api/user-races — 내 대회 서버 연동
│   ├── navigation/
│   │   ├── RootNavigator.tsx        # Stack 네비게이터 (루트)
│   │   └── AppNavigator.tsx         # Bottom Tab 네비게이터
│   ├── screens/
│   │   ├── RaceListScreen.tsx       # 홈 화면 (대회 목록 + D-day)
│   │   ├── RaceDetailScreen.tsx     # 대회 상세 (정보·지도·내 대회 추가)
│   │   ├── CommunityScreen.tsx      # 내 모임 화면 (모임 목록·만들기·코드 참가)
│   │   ├── GroupDetailScreen.tsx    # 모임 상세 (게시판·모임 탭)
│   │   ├── GroupListScreen.tsx      # 모임 목록 화면 (전체 모임 탐색·검색·참가)
│   │   ├── MyRacesScreen.tsx        # 내 대회 화면
│   │   └── SettingsScreen.tsx       # 설정 화면
│   ├── constants/
│   │   └── regions.ts               # 시도 지역 코드 (label·fullName·areaCode) 및 유틸 함수
│   ├── types/
│   │   └── index.ts                 # 공유 타입 (Race, UserRace, Group, Meetup, ChatMessage, BoardPost 등)
│   └── utils/
│       └── race.ts                  # 날짜 유틸 함수 (getDdayLabel 등)
├── assets/
│   ├── logo.svg                     # 스플래시 스크린 로고 (흰 러너, 투명 배경)
│   ├── icon.svg                     # 앱 아이콘 소스 (주황 배경 + 흰 러너, 1024x1024)
│   └── bootsplash/                  # bootsplash generate 산출물 (manifest + 해상도별 PNG)
├── android/                         # Android 네이티브 코드
├── ios/                             # iOS 네이티브 코드
└── __tests__/                       # 테스트 파일
```

## 개발 명령어

```bash
# Metro 번들러 먼저 시작 (터미널 탭 1)
npm run start

# Android 실행 (터미널 탭 2) — --no-packager로 새 창 없이 실행
npm run android           # 로컬 환경 (.env.local, 기본값)
npm run android:local     # 로컬 환경 (.env.local)
npm run android:dev       # 개발 서버 (.env.dev)
npm run android:prod      # 프로덕션 (.env.prod)

# iOS 실행 (터미널 탭 2)
npm run ios               # 로컬 환경 (.env.local, 기본값)
npm run ios:local         # 로컬 환경 (.env.local)
npm run ios:dev           # 개발 서버 (.env.dev)
npm run ios:prod          # 프로덕션 (.env.prod)

# 린트
npm run lint

# 테스트
npm run test
```

> `android`/`ios` 스크립트는 모두 `--no-packager` 포함. Metro를 먼저 띄운 뒤 실행해야 한다.  
> Windows에서 `ENVFILE` 환경변수 전달은 `cross-env`로 처리한다.

## 환경 설정

`react-native-config`로 환경별 `.env` 파일을 관리한다. `ENVFILE` 환경변수로 파일을 선택한다.

| 파일 | 용도 | `API_BASE_URL` |
|------|------|----------------|
| `.env.local` | 로컬 개발 | `http://192.168.x.x:18300` |
| `.env.dev` | 개발 서버 | `https://dev-api.raceon.com` |
| `.env.prod` | 프로덕션 | `https://api.raceon.com` |

공통 키: `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `KAKAO_NATIVE_APP_KEY`, `GOOGLE_WEB_CLIENT_ID`, `API_BASE_URL`

## 화면 목록

> 화면이 추가될 때마다 여기에 기록됩니다.

| 화면 | 파일 경로 | 설명 | 추가일 |
|------|-----------|------|--------|
| 홈 | `src/screens/RaceListScreen.tsx` | 마라톤 대회 목록 + D-day | 2026-06-06 |
| 모임 목록 | `src/screens/GroupListScreen.tsx` | 전체 모임 탐색·검색·지역 필터·가입 신청 (서버 연동) | 2026-06-15 |
| 내 모임 | `src/screens/CommunityScreen.tsx` | 모임 목록·만들기·코드 참가 | 2026-06-12 |
| 모임 상세 | `src/screens/GroupDetailScreen.tsx` | 게시판(CRUD·공지·댓글)·약속 탭 (서버 연동) | 2026-06-12 |
| 내 대회 | `src/screens/MyRacesScreen.tsx` | 신청한 대회 관리 | 2026-06-06 |
| 대회 상세 | `src/screens/RaceDetailScreen.tsx` | 대회 상세 정보·지도 연결·내 대회 추가 | 2026-06-09 |
| 설정 | `src/screens/SettingsScreen.tsx` | 프로필·로그아웃·앱 정보 | 2026-06-08 |

## 네비게이션 구조

RootNavigator (Stack)
- MainTabs (AppNavigator) → Bottom Tab
  - 홈 (home) → RaceListScreen
  - 모임 목록 (groups) → GroupListScreen
  - 내 모임 (forum) → CommunityScreen → GroupDetailScreen (인라인 전환)
  - 내 대회 (emoji-events) → MyRacesScreen
- Settings → SettingsScreen (프로필 이미지 클릭 시 이동)
- RaceDetail → RaceDetailScreen (대회 카드 탭 시 이동, race 객체 전달)

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
