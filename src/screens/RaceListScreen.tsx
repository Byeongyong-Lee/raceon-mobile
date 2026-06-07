import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const AD_WIDTH = SCREEN_WIDTH - 32;
const MONTH_ITEM_W = Math.floor(SCREEN_WIDTH / 5);
const MONTH_SIDE_PAD = Math.floor((SCREEN_WIDTH - MONTH_ITEM_W) / 2);
4
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

function Header({user, onPress}: {user: User | null; onPress: () => void}) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
      <View className="flex-row items-center">
        <Text className="text-2xl font-black text-orange-500">Race</Text>
        <Text className="text-2xl font-black text-gray-900">On</Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center gap-x-2"
        activeOpacity={0.7}>
        {user ? (
          <>
            {user.imageUrl ? (
              <Image source={{uri: user.imageUrl}} className="h-9 w-9 rounded-full" />
            ) : (
              <View className="h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                <Text className="text-base font-bold text-orange-500">{user.name[0]}</Text>
              </View>
            )}
            <Text className="text-sm font-semibold text-gray-800">{user.name}</Text>
          </>
        ) : (
          <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <MaterialIcons name="person" size={24} color="#6b7280" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

function AdSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % ADS.length;
        scrollRef.current?.scrollTo({x: next * AD_WIDTH, animated: true});
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="mx-4 mb-3 overflow-hidden rounded-2xl" style={{height: 140}}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={e =>
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / AD_WIDTH))
        }>
        {ADS.map(ad => (
          <View
            key={ad.id}
            style={{width: AD_WIDTH, backgroundColor: ad.bgColor}}
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
  const [user, setUser] = useState<User | null>(null);
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        onPress={() => setUser(prev => (prev ? null : DUMMY_USER))}
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
