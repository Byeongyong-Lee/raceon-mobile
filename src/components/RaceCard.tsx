import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Race} from '../types';
import {getDdayLabel, getDay} from '../utils/race';

export default function RaceCard({race}: {race: Race}) {
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
