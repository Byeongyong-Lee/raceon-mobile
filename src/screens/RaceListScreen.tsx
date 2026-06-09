import React, {useEffect, useState} from 'react';
import NaverLogin, {NaverLoginResponse} from '@react-native-seoul/naver-login';
import {login as kakaoLogin, me as getKakaoMe} from '@react-native-kakao/user';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Config from 'react-native-config';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useUser} from '../context/UserContext';
import {RootStackParamList} from '../navigation/RootNavigator';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import AdSlider from '../components/AdSlider';
import LoginSheet from '../components/LoginSheet';
import RaceCard from '../components/RaceCard';
import YearMonthPicker from '../components/YearMonthPicker';
import {Race, SocialProvider} from '../types';
import {formatDate, getDdayLabel} from '../utils/race';

const BASE_URL = Config.API_BASE_URL ?? 'http://localhost:18300';

type User = {name: string; imageUrl: string | null};
type MyRace = {id: string; name: string; raceDate: string};

GoogleSignin.configure({
  webClientId: Config.GOOGLE_WEB_CLIENT_ID,
});

NaverLogin.initialize({
  appName: 'RaceOn',
  consumerKey: Config.NAVER_CLIENT_ID!,
  consumerSecret: Config.NAVER_CLIENT_SECRET!,
  serviceUrlSchemeIOS: 'com.raceonmobile',
});

// 신청한 대회 더미 데이터 (추후 API 연동)
const MY_RACES: MyRace[] = [
  {id: '4', name: '춘천마라톤', raceDate: '2026-10-25'},
  {id: '5', name: '부산마라톤', raceDate: '2026-11-08'},
];

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
            <Image source={{uri: user.imageUrl}} className="h-9 w-9 rounded-full" />
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

function DdaySection({
  isLoggedIn,
  onLoginPress,
}: {
  isLoggedIn: boolean;
  onLoginPress: () => void;
}) {
  return (
    <View className="mb-3">
      <Text className="mb-2 px-4 text-sm font-bold text-gray-700">내 대회 D-day</Text>
      {!isLoggedIn ? (
        <View style={{marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12}}>
          <Text style={{fontSize: 13, color: '#9ca3af'}}>로그인이 필요한 내용이에요</Text>
          <TouchableOpacity
            onPress={onLoginPress}
            activeOpacity={0.8}
            style={{backgroundColor: '#f97316', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6}}>
            <Text style={{fontSize: 12, fontWeight: '700', color: 'white'}}>로그인</Text>
          </TouchableOpacity>
        </View>
      ) : MY_RACES.length === 0 ? (
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
                <Text className="mt-0.5 text-sm font-semibold text-gray-800" numberOfLines={1}>
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
    try {
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
    } catch (e) {
      console.error(`[Login] ${provider} 로그인 실패:`, e);
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
      <DdaySection
        isLoggedIn={!!user}
        onLoginPress={() => setShowLoginSheet(true)}
      />
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
              <Text className="mt-3 text-base font-semibold text-gray-400">{error}</Text>
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
