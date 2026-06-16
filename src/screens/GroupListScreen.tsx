import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Group, GroupStatus, useGroups} from '../context/GroupContext';
import {useUser} from '../context/UserContext';
import {useLogin} from '../hooks/useLogin';
import LoginSheet from '../components/LoginSheet';
import {useAreas} from '../context/AreaContext';
import {labelToAreaCode, toShortLabel} from '../constants/regions';

// ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<GroupStatus, {label: string; color: string; bg: string}> = {
  joined:  {label: '참여 중',    color: '#f97316', bg: '#fff7ed'},
  pending: {label: '참여 대기중', color: '#6b7280', bg: '#f3f4f6'},
  none:    {label: '',           color: '',         bg: ''},
};

// ─── 모임 소개 모달 ───────────────────────────────────────
function GroupIntroModal({
  group,
  onClose,
  onApply,
}: {
  group: Group;
  onClose: () => void;
  onApply: () => void;
}) {
  const cfg = STATUS_CONFIG[group.status];

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
        {/* 헤더 */}
        <View
          className="flex-row items-center justify-between px-4 py-3"
          style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
          <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <MaterialIcons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-gray-900">모임 소개</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView
          contentContainerStyle={{padding: 24, paddingBottom: 100}}
          showsVerticalScrollIndicator={false}>
          {/* 모임 아이콘 + 이름 */}
          <View>
            {group.imageUri ? (
              <Image
                source={{uri: group.imageUri}}
                style={{marginHorizontal: 12, marginTop: 8, height: 160, borderRadius: 14}}
              />
            ) : (
              <View
                style={{
                  marginHorizontal: 12,
                  marginTop: 8,
                  height: 160,
                  borderRadius: 14,
                  backgroundColor: group.color + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MaterialIcons name="groups" size={52} color={group.color} />
              </View>
            )}
            <Text className="mt-3 text-center text-xl font-black text-gray-900">{group.name}</Text>
            <View className="mt-1 flex-row items-center" style={{gap: 6}}>
              <MaterialIcons name="person" size={14} color="#9ca3af" />
              <Text className="text-sm text-gray-400">
                {group.memberCount}
                <Text className="text-gray-300"> / {group.maxMembers >= 999999 ? '무제한' : `${group.maxMembers}명`}</Text>
              </Text>
              {group.status !== 'none' && (
                <View
                  className="rounded-full px-3 py-1"
                  style={{backgroundColor: cfg.bg}}>
                  <Text className="text-xs font-bold" style={{color: cfg.color}}>
                    {cfg.label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* 지역 + 태그 */}
          <View className="mt-5 flex-row flex-wrap" style={{gap: 6}}>
            <View className="flex-row items-center rounded-full bg-blue-50 px-3 py-1" style={{gap: 3}}>
              <MaterialIcons name="place" size={12} color="#3b82f6" />
              <Text className="text-xs font-semibold text-blue-500">{group.region}</Text>
            </View>
            {group.tags.map(tag => (
              <View key={tag} className="rounded-full px-2 py-0.5" style={{backgroundColor: '#ffedd5'}}>
                <Text className="text-xs font-semibold" style={{color: '#ea580c'}}>#{tag}</Text>
              </View>
            ))}
          </View>

          {/* 소개 본문 */}
          <View className="mt-6">
            <Text className="mb-3 text-sm font-bold text-gray-700">모임 소개</Text>
            <Text className="text-sm leading-6 text-gray-600">{group.intro}</Text>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-4 pb-6 pt-3"
          style={{borderTopWidth: 1, borderTopColor: '#f3f4f6'}}>
          {group.status === 'none' ? (
            <TouchableOpacity
              onPress={onApply}
              className="items-center rounded-2xl bg-orange-500 py-4">
              <Text className="text-base font-bold text-white">신청하기</Text>
            </TouchableOpacity>
          ) : group.status === 'pending' ? (
            <View className="items-center rounded-2xl bg-gray-100 py-4">
              <Text className="text-base font-bold text-gray-400">참여 대기중</Text>
            </View>
          ) : (
            <View className="items-center rounded-2xl bg-orange-50 py-4">
              <Text className="text-base font-bold text-orange-400">이미 참여 중인 모임이에요</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── 신청 폼 모달 ─────────────────────────────────────────
function ApplicationModal({
  groupName,
  onClose,
  onSubmit,
}: {
  groupName: string;
  onClose: () => void;
  onSubmit: (message: string) => void;
}) {
  const [message, setMessage] = useState('');

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
        {/* 헤더 */}
        <View
          className="flex-row items-center justify-between px-4 py-3"
          style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
          <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <MaterialIcons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-gray-900">{groupName} 가입 신청</Text>
          <View style={{width: 24}} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <ScrollView
            contentContainerStyle={{padding: 24, paddingBottom: 120}}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <Text className="mb-2 text-sm font-semibold text-gray-700">가입 메시지</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="자신을 간단히 소개해 주세요 (선택)"
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              maxLength={200}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 12,
                backgroundColor: '#f9fafb',
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 14,
                color: '#111827',
                height: 120,
                paddingTop: 12,
              }}
            />
            <Text className="mt-1 text-right text-xs text-gray-300">{message.length}/200</Text>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* 신청 버튼 */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-4 pb-6 pt-3"
          style={{borderTopWidth: 1, borderTopColor: '#f3f4f6'}}>
          <TouchableOpacity
            onPress={() => onSubmit(message)}
            className="items-center rounded-2xl bg-orange-500 py-4">
            <Text className="text-base font-bold text-white">신청</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── 메인 화면 ────────────────────────────────────────────
export default function GroupListScreen() {
  const {groups, groupsLoading, applyGroup, searchGroups} = useGroups();
  const {user} = useUser();
  const {sidoList} = useAreas();
  const [query, setQuery] = useState('');

  const [introTarget, setIntroTarget] = useState<Group | null>(null);
  const [applyTarget, setApplyTarget] = useState<Group | null>(null);
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');

  const REGIONS = ['전체', ...sidoList.map(a => toShortLabel(a.areaName))];

  const {handleLogin} = useLogin(() => setShowLoginSheet(false));

  // 검색어 · 지역 변경 시 API 재요청 (keyword debounce 400ms)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const areaCode =
      selectedRegion !== '전체' ? labelToAreaCode(selectedRegion) : undefined;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.trim()) {
      debounceTimer.current = setTimeout(() => {
        searchGroups({keyword: query.trim(), areaCode});
      }, 400);
    } else {
      searchGroups({areaCode});
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedRegion]);

  // context의 groups가 바뀌면 열린 소개 모달도 동기화
  const syncedIntroTarget = introTarget
    ? (groups.find(g => g.id === introTarget.id) ?? null)
    : null;

  const handleApplyPress = (group: Group) => {
    if (!user) {
      setShowLoginSheet(true);
      return;
    }
    setApplyTarget(group);
  };

  const handleSubmit = async (message: string) => {
    if (!applyTarget) return;
    try {
      await applyGroup(applyTarget.id, message.trim() || undefined);
    } catch {
      // 에러는 context에서 롤백 처리
    }
    setApplyTarget(null);
    setIntroTarget(null);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="px-4 pb-3 pt-4">
        <Text className="text-2xl font-bold text-gray-900">모임 목록</Text>
        <Text className="mt-1 text-sm text-gray-500">관심 있는 모임을 찾아보세요</Text>
      </View>

      {/* 검색 */}
      <View className="px-4 pb-2">
        <View
          className="flex-row items-center rounded-2xl bg-white px-4"
          style={{
            gap: 8,
            elevation: 1,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            shadowOffset: {width: 0, height: 1},
          }}>
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="모임 이름, 태그로 검색"
            placeholderTextColor="#9ca3af"
            className="flex-1 py-3 text-sm text-gray-900"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <MaterialIcons name="cancel" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 지역 필터 칩 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 16, paddingVertical: 8, gap: 8}}
        style={{flexGrow: 0, flexShrink: 0}}>
        {REGIONS.map(region => {
          const active = selectedRegion === region;
          return (
            <TouchableOpacity
              key={region}
              onPress={() => setSelectedRegion(region)}
              style={{
                flexShrink: 0,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? '#f97316' : '#fff',
                borderWidth: 1,
                borderColor: active ? '#f97316' : '#e5e7eb',
                elevation: 1,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 4,
                shadowOffset: {width: 0, height: 1},
              }}>
              <Text style={{fontSize: 12, fontWeight: '600', color: active ? '#fff' : '#6b7280'}}>
                {region}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 목록 */}
      {groupsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : <FlatList
        data={groups}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 24}}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          groups.length > 0 ? (
            <Text className="mb-3 text-xs font-semibold text-gray-400">
              모임 {groups.length}개
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <MaterialIcons name="search-off" size={52} color="#d1d5db" />
            <Text className="mt-3 text-sm font-semibold text-gray-400">
              검색 결과가 없어요
            </Text>
          </View>
        }
        renderItem={({item}) => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIntroTarget(item)}
              className="mb-3 overflow-hidden rounded-2xl bg-white"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: {width: 0, height: 2},
              }}>
              <View className="px-4 pt-4">
                {/* 프로필 + 이름 */}
                <View className="flex-row items-center" style={{gap: 12}}>
                  {item.imageUri ? (
                    <Image
                      source={{uri: item.imageUri}}
                      style={{width: 44, height: 44, borderRadius: 10}}
                    />
                  ) : (
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: item.color + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <MaterialIcons name="groups" size={24} color={item.color} />
                    </View>
                  )}
                  <View className="flex-1">
                    <View className="flex-row items-center" style={{gap: 6}}>
                      <Text className="flex-1 text-base font-bold text-gray-900" numberOfLines={1}>
                        {item.name}
                      </Text>
                      {item.status !== 'none' && (
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{backgroundColor: cfg.bg}}>
                          <Text className="text-xs font-bold" style={{color: cfg.color}}>
                            {cfg.label}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="mt-0.5 flex-row items-center" style={{gap: 4}}>
                      <MaterialIcons name="person" size={12} color="#9ca3af" />
                      <Text className="text-xs text-gray-400">
                        {item.memberCount}
                        <Text className="text-gray-300"> / {item.maxMembers >= 999999 ? '무제한' : `${item.maxMembers}명`}</Text>
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
                </View>

                {/* 설명 */}
                <Text className="mt-3 text-xs leading-5 text-gray-500" numberOfLines={2}>
                  {item.description}
                </Text>

                {/* 태그 + 지역 */}
                <View className="mb-4 mt-2 flex-row flex-wrap items-center" style={{gap: 6}}>
                  <View className="flex-row items-center rounded-full bg-blue-50 px-3 py-1.5" style={{gap: 3}}>
                    <MaterialIcons name="place" size={11} color="#3b82f6" />
                    <Text className="text-xs font-semibold text-blue-500">{item.region}</Text>
                  </View>
                  {item.tags.map(tag => (
                    <View key={tag} className="rounded-full px-2 py-0.5" style={{backgroundColor: '#ffedd5'}}>
                      <Text className="text-xs font-semibold" style={{color: '#ea580c'}}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />}

      {/* 모임 소개 모달 */}
      {syncedIntroTarget && (
        <GroupIntroModal
          group={syncedIntroTarget}
          onClose={() => setIntroTarget(null)}
          onApply={() => handleApplyPress(syncedIntroTarget)}
        />
      )}

      {/* 신청 폼 모달 */}
      {applyTarget && (
        <ApplicationModal
          groupName={applyTarget.name}
          onClose={() => setApplyTarget(null)}
          onSubmit={handleSubmit}
        />
      )}

      {/* 로그인 시트 */}
      <LoginSheet
        visible={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        onLogin={handleLogin}
      />
    </SafeAreaView>
  );
}
