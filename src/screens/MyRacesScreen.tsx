import React from 'react';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function MyRacesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pb-3 pt-4">
        <Text className="text-2xl font-bold text-gray-900">내 대회</Text>
        <Text className="mt-1 text-sm text-gray-500">
          신청한 대회를 관리해요
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-5xl">🏅</Text>
        <Text className="mt-4 text-base font-semibold text-gray-700">
          신청한 대회가 없어요
        </Text>
        <Text className="mt-1 text-sm text-gray-400">
          대회 일정 탭에서 대회를 추가해보세요
        </Text>
      </View>
    </SafeAreaView>
  );
}
