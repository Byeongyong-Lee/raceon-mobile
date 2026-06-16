import React, {useState} from 'react';
import {
  Alert,
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
import {launchImageLibrary} from 'react-native-image-picker';
import {useGroups} from '../context/GroupContext';
import {useAreas} from '../context/AreaContext';
import {toShortLabel} from '../constants/regions';
import GroupDetailScreen from './GroupDetailScreen';

export default function CommunityScreen() {
  const {myGroups, myGroupsLoading, createGroup} = useGroups();
  const {sidoList} = useAreas();

  const joinedGroups = myGroups.filter(g => g.status === 'joined');
  const pendingGroups = myGroups.filter(g => g.status === 'pending');

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const selectedGroup = selectedGroupId ? myGroups.find(g => g.id === selectedGroupId) ?? null : null;

  // 모임 만들기
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [newMaxMembers, setNewMaxMembers] = useState('');
  const [newMaxOperators, setNewMaxOperators] = useState('');
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tagDuplicateError, setTagDuplicateError] = useState(false);

  const membersNum = Number(newMaxMembers);
  const maxOperatorLimit = newMaxMembers ? Math.floor(membersNum * 0.2) : 0;
  const membersValid = !!newMaxMembers && membersNum >= 2 && membersNum <= 1000;
  const operatorOver = newMaxOperators !== '' && Number(newMaxOperators) > maxOperatorLimit;

  // 필드별 에러 (submitted 이후에만 표시)
  const nameError = submitted && newName.trim().length < 2
    ? (newName.trim().length === 0 ? '모임 이름을 입력해 주세요' : '2자 이상 입력해 주세요')
    : null;
  const regionError = submitted && !newRegion ? '지역을 선택해 주세요' : null;
  const membersError = submitted && !membersValid
    ? (!newMaxMembers ? '최대 인원을 입력해 주세요' : '2~1000명 사이로 입력해 주세요')
    : (!submitted && newMaxMembers && !membersValid ? '2~1000명 사이로 입력해 주세요' : null);
  const operatorsError = operatorOver
    ? `최대 ${maxOperatorLimit}명 (인원의 20%)까지 가능해요`
    : (submitted && membersValid && newMaxOperators === '' ? '운영진 수를 입력해 주세요' : null);

  const canCreate =
    newName.trim().length >= 2 &&
    newRegion &&
    membersValid &&
    newMaxOperators !== '' &&
    !operatorOver;

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (newTags.includes(t)) {
      setTagDuplicateError(true);
      return;
    }
    if (newTags.length >= 5) return;
    setNewTags(prev => [...prev, t]);
    setTagInput('');
    setTagDuplicateError(false);
  };

  const resetCreateForm = () => {
    setNewName('');
    setNewDesc('');
    setNewRegion('');
    setNewTags([]);
    setTagInput('');
    setNewMaxMembers('');
    setNewMaxOperators('');
    setNewImageUri(null);
    setSubmitted(false);
    setTagDuplicateError(false);
  };

  const handlePickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    setNewImageUri(result.assets[0].uri);
  };

  const handleCreate = async () => {
    setSubmitted(true);
    if (!canCreate || creating) return;
    setCreating(true);
    try {
      await createGroup({
        name: newName.trim(),
        description: newDesc.trim(),
        region: newRegion,
        tags: newTags,
        maxMembers: Number(newMaxMembers),
        maxOperators: Number(newMaxOperators),
        imageUri: newImageUri ?? undefined,
      });
      resetCreateForm();
      setShowCreateModal(false);
    } catch {
      Alert.alert('오류', '모임 만들기에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setCreating(false);
    }
  };


  // 모임 상세 화면
  if (selectedGroup) {
    return (
      <GroupDetailScreen
        groupName={selectedGroup.name}
        isLeader={selectedGroup.isLeader}
        onBack={() => setSelectedGroupId(null)}
      />
    );
  }

  const isEmpty = joinedGroups.length === 0 && pendingGroups.length === 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="px-4 pb-3 pt-4">
        <Text className="text-2xl font-bold text-gray-900">내 모임</Text>
        <Text className="mt-1 text-sm text-gray-500">러너들과 함께 달려요</Text>
      </View>

      {myGroupsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : isEmpty ? (
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="groups" size={56} color="#d1d5db" />
          <Text className="mt-4 text-base font-semibold text-gray-400">
            참가한 모임이 없어요
          </Text>
          <Text className="mt-1 text-sm text-gray-400">
            모임 만들기로 시작해보세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => ''}
          renderItem={null}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 24}}
          ListHeaderComponent={
            <>
              {/* 참여 대기중 섹션 */}
              {pendingGroups.length > 0 && (
                <>
                  <Text className="mb-2 text-xs font-semibold text-gray-400">
                    참여 대기중 {pendingGroups.length}개
                  </Text>
                  {pendingGroups.map(item => (
                    <View
                      key={item.id}
                      className="mb-3 flex-row items-center overflow-hidden rounded-2xl bg-white px-4 py-4"
                      style={{
                        opacity: 0.7,
                        elevation: 1,
                        shadowColor: '#000',
                        shadowOpacity: 0.04,
                        shadowRadius: 4,
                        shadowOffset: {width: 0, height: 1},
                      }}>
                      {item.imageUri ? (
                        <Image
                          source={{uri: item.imageUri}}
                          style={{width: 48, height: 48, borderRadius: 10, marginRight: 16}}
                        />
                      ) : (
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            backgroundColor: item.color + '15',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 16,
                          }}>
                          <MaterialIcons name="groups" size={26} color={item.color} />
                        </View>
                      )}
                      <View className="flex-1">
                        <View className="flex-row items-center" style={{gap: 6}}>
                          <Text className="flex-1 text-base font-bold text-gray-700" numberOfLines={1}>
                            {item.name}
                          </Text>
                          <View className="rounded-full bg-gray-100 px-2 py-0.5">
                            <Text className="text-xs font-bold text-gray-500">대기중</Text>
                          </View>
                        </View>
                        <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
                          {item.description}
                        </Text>
                        <Text className="mt-1 text-xs text-gray-300">
                          승인 후 모임에 참여할 수 있어요
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}

              {/* 참여 중 섹션 */}
              {joinedGroups.length > 0 && (
                <Text className="mb-2 text-xs font-semibold text-gray-400"
                  style={{marginTop: pendingGroups.length > 0 ? 8 : 0}}>
                  참여 중 {joinedGroups.length}개
                </Text>
              )}
              {joinedGroups.map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedGroupId(item.id)}
                  activeOpacity={0.75}
                  className="mb-3 flex-row items-center overflow-hidden rounded-2xl bg-white px-4 py-4"
                  style={{
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    shadowOffset: {width: 0, height: 2},
                  }}>
                  {item.imageUri ? (
                    <Image
                      source={{uri: item.imageUri}}
                      style={{width: 48, height: 48, borderRadius: 10, marginRight: 16}}
                    />
                  ) : (
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        backgroundColor: item.color + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                      }}>
                      <MaterialIcons name="groups" size={26} color={item.color} />
                    </View>
                  )}
                  <View className="flex-1">
                    <View className="flex-row items-center" style={{gap: 6}}>
                      <Text className="flex-1 text-base font-bold text-gray-900" numberOfLines={1}>
                        {item.name}
                      </Text>
                      {item.role === 'OWNER' && (
                        <View className="rounded-full bg-orange-100 px-2 py-0.5">
                          <Text className="text-xs font-bold text-orange-500">모임장</Text>
                        </View>
                      )}
                      {item.role === 'MANAGER' && (
                        <View className="rounded-full bg-blue-100 px-2 py-0.5">
                          <Text className="text-xs font-bold text-blue-500">운영진</Text>
                        </View>
                      )}
                      {item.role === 'MEMBER' && (
                        <View className="rounded-full bg-gray-100 px-2 py-0.5">
                          <Text className="text-xs font-bold text-gray-500">회원</Text>
                        </View>
                      )}
                    </View>
                    <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
                      {item.description}
                    </Text>
                    <View className="mt-1 flex-row items-center" style={{gap: 8}}>
                      <View className="flex-row items-center" style={{gap: 2}}>
                        <MaterialIcons name="person" size={12} color="#9ca3af" />
                        <Text className="text-xs text-gray-400">{item.memberCount}명</Text>
                      </View>
                      <Text className="text-xs text-gray-300">·</Text>
                      <Text className="text-xs text-gray-400">{item.lastActivity}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
                </TouchableOpacity>
              ))}
            </>
          }
        />
      )}

      {/* 모임 만들기 모달 */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowCreateModal(false); resetCreateForm(); }}>
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
          {/* 헤더 */}
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <TouchableOpacity onPress={() => { setShowCreateModal(false); resetCreateForm(); }}>
              <Text className="text-base text-gray-500">취소</Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-gray-900">모임 만들기</Text>
            <TouchableOpacity onPress={handleCreate} disabled={creating}>
              {creating ? (
                <ActivityIndicator size="small" color="#f97316" />
              ) : (
                <Text className="text-base font-bold" style={{color: canCreate ? '#f97316' : '#fed7aa'}}>
                  만들기
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1">
            <ScrollView
              contentContainerStyle={{padding: 20, paddingBottom: 40}}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">

              {/* 프로필 이미지 */}
              <View className="mb-5 items-center">
                <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
                  {newImageUri ? (
                    <View>
                      <Image
                        source={{uri: newImageUri}}
                        style={{width: 88, height: 88, borderRadius: 20}}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: '#f97316',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: '#fff',
                        }}>
                        <MaterialIcons name="edit" size={13} color="#fff" />
                      </View>
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: 20,
                        backgroundColor: '#f3f4f6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: '#e5e7eb',
                        borderStyle: 'dashed',
                      }}>
                      <MaterialIcons name="add-a-photo" size={28} color="#9ca3af" />
                      <Text className="mt-1 text-xs text-gray-400">사진 추가</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* 모임 이름 */}
              <Text className="mb-1 text-sm font-semibold text-gray-700">
                모임 이름 <Text className="text-orange-500">*</Text>
              </Text>
              <View className="mb-4">
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="예) 한강 러닝 크루"
                  placeholderTextColor="#9ca3af"
                  className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                  style={{borderWidth: 1, borderColor: nameError ? '#ef4444' : '#e5e7eb'}}
                  maxLength={30}
                />
                {nameError && <Text className="mt-1 text-xs text-red-400">{nameError}</Text>}
              </View>

              {/* 소개 */}
              <Text className="mb-1 text-sm font-semibold text-gray-700">소개 (선택)</Text>
              <TextInput
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="모임을 간단히 소개해 주세요"
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                style={{borderWidth: 1, borderColor: '#e5e7eb', height: 72}}
                maxLength={100}
              />

              {/* 지역 */}
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                지역 <Text className="text-orange-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap" style={{gap: 8}}>
                {sidoList.map(area => {
                  const r = toShortLabel(area.areaName);
                  const active = newRegion === r;
                  return (
                    <TouchableOpacity
                      key={area.areaCode}
                      onPress={() => setNewRegion(r)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: active ? '#f97316' : '#e5e7eb',
                        backgroundColor: active ? '#fff7ed' : '#f9fafb',
                      }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: active ? '#ea580c' : '#6b7280',
                        }}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {regionError && <Text className="mt-1 text-xs text-red-400">{regionError}</Text>}
              <View className="mb-4" />

              {/* 태그 */}
              <Text className="mb-1 text-sm font-semibold text-gray-700">
                태그 (선택, 최대 5개)
              </Text>
              <View className="mb-2 flex-row items-center" style={{gap: 8}}>
                <TextInput
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  placeholder="예) 새벽, 초보환영"
                  placeholderTextColor="#9ca3af"
                  returnKeyType="done"
                  className="flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                  style={{borderWidth: 1, borderColor: '#e5e7eb'}}
                  maxLength={10}
                />
                <TouchableOpacity
                  onPress={addTag}
                  className="h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
                  <MaterialIcons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              {tagDuplicateError && <Text className="mt-1 text-xs text-red-400">이미 추가된 태그예요</Text>}
              {newTags.length > 0 && (
                <View className="mt-2 mb-4 flex-row flex-wrap" style={{gap: 6}}>
                  {newTags.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => setNewTags(prev => prev.filter(t => t !== tag))}
                      className="flex-row items-center rounded-full bg-orange-50 px-3 py-1"
                      style={{gap: 4}}>
                      <Text className="text-xs font-semibold text-orange-500">#{tag}</Text>
                      <MaterialIcons name="close" size={12} color="#f97316" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!newTags.length && <View className="mb-4" />}

              {/* 최대 인원 + 운영진 */}
              <View className="flex-row" style={{gap: 12}}>
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-semibold text-gray-700">
                    최대 인원 <Text className="text-orange-500">*</Text>
                  </Text>
                  <View className="flex-row items-center" style={{gap: 6}}>
                    <TextInput
                      value={newMaxMembers}
                      onChangeText={v => {
                        const cleaned = v.replace(/[^0-9]/g, '');
                        setNewMaxMembers(cleaned);
                        const num = Number(cleaned);
                        const limit = Math.floor(num * 0.2);
                        if (cleaned && num >= 2 && num <= 1000 && limit === 0) {
                          setNewMaxOperators('0');
                        } else {
                          setNewMaxOperators('');
                        }
                      }}
                      placeholder="최대 1000"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={4}
                      className="flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      style={{borderWidth: 1, borderColor: membersError ? '#ef4444' : '#e5e7eb'}}
                    />
                    <Text className="text-sm text-gray-500">명</Text>
                  </View>
                  {membersError && (
                    <Text className="mt-1 text-xs text-red-400">{membersError}</Text>
                  )}
                </View>

                <View className="flex-1">
                  <Text className="mb-1 text-sm font-semibold text-gray-700">
                    운영진 <Text className="text-orange-500">*</Text>
                  </Text>
                  <View className="flex-row items-center" style={{gap: 6}}>
                    <TextInput
                      value={newMaxOperators}
                      onChangeText={v => setNewMaxOperators(v.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={3}
                      editable={membersValid && maxOperatorLimit > 0}
                      className="flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      style={{
                        borderWidth: 1,
                        borderColor: operatorsError ? '#ef4444' : '#e5e7eb',
                        opacity: !membersValid ? 0.5 : 1,
                      }}
                    />
                    <Text className="text-sm text-gray-500">명</Text>
                  </View>
                  {membersValid && (
                    <Text className={`mt-1 text-xs ${operatorOver ? 'text-red-400' : operatorsError ? 'text-red-400' : 'text-gray-400'}`}>
                      {operatorsError ?? `최대 ${maxOperatorLimit}명 (인원의 20%)`}
                    </Text>
                  )}
                </View>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* 모임 만들기 FAB */}
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-orange-500"
        style={{elevation: 4, shadowColor: '#f97316', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width: 0, height: 4}}}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}
