import React, {useState} from 'react';
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import GroupDetailScreen from './GroupDetailScreen';

type Group = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isLeader: boolean;
  lastActivity: string;
  color: string;
};

const MOCK_GROUPS: Group[] = [
  {
    id: '1',
    name: '한강 러닝 크루',
    description: '매주 일요일 한강에서 함께 달려요',
    memberCount: 12,
    isLeader: true,
    lastActivity: '방금 전',
    color: '#f97316',
  },
  {
    id: '2',
    name: '마라톤 입문자 모임',
    description: '처음 마라톤에 도전하는 분들 환영해요',
    memberCount: 8,
    isLeader: false,
    lastActivity: '1시간 전',
    color: '#3b82f6',
  },
];

const GROUP_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

export default function CommunityScreen() {
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // 모임 만들기
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // 코드로 참가
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const color = GROUP_COLORS[groups.length % GROUP_COLORS.length];
    setGroups(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: newName.trim(),
        description: newDesc.trim(),
        memberCount: 1,
        isLeader: true,
        lastActivity: '방금 전',
        color,
      },
    ]);
    setNewName('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    // TODO: 서버 연동 후 코드 검증
    setJoinCode('');
    setShowJoinModal(false);
  };

  // 모임 상세 화면
  if (selectedGroup) {
    return (
      <GroupDetailScreen
        groupName={selectedGroup.name}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="px-4 pb-3 pt-4">
        <Text className="text-2xl font-bold text-gray-900">내 모임</Text>
        <Text className="mt-1 text-sm text-gray-500">러너들과 함께 달려요</Text>
      </View>

      {/* 액션 버튼 */}
      <View style={{flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 10}}>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f97316',
            borderRadius: 12,
            paddingVertical: 12,
            gap: 6,
          }}>
          <MaterialIcons name="add" size={18} color="#fff" />
          <Text style={{fontSize: 14, fontWeight: 'bold', color: '#fff'}}>모임 만들기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowJoinModal(true)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            borderRadius: 12,
            paddingVertical: 12,
            gap: 6,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            elevation: 1,
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowOffset: {width: 0, height: 1},
          }}>
          <MaterialIcons name="vpn-key" size={18} color="#6b7280" />
          <Text style={{fontSize: 14, fontWeight: 'bold', color: '#4b5563'}}>코드로 참가</Text>
        </TouchableOpacity>
      </View>

      {/* 모임 목록 */}
      {groups.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="groups" size={56} color="#d1d5db" />
          <Text className="mt-4 text-base font-semibold text-gray-400">
            참가한 모임이 없어요
          </Text>
          <Text className="mt-1 text-sm text-gray-400">
            모임을 만들거나 코드로 참가해보세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 24}}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => setSelectedGroup(item)}
              activeOpacity={0.75}
              className="mb-3 flex-row items-center overflow-hidden rounded-2xl bg-white px-4 py-4"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: {width: 0, height: 2},
              }}>
              {/* 모임 아이콘 */}
              <View
                className="mr-3 h-12 w-12 items-center justify-center rounded-xl"
                style={{backgroundColor: item.color + '20'}}>
                <MaterialIcons name="groups" size={26} color={item.color} />
              </View>

              {/* 모임 정보 */}
              <View className="flex-1">
                <View className="flex-row items-center" style={{gap: 6}}>
                  <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.isLeader && (
                    <View className="rounded-full bg-orange-100 px-2 py-0.5">
                      <Text className="text-xs font-bold text-orange-500">팀장</Text>
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
          )}
        />
      )}

      {/* 모임 만들기 모달 */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowCreateModal(false)}
          className="flex-1 items-center justify-center"
          style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={{
              marginHorizontal: 24,
              alignSelf: 'stretch',
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 24,
            }}>
            <Text className="mb-4 text-lg font-bold text-gray-900">모임 만들기</Text>
            <Text className="mb-1 text-xs font-semibold text-gray-500">모임 이름</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="예) 한강 러닝 크루"
              placeholderTextColor="#9ca3af"
              className="mb-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
              style={{borderWidth: 1, borderColor: '#e5e7eb'}}
              maxLength={30}
            />
            <Text className="mb-1 text-xs font-semibold text-gray-500">소개 (선택)</Text>
            <TextInput
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="모임을 간단히 소개해 주세요"
              placeholderTextColor="#9ca3af"
              className="mb-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
              style={{borderWidth: 1, borderColor: '#e5e7eb'}}
              maxLength={50}
            />
            <View className="flex-row" style={{gap: 8}}>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  setNewName('');
                  setNewDesc('');
                }}
                className="flex-1 items-center rounded-xl bg-gray-100 py-3">
                <Text className="text-sm font-bold text-gray-500">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                className="flex-1 items-center rounded-xl py-3"
                style={{backgroundColor: newName.trim() ? '#f97316' : '#fed7aa'}}>
                <Text className="text-sm font-bold text-white">만들기</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 코드로 참가 모달 */}
      <Modal visible={showJoinModal} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowJoinModal(false)}
          className="flex-1 items-center justify-center"
          style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={{
              marginHorizontal: 24,
              alignSelf: 'stretch',
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 24,
            }}>
            <Text className="mb-2 text-lg font-bold text-gray-900">코드로 참가</Text>
            <Text className="mb-4 text-xs text-gray-400">
              팀장에게 받은 초대 코드를 입력해 주세요
            </Text>
            <TextInput
              value={joinCode}
              onChangeText={text => setJoinCode(text.toUpperCase())}
              placeholder="초대 코드 입력"
              placeholderTextColor="#9ca3af"
              className="mb-5 rounded-xl bg-gray-50 px-4 py-3 text-center text-lg font-bold tracking-widest text-gray-900"
              style={{borderWidth: 1, borderColor: '#e5e7eb', letterSpacing: 8}}
              maxLength={8}
              autoCapitalize="characters"
            />
            <View className="flex-row" style={{gap: 8}}>
              <TouchableOpacity
                onPress={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                }}
                className="flex-1 items-center rounded-xl bg-gray-100 py-3">
                <Text className="text-sm font-bold text-gray-500">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleJoin}
                className="flex-1 items-center rounded-xl py-3"
                style={{backgroundColor: joinCode.trim() ? '#f97316' : '#fed7aa'}}>
                <Text className="text-sm font-bold text-white">참가하기</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
