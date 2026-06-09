import React from 'react';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function CalendarScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pb-3 pt-4">
        <Text className="text-2xl font-bold text-gray-900">캘린더</Text>
        <Text className="mt-1 text-sm text-gray-500">
          대회 일정을 달력으로 확인해요
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="mt-4 text-base font-semibold text-gray-400">
          준비 중이에요
        </Text>
      </View>
    </SafeAreaView>
  );
}
