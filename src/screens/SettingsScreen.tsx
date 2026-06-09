import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type Props = {
  user: {name: string; imageUrl: string | null} | null;
  onLogout: () => void;
  onBack: () => void;
};

function SettingsRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center bg-white px-4 py-4"
      style={{gap: 12}}>
      <MaterialIcons
        name={icon}
        size={20}
        color={danger ? '#ef4444' : '#6b7280'}
      />
      <Text
        className="flex-1 text-base"
        style={{color: danger ? '#ef4444' : '#111827'}}>
        {label}
      </Text>
      {!danger && (
        <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({title}: {title: string}) {
  return (
    <Text className="px-4 pb-2 pt-5 text-xs font-semibold uppercase tracking-widest text-gray-400">
      {title}
    </Text>
  );
}

export default function SettingsScreen({user, onLogout, onBack}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 text-lg font-bold text-gray-900">설정</Text>
      </View>

      {/* 프로필 */}
      <View className="mb-2 items-center bg-white py-6">
        {user?.imageUrl ? (
          <Image
            source={{uri: user.imageUrl}}
            style={{width: 72, height: 72, borderRadius: 36}}
          />
        ) : (
          <View
            className="items-center justify-center rounded-full bg-gray-100"
            style={{width: 72, height: 72}}>
            <MaterialIcons name="person" size={40} color="#9ca3af" />
          </View>
        )}
        <Text className="mt-3 text-base font-bold text-gray-900">
          {user?.name ?? '로그인이 필요해요'}
        </Text>
      </View>

      {/* 계정 섹션 */}
      <SectionHeader title="계정" />
      <View className="overflow-hidden rounded-2xl mx-4" style={{gap: 1}}>
        <SettingsRow
          icon="logout"
          label="로그아웃"
          onPress={onLogout}
          danger
        />
      </View>

      {/* 앱 정보 섹션 */}
      <SectionHeader title="앱 정보" />
      <View className="overflow-hidden rounded-2xl mx-4" style={{gap: 1}}>
        <SettingsRow
          icon="info-outline"
          label="버전 정보"
          onPress={() => {}}
        />
        <View className="h-px bg-gray-100" />
        <SettingsRow
          icon="description"
          label="오픈소스 라이선스"
          onPress={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}
