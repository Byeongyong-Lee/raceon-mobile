import React, {useEffect, useRef, useState} from 'react';
import NaverLogin, {NaverLoginResponse} from '@react-native-seoul/naver-login';
import {login as kakaoLogin, me as getKakaoMe} from '@react-native-kakao/user';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useUser} from '../context/UserContext';
import {RootStackParamList} from '../navigation/RootNavigator';
import Svg, {Path, G, ClipPath, Rect, Defs} from 'react-native-svg';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const AD_WIDTH = SCREEN_WIDTH - 32;
const MONTH_ITEM_W = Math.floor(SCREEN_WIDTH / 5);
const MONTH_SIDE_PAD = Math.floor((SCREEN_WIDTH - MONTH_ITEM_W) / 2);

const BASE_URL = 'http://10.0.2.2:18300';

type User = {name: string; imageUrl: string | null};
type Race = {
  id: string;
  sourceId: string;
  name: string;
  raceDate: string;
  location: string;
  course: string;
  organizer: string;
  phone: string;
  homepage: string;
  detailUrl: string;
};
type MyRace = {id: string; name: string; raceDate: string};
type Ad = {id: string; title: string; subtitle: string; bgColor: string};

GoogleSignin.configure({
  webClientId: Config.GOOGLE_WEB_CLIENT_ID,
});

NaverLogin.initialize({
  appName: 'RaceOn',
  consumerKey: Config.NAVER_CLIENT_ID!,
  consumerSecret: Config.NAVER_CLIENT_SECRET!,
  serviceUrlSchemeIOS: 'com.raceonmobile',
});

const DUMMY_USER: User = {name: '이병용', imageUrl: 'https://i.pravatar.cc/150?img=3'};

const ADS: Ad[] = [
  {id: '1', title: '2026 서울마라톤 접수중', subtitle: '3월 15일 · 광화문 출발', bgColor: '#f97316'},
  {id: '2', title: '러닝 기어 특가 세일', subtitle: '최대 40% 할인 · 오늘만', bgColor: '#3b82f6'},
  {id: '3', title: '초보 러너 훈련 가이드', subtitle: '12주 완성 프로그램 무료 제공', bgColor: '#10b981'},
];

// 신청한 대회 더미 데이터 (추후 API 연동)
const MY_RACES: MyRace[] = [
  {id: '4', name: '춘천마라톤', raceDate: '2026-10-25'},
  {id: '5', name: '부산마라톤', raceDate: '2026-11-08'},
];

function getDdayLabel(raceDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = raceDate.slice(0, 10).split('-').map(Number);
  const diff = Math.ceil(
    (new Date(y, m - 1, d).getTime() - today.getTime()) / 86400000,
  );
  if (diff === 0) return 'D-day';
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

function formatDate(raceDate: string): string {
  return raceDate.slice(0, 10).replace(/-/g, '.');
}

function getDay(raceDate: string): string {
  return raceDate.slice(0, 10).split('-')[2];
}

function Header({
  user,
  onPersonPress,
  onSettingsPress,
}: {
  user: User | null;
  onPersonPress: () => void;
  onSettingsPress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
      <View className="flex-row items-center">
        <Text className="text-2xl font-black text-orange-500">Race</Text>
        <Text className="text-2xl font-black text-gray-900">On</Text>
      </View>
      {user ? (
        <TouchableOpacity onPress={onSettingsPress} activeOpacity={0.7}>
          {user.imageUrl ? (
            <Image
              source={{uri: user.imageUrl}}
              className="h-9 w-9 rounded-full"
            />
          ) : (
            <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
              <MaterialIcons name="person" size={22} color="#6b7280" />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onPersonPress}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          activeOpacity={0.7}>
          <MaterialIcons name="person" size={24} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}

type SocialProvider = 'google' | 'naver' | 'kakao';

function GoogleLogo() {
  return (
    <Svg width={24} height={24} viewBox="0 0 48 48">
      <Defs>
        <ClipPath id="g">
          <Path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#g)">
        <Path d="M0 37V11l17 13z" fill="#FBBC05" />
        <Path d="M0 11l17 13 7-6.1L48 14V0H0z" fill="#EA4335" />
        <Path d="M0 37l30-23 7.9 1L48 0v48H0z" fill="#34A853" />
        <Path d="M48 48L17 24l-4-3 35-10z" fill="#4285F4" />
      </G>
    </Svg>
  );
}

function NaverLogo() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M1.6 0S0 0 0 1.6v20.8S0 24 1.6 24h20.8s1.6 0 1.6-1.6V1.6S24 0 22.4 0zm3.415 5.6h4.78l4.425 6.458V5.6h4.765v12.8h-4.78L9.78 11.943V18.4H5.015Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function KakaoLogo() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3"
        fill="#3C1E1E"
      />
    </Svg>
  );
}

function LoginSheet({
  visible,
  onClose,
  onLogin,
}: {
  visible: boolean;
  onClose: () => void;
  onLogin: (provider: SocialProvider) => void;
}) {
  const {bottom: bottomInset} = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
      }).start();
    } else {
      slideAnim.setValue(600);
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        {/* 딤 오버레이 */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
          }}
          activeOpacity={1}
          onPress={onClose}
        />
        {/* 시트 본체 — 열릴 때만 슬라이드, 닫힐 때 즉시 사라짐 */}
        <Animated.View style={{transform: [{translateY: slideAnim}]}}>
        <View className="rounded-t-3xl bg-white px-6 pt-4" style={{paddingBottom: Math.max(bottomInset, 24) + 16}}>
          {/* 드래그 핸들 */}
          <View className="mb-8 h-1 w-10 self-center rounded-full bg-gray-200" />

          {/* 타이틀 */}
          <View className="mb-8 items-center">
            <View className="mb-3 flex-row items-center">
              <Text className="text-2xl font-black text-orange-500">Race</Text>
              <Text className="text-2xl font-black text-gray-900">On</Text>
            </View>
            <Text className="text-base font-semibold text-gray-800">
              로그인하고 대회를 관리해보세요
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              대회 신청·D-day 알림·일정 관리
            </Text>
          </View>

          {/* Google */}
          <TouchableOpacity
            onPress={() => onLogin('google')}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 56,
              borderRadius: 16,
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#E5E7EB',
              marginBottom: 12,
              elevation: 1,
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 4,
              shadowOffset: {width: 0, height: 2},
            }}>
            <GoogleLogo />
            <Text
              style={{
                marginLeft: 12,
                fontSize: 15,
                fontWeight: '600',
                color: '#374151',
              }}>
              Google로 로그인
            </Text>
          </TouchableOpacity>

          {/* Naver */}
          <TouchableOpacity
            onPress={() => onLogin('naver')}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 56,
              borderRadius: 16,
              backgroundColor: '#03C75A',
              marginBottom: 12,
            }}>
            <NaverLogo />
            <Text
              style={{
                marginLeft: 12,
                fontSize: 15,
                fontWeight: '600',
                color: '#FFFFFF',
              }}>
              네이버로 로그인
            </Text>
          </TouchableOpacity>

          {/* Kakao */}
          <TouchableOpacity
            onPress={() => onLogin('kakao')}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 56,
              borderRadius: 16,
              backgroundColor: '#FEE500',
            }}>
            <KakaoLogo />
            <Text
              style={{
                marginLeft: 12,
                fontSize: 15,
                fontWeight: '600',
                color: '#3C1E1E',
              }}>
              카카오로 로그인
            </Text>
          </TouchableOpacity>
        </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function AdSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(AD_WIDTH);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % ADS.length;
        scrollRef.current?.scrollTo({x: next * sliderWidth, animated: true});
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [sliderWidth]);

  return (
    <View className="mx-4 mb-3 overflow-hidden rounded-2xl" style={{height: 140}}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={e => setSliderWidth(e.nativeEvent.layout.width)}
        onMomentumScrollEnd={e =>
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / sliderWidth))
        }>
        {ADS.map(ad => (
          <View
            key={ad.id}
            style={{width: sliderWidth, backgroundColor: ad.bgColor}}
            className="items-center justify-center px-8">
            <Text className="text-center text-xl font-bold text-white">{ad.title}</Text>
            <Text
              className="mt-2 text-center text-sm text-white"
              style={{opacity: 0.85}}>
              {ad.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View
        className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center"
        style={{gap: 6}}>
        {ADS.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === activeIndex ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'white',
              opacity: i === activeIndex ? 1 : 0.5,
            }}
          />
        ))}
      </View>
    </View>
  );
}

function DdaySection() {
  return (
    <View className="mb-3">
      <Text className="mb-2 px-4 text-sm font-bold text-gray-700">내 대회 D-day</Text>
      {MY_RACES.length === 0 ? (
        <Text className="px-4 text-sm text-gray-400">신청한 대회가 없어요</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 16, gap: 10}}>
          {MY_RACES.map(race => {
            const label = getDdayLabel(race.raceDate);
            const isPast = label.startsWith('D+');
            return (
              <View
                key={race.id}
                className="rounded-2xl bg-white px-4 py-3"
                style={{
                  minWidth: 130,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: {width: 0, height: 2},
                }}>
                <Text className="text-xs text-gray-400">{formatDate(race.raceDate)}</Text>
                <Text
                  className="mt-0.5 text-sm font-semibold text-gray-800"
                  numberOfLines={1}>
                  {race.name}
                </Text>
                <Text
                  className="mt-1 text-xl font-black"
                  style={{color: isPast ? '#9ca3af' : '#f97316'}}>
                  {label}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function YearMonthPicker({
  year,
  month,
  onYearChange,
  onMonthChange,
}: {
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
}) {
  const listRef = useRef<FlatList>(null);

  const scrollToMonth = (m: number, animated = true) => {
    listRef.current?.scrollToOffset({offset: (m - 1) * MONTH_ITEM_W, animated});
  };

  const handleMonthPress = (m: number) => {
    scrollToMonth(m);
    onMonthChange(m);
  };

  const handleScrollEnd = (e: {nativeEvent: {contentOffset: {x: number}}}) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / MONTH_ITEM_W);
    onMonthChange(Math.min(12, Math.max(1, idx + 1)));
  };

  return (
    <View className="mb-2">
      <View className="mb-3 flex-row items-center justify-center" style={{gap: 16}}>
        <TouchableOpacity
          onPress={() => onYearChange(year - 1)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="w-20 text-center text-base font-bold text-gray-800">
          {year}년
        </Text>
        <TouchableOpacity
          onPress={() => onYearChange(year + 1)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="chevron-right" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={listRef}
        data={Array.from({length: 12}, (_, i) => i + 1)}
        horizontal
        keyExtractor={item => String(item)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={MONTH_ITEM_W}
        decelerationRate="fast"
        initialScrollIndex={month - 1}
        contentContainerStyle={{paddingHorizontal: MONTH_SIDE_PAD}}
        getItemLayout={(_, index) => ({
          length: MONTH_ITEM_W,
          offset: MONTH_ITEM_W * index,
          index,
        })}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({item}) => {
          const dist = Math.abs(item - month);
          const isSelected = dist === 0;
          return (
            <TouchableOpacity
              style={{width: MONTH_ITEM_W, alignItems: 'center', paddingVertical: 8}}
              onPress={() => handleMonthPress(item)}
              activeOpacity={0.7}>
              <Text
                style={{
                  fontSize: isSelected ? 16 : dist === 1 ? 14 : 13,
                  fontWeight: isSelected ? '700' : '400',
                  color: isSelected ? '#f97316' : '#9ca3af',
                  opacity: isSelected ? 1 : dist === 1 ? 0.75 : 0.35,
                }}>
                {item}월
              </Text>
              {isSelected && (
                <View
                  style={{
                    marginTop: 4,
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#f97316',
                  }}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function RaceCard({race}: {race: Race}) {
  const label = getDdayLabel(race.raceDate);
  const isPast = label.startsWith('D+');

  return (
    <TouchableOpacity
      className="mx-4 mb-3 flex-row overflow-hidden rounded-2xl bg-white"
      activeOpacity={0.75}
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 2},
      }}>
      {/* 왼쪽: 날짜 + D-day */}
      <View
        className="items-center justify-center px-4 py-4"
        style={{minWidth: 76, backgroundColor: isPast ? '#f9fafb' : '#fff7ed'}}>
        <Text
          className="text-3xl font-black"
          style={{color: isPast ? '#d1d5db' : '#f97316'}}>
          {getDay(race.raceDate)}
        </Text>
        <View
          className="mt-2 rounded-full px-2 py-0.5"
          style={{backgroundColor: isPast ? '#e5e7eb' : '#f97316'}}>
          <Text
            className="text-xs font-bold"
            style={{color: isPast ? '#6b7280' : '#ffffff'}}>
            {label}
          </Text>
        </View>
      </View>

      {/* 구분선 */}
      <View className="w-px bg-gray-100" />

      {/* 오른쪽: 대회 정보 */}
      <View className="flex-1 justify-center px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text
            className="flex-1 text-base font-bold text-gray-900"
            numberOfLines={1}>
            {race.name}
          </Text>
          {race.course ? (
            <View
              className="ml-2 rounded-full px-2 py-0.5"
              style={{backgroundColor: isPast ? '#f3f4f6' : '#ffedd5'}}>
              <Text
                className="text-xs font-semibold"
                style={{color: isPast ? '#9ca3af' : '#ea580c'}}>
                {race.course}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="mt-1.5 flex-row items-center gap-x-1">
          <MaterialIcons name="place" size={13} color="#9ca3af" />
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {race.location}
          </Text>
        </View>
        {race.organizer ? (
          <View className="mt-1 flex-row items-center gap-x-1">
            <MaterialIcons name="groups" size={13} color="#9ca3af" />
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {race.organizer}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function RaceListScreen() {
  const {user, setUser} = useUser();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (provider: SocialProvider) => {
    if (provider === 'naver') {
      const result: NaverLoginResponse = await NaverLogin.login();
      if (result.isSuccess && result.successResponse) {
        const token = result.successResponse.accessToken;
        const profile = await NaverLogin.getProfile(token);
        if (profile.message === 'success') {
          setUser({
            name: profile.response.name ?? '네이버 사용자',
            imageUrl: profile.response.profile_image ?? null,
          });
          setShowLoginSheet(false);
        }
      }
      return;
    }
    if (provider === 'kakao') {
      await kakaoLogin();
      const profile = await getKakaoMe();
      setUser({
        name: profile.nickname ?? '카카오 사용자',
        imageUrl: profile.profileImageUrl ?? null,
      });
      setShowLoginSheet(false);
      return;
    }
    if (provider === 'google') {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.type === 'success') {
        const {name, photo} = response.data.user;
        setUser({
          name: name ?? 'Google 사용자',
          imageUrl: photo ?? null,
        });
        setShowLoginSheet(false);
      }
    }
  };

  useEffect(() => {
    const month = `${selectedYear}${String(selectedMonth).padStart(2, '0')}`;
    setLoading(true);
    setError(null);
    setRaces([]);
    fetch(`${BASE_URL}/api/races?month=${month}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json() as Promise<{success: boolean; data: Race[]; message: string | null}>;
      })
      .then(json => {
        if (!json.success) {
          throw new Error(json.message ?? '서버 오류');
        }
        setRaces(json.data ?? []);
      })
      .catch(() => setError('대회 정보를 불러오지 못했어요'))
      .finally(() => setLoading(false));
  }, [selectedYear, selectedMonth]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header
        user={user}
        onPersonPress={() => setShowLoginSheet(true)}
        onSettingsPress={() => navigation.navigate('Settings')}
      />
      <LoginSheet
        visible={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        onLogin={handleLogin}
      />
      <AdSlider />
      <DdaySection />
      <YearMonthPicker
        year={selectedYear}
        month={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />
      <View className="mx-4 mb-2 h-px bg-gray-100" />
      <FlatList
        data={races}
        keyExtractor={item => item.id}
        renderItem={({item}) => <RaceCard race={item} />}
        contentContainerStyle={{paddingTop: 8, paddingBottom: 24}}
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#f97316" />
            </View>
          ) : error ? (
            <View className="items-center py-12">
              <Text className="text-4xl">⚠️</Text>
              <Text className="mt-3 text-base font-semibold text-gray-400">
                {error}
              </Text>
            </View>
          ) : (
            <View className="items-center py-10">
              <Text className="text-4xl">🗓️</Text>
              <Text className="mt-3 text-base font-semibold text-gray-400">
                이 달에는 대회가 없어요
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
