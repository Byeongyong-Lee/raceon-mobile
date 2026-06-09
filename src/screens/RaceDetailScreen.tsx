import React from 'react';
import {Linking, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigator';
import {formatDate} from '../utils/race';

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

export default function RaceDetailScreen({route, navigation}: Props) {
  const {race} = route.params;

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 상단 요약 */}
        <View
          className="mb-4 px-6 py-6"
          style={{backgroundColor: '#fff7ed', marginHorizontal: 16, marginTop: 8, borderRadius: 20}}>
          {race.course ? (
            <View
              className="self-start rounded-full px-3 py-1"
              style={{backgroundColor: '#ffedd5'}}>
              <Text className="text-sm font-semibold" style={{color: '#ea580c'}}>
                {race.course}
              </Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}
