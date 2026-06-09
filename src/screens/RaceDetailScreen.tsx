import React, {useState} from 'react';
import {Linking, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Svg, {Path} from 'react-native-svg';
import {RootStackParamList} from '../navigation/RootNavigator';
import CourseBadges from '../components/CourseBadges';
import LoginSheet from '../components/LoginSheet';
import {useUser} from '../context/UserContext';
import {useLogin} from '../hooks/useLogin';
import {formatDate} from '../utils/race';

function KakaoMapIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3"
        fill="#3C1E1E"
      />
    </Svg>
  );
}

function NaverMapIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M1.6 0S0 0 0 1.6v20.8S0 24 1.6 24h20.8s1.6 0 1.6-1.6V1.6S24 0 22.4 0zm3.415 5.6h4.78l4.425 6.458V5.6h4.765v12.8h-4.78L9.78 11.943V18.4H5.015Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'RaceDetail'>;

function InfoRow({icon, label, value, onPress}: {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center px-4 py-3">
      <MaterialIcons name={icon} size={20} color="#9ca3af" style={{width: 28}} />
      <View className="flex-1">
        <Text className="text-xs text-gray-400">{label}</Text>
        <Text
          className="mt-0.5 text-sm text-gray-800"
          style={{color: onPress ? '#f97316' : '#1f2937'}}>
          {value}
        </Text>
      </View>
      {onPress && <MaterialIcons name="open-in-new" size={16} color="#f97316" />}
    </TouchableOpacity>
  );
}

function MapButtons({location}: {location: string}) {
  const query = encodeURIComponent(location);
  return (
    <View className="mx-4 mt-4">
      <Text className="mb-2 text-xs font-semibold text-gray-400">지도에서 보기</Text>
      <View className="flex-row" style={{gap: 10}}>
        <TouchableOpacity
          onPress={() => Linking.openURL(`kakaomap://search?q=${query}`).catch(() =>
            Linking.openURL(`https://map.kakao.com/?q=${query}`)
          )}
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center rounded-2xl py-3"
          style={{backgroundColor: '#FEE500'}}>
          <KakaoMapIcon />
          <Text className="ml-2 text-sm font-bold" style={{color: '#3C1E1E'}}>카카오맵</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL(`nmap://search?query=${query}&appname=com.raceonmobile`).catch(() =>
            Linking.openURL(`https://map.naver.com/v5/search/${query}`)
          )}
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center rounded-2xl py-3"
          style={{backgroundColor: '#03C75A'}}>
          <NaverMapIcon />
          <Text className="ml-2 text-sm font-bold text-white">네이버맵</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RaceDetailScreen({route, navigation}: Props) {
  const {race} = route.params;
  const {user} = useUser();
  const [myRaceAdded, setMyRaceAdded] = useState(false);
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const {handleLogin} = useLogin(() => setShowLoginSheet(false));

  const handleAddMyRace = () => {
    if (!user) {
      setShowLoginSheet(true);
      return;
    }
    setMyRaceAdded(prev => !prev);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-gray-900" numberOfLines={1}>
          대회 상세
        </Text>
      </View>

      <LoginSheet
        visible={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        onLogin={handleLogin}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 32}}>
        {/* 상단 요약 */}
        <View
          className="mb-4 px-6 py-6"
          style={{backgroundColor: '#fff7ed', marginHorizontal: 16, marginTop: 8, borderRadius: 20}}>
          {race.course ? (
            <View className="mt-2">
              <CourseBadges course={race.course} />
            </View>
          ) : null}
          <Text className="mt-3 text-xl font-black text-gray-900">{race.name}</Text>
          <Text className="mt-1 text-base text-gray-500">{formatDate(race.raceDate)}</Text>
        </View>

        {/* 상세 정보 */}
        <View className="mx-4 overflow-hidden rounded-2xl bg-white"
          style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: {width: 0, height: 1}}}>
          <InfoRow icon="place" label="장소" value={race.location} />
          {race.organizer ? (
            <>
              <View className="mx-4 h-px bg-gray-100" />
              <InfoRow icon="groups" label="주최" value={race.organizer} />
            </>
          ) : null}
          {race.phone ? (
            <>
              <View className="mx-4 h-px bg-gray-100" />
              <InfoRow
                icon="phone"
                label="문의"
                value={race.phone}
                onPress={() => Linking.openURL(`tel:${race.phone}`)}
              />
            </>
          ) : null}
          {race.homepage ? (
            <>
              <View className="mx-4 h-px bg-gray-100" />
              <InfoRow
                icon="language"
                label="홈페이지"
                value={race.homepage}
                onPress={() => Linking.openURL(race.homepage)}
              />
            </>
          ) : null}
        </View>

        {/* 지도 버튼 */}
        <MapButtons location={race.location} />

        {/* 내 대회 추가 버튼 */}
        <TouchableOpacity
          onPress={handleAddMyRace}
          activeOpacity={0.85}
          className="mx-4 mt-4 flex-row items-center justify-center rounded-2xl py-4"
          style={{backgroundColor: myRaceAdded ? '#f3f4f6' : '#f97316'}}>
          <MaterialIcons
            name={myRaceAdded ? 'check-circle' : 'add-circle-outline'}
            size={20}
            color={myRaceAdded ? '#9ca3af' : '#ffffff'}
          />
          <Text
            className="ml-2 text-base font-bold"
            style={{color: myRaceAdded ? '#9ca3af' : '#ffffff'}}>
            {myRaceAdded ? '내 대회에 추가됨' : '내 대회에 추가'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
