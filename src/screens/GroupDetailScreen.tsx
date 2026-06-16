import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {Group, useGroups} from '../context/GroupContext';
import {useAreas} from '../context/AreaContext';
import {useUser} from '../context/UserContext';
import {toShortLabel} from '../constants/regions';
import {
  fetchGroupMembers,
  fetchGroupApplications,
  approveApplication,
  rejectApplication,
  kickMember,
  changeMemberRole,
} from '../services/groupApi';
import {GroupMemberItem, ApplicationItem, GroupRole} from '../types';

type TabType = '게시판' | '채팅' | '모임';

type Post = {
  id: string;
  title: string;
  author: string;
  date: string;
  likeCount: number;
  commentCount: number;
  preview: string;
};

type Message = {
  id: string;
  author: string;
  content: string;
  time: string;
  isMine: boolean;
};

type ConnectedRace = {
  name: string;
  /** ISO datetime — 대회 시작 시각 */
  startTime: string;
  /** ISO datetime — 대회 종료 시각 */
  endTime: string;
};

type GroupMeeting = {
  id: string;
  title: string;
  /** 'YYYY-MM-DD HH:mm' */
  datetime: string;
  location: string;
  attendeeCount: number;
  maxAttendees: number;
  isAttending: boolean;
  connectedRace?: ConnectedRace;
};

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: '이번 주 일요일 한강 달리기 같이 해요!',
    author: '김러너',
    date: '2026-06-11',
    likeCount: 12,
    commentCount: 5,
    preview: '오전 7시 뚝섬역 1번 출구에서 모입니다. 5km 코스 예정이에요.',
  },
  {
    id: '2',
    title: '서울마라톤 후기 공유해요',
    author: '이달리기',
    date: '2026-06-10',
    likeCount: 8,
    commentCount: 3,
    preview: '처음 풀코스 완주했습니다! 4시간 30분으로 마쳤어요.',
  },
  {
    id: '3',
    title: '러닝화 추천 부탁드려요',
    author: '박마라톤',
    date: '2026-06-09',
    likeCount: 4,
    commentCount: 7,
    preview: '발볼이 넓은 편인데 장거리에 맞는 러닝화 추천해 주세요.',
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    author: '김러너',
    content: '다음 모임 언제 하나요?',
    time: '오전 9:12',
    isMine: false,
  },
  {
    id: '2',
    author: '나',
    content: '이번 주 일요일 어떠세요?',
    time: '오전 9:15',
    isMine: true,
  },
  {
    id: '3',
    author: '이달리기',
    content: '좋아요! 몇 시에 만날까요?',
    time: '오전 9:17',
    isMine: false,
  },
  {
    id: '4',
    author: '나',
    content: '오전 7시 뚝섬역 어떠세요?',
    time: '오전 9:18',
    isMine: true,
  },
  {
    id: '5',
    author: '박마라톤',
    content: '저도 참가할게요!',
    time: '오전 9:20',
    isMine: false,
  },
];

const MOCK_MEETINGS: GroupMeeting[] = [
  {
    id: '1',
    title: '일요일 한강 새벽 러닝',
    datetime: '2026-06-15 07:00',
    location: '뚝섬역 1번 출구',
    attendeeCount: 7,
    maxAttendees: 20,
    isAttending: true,
  },
  {
    id: '2',
    title: '서울하프마라톤 단체 참가',
    datetime: '2026-06-21 08:00',
    location: '잠실올림픽주경기장',
    attendeeCount: 12,
    maxAttendees: 30,
    isAttending: false,
    connectedRace: {
      name: '서울하프마라톤 2026',
      startTime: '2026-06-21 08:00',
      endTime: '2026-06-21 14:00',
    },
  },
  {
    id: '3',
    title: '수요일 저녁 인터벌 훈련',
    datetime: '2026-06-18 19:30',
    location: '올림픽공원 평화의광장',
    attendeeCount: 4,
    maxAttendees: 15,
    isAttending: false,
  },
];

// ─────────────────────────────────────────
// 게시판 탭
// ─────────────────────────────────────────
function BoardTab() {
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <View className="flex-1">
      <FlatList
        data={MOCK_POSTS}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 16, paddingBottom: 80}}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            activeOpacity={0.75}
            className="mb-3 rounded-2xl bg-white px-4 py-4"
            style={{
              elevation: 1,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 6,
              shadowOffset: {width: 0, height: 1},
            }}>
            <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="mt-1 text-xs text-gray-400" numberOfLines={2}>
              {item.preview}
            </Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-xs text-gray-400">
                {item.author} · {item.date}
              </Text>
              <View className="flex-row items-center" style={{gap: 10}}>
                <View className="flex-row items-center" style={{gap: 2}}>
                  <MaterialIcons name="favorite-border" size={13} color="#9ca3af" />
                  <Text className="text-xs text-gray-400">{item.likeCount}</Text>
                </View>
                <View className="flex-row items-center" style={{gap: 2}}>
                  <MaterialIcons name="chat-bubble-outline" size={13} color="#9ca3af" />
                  <Text className="text-xs text-gray-400">{item.commentCount}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* 글쓰기 버튼 */}
      <TouchableOpacity
        onPress={() => setShowWriteModal(true)}
        className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-orange-500"
        style={{elevation: 4, shadowColor: '#f97316', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width: 0, height: 4}}}>
        <MaterialIcons name="edit" size={24} color="#fff" />
      </TouchableOpacity>

      {/* 글쓰기 모달 */}
      <Modal visible={showWriteModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <TouchableOpacity onPress={() => setShowWriteModal(false)}>
              <Text className="text-base text-gray-500">취소</Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-gray-900">새 글 작성</Text>
            <TouchableOpacity onPress={() => setShowWriteModal(false)}>
              <Text className="text-base font-bold text-orange-500">등록</Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="제목을 입력하세요"
              placeholderTextColor="#9ca3af"
              className="border-b border-gray-100 px-4 py-4 text-base font-semibold text-gray-900"
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="내용을 입력하세요"
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              className="flex-1 px-4 py-4 text-sm text-gray-700"
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────
// 채팅 탭
// ─────────────────────────────────────────
function ChatTab() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: String(prev.length + 1),
        author: '나',
        content: message.trim(),
        time: new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'}),
        isMine: true,
      },
    ]);
    setMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 16}}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) =>
          item.isMine ? (
            <View className="mb-3 flex-row justify-end">
              <View>
                <View
                  className="rounded-2xl rounded-tr-sm bg-orange-500 px-4 py-2"
                  style={{maxWidth: 240}}>
                  <Text className="text-sm text-white">{item.content}</Text>
                </View>
                <Text className="mt-0.5 text-right text-xs text-gray-400">{item.time}</Text>
              </View>
            </View>
          ) : (
            <View className="mb-3 flex-row items-end" style={{gap: 8}}>
              <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <Text className="text-xs font-bold text-gray-600">
                  {item.author.slice(0, 1)}
                </Text>
              </View>
              <View>
                <Text className="mb-1 text-xs text-gray-400">{item.author}</Text>
                <View
                  className="rounded-2xl rounded-tl-sm bg-white px-4 py-2"
                  style={{
                    maxWidth: 240,
                    elevation: 1,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    shadowOffset: {width: 0, height: 1},
                  }}>
                  <Text className="text-sm text-gray-800">{item.content}</Text>
                </View>
                <Text className="mt-0.5 text-xs text-gray-400">{item.time}</Text>
              </View>
            </View>
          )
        }
      />
      <View className="flex-row items-center border-t border-gray-100 bg-white px-3 py-2" style={{gap: 8}}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="메시지 입력"
          placeholderTextColor="#9ca3af"
          className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-900"
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          className="h-9 w-9 items-center justify-center rounded-full bg-orange-500">
          <MaterialIcons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────
// 모임 탭
// ─────────────────────────────────────────

/** 현재 시각이 대회 시간 범위 안에 있는지 확인 */
function isRaceActive(race: ConnectedRace): boolean {
  const now = Date.now();
  const start = new Date(race.startTime).getTime();
  const end = new Date(race.endTime).getTime();
  return now >= start && now <= end;
}

type RaceOption = ConnectedRace & {id: string};

const MOCK_RACE_OPTIONS: RaceOption[] = [
  {
    id: 'r1',
    name: '서울하프마라톤 2026',
    startTime: '2026-06-21 08:00',
    endTime: '2026-06-21 14:00',
  },
  {
    id: 'r2',
    name: '한강 10K 챌린지',
    startTime: '2026-06-28 07:30',
    endTime: '2026-06-28 11:00',
  },
  {
    id: 'r3',
    name: '춘천마라톤 2026',
    startTime: '2026-10-25 09:00',
    endTime: '2026-10-25 17:00',
  },
];

function MeetingTab({isLeader}: {isLeader: boolean}) {
  const [meetings, setMeetings] = useState<GroupMeeting[]>(MOCK_MEETINGS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDatetime, setNewDatetime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [raceLinked, setRaceLinked] = useState(false);
  const [selectedRace, setSelectedRace] = useState<RaceOption | null>(null);
  const [showRacePicker, setShowRacePicker] = useState(false);

  const [locationShareTarget, setLocationShareTarget] = useState<GroupMeeting | null>(null);

  const resetCreateForm = () => {
    setNewTitle('');
    setNewDatetime('');
    setNewLocation('');
    setRaceLinked(false);
    setSelectedRace(null);
    setShowRacePicker(false);
  };

  const toggleAttend = (id: string) => {
    setMeetings(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const joining = !m.isAttending;
        return {
          ...m,
          isAttending: joining,
          attendeeCount: joining ? m.attendeeCount + 1 : m.attendeeCount - 1,
        };
      }),
    );
  };

  const handleCreate = () => {
    if (!newTitle.trim() || !newDatetime.trim() || !newLocation.trim()) return;
    setMeetings(prev => [
      {
        id: String(Date.now()),
        title: newTitle.trim(),
        datetime: newDatetime.trim(),
        location: newLocation.trim(),
        attendeeCount: 1,
        maxAttendees: 30,
        isAttending: true,
        connectedRace: raceLinked && selectedRace
          ? {name: selectedRace.name, startTime: selectedRace.startTime, endTime: selectedRace.endTime}
          : undefined,
      },
      ...prev,
    ]);
    resetCreateForm();
    setShowCreateModal(false);
  };

  return (
    <View className="flex-1">
      <FlatList
        data={meetings}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 16, paddingBottom: 90}}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          meetings.length === 0 ? null : (
            <Text className="mb-3 text-xs font-semibold text-gray-400">
              이번 주 모임 {meetings.length}개
            </Text>
          )
        }
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <MaterialIcons name="event" size={52} color="#d1d5db" />
            <Text className="mt-3 text-sm font-semibold text-gray-400">
              예정된 모임이 없어요
            </Text>
            {isLeader && (
              <Text className="mt-1 text-xs text-gray-400">
                아래 + 버튼으로 모임을 만들어보세요
              </Text>
            )}
          </View>
        }
        renderItem={({item}) => {
          const raceActive = item.connectedRace ? isRaceActive(item.connectedRace) : false;

          return (
            <View
              className="mb-3 overflow-hidden rounded-2xl bg-white"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: {width: 0, height: 2},
              }}>
              {/* 대회 연동 배지 */}
              {item.connectedRace && (
                <View
                  className="flex-row items-center px-4 py-2"
                  style={{
                    backgroundColor: raceActive ? '#fff7ed' : '#f9fafb',
                    borderBottomWidth: 1,
                    borderBottomColor: raceActive ? '#fed7aa' : '#f3f4f6',
                    gap: 6,
                  }}>
                  <MaterialIcons
                    name={raceActive ? 'location-on' : 'emoji-events'}
                    size={14}
                    color={raceActive ? '#f97316' : '#6b7280'}
                  />
                  <Text
                    className="flex-1 text-xs font-semibold"
                    style={{color: raceActive ? '#ea580c' : '#6b7280'}}
                    numberOfLines={1}>
                    {raceActive
                      ? '대회 진행 중 · 위치공유 활성화'
                      : `대회 연동 · ${item.connectedRace.name}`}
                  </Text>
                  {raceActive && (
                    <View className="h-2 w-2 rounded-full bg-orange-500" />
                  )}
                </View>
              )}

              <View className="px-4 py-4">
                {/* 제목 */}
                <Text className="text-sm font-bold text-gray-900">{item.title}</Text>

                {/* 날짜·장소 */}
                <View className="mt-2" style={{gap: 4}}>
                  <View className="flex-row items-center" style={{gap: 6}}>
                    <MaterialIcons name="schedule" size={13} color="#9ca3af" />
                    <Text className="text-xs text-gray-500">{item.datetime}</Text>
                  </View>
                  <View className="flex-row items-center" style={{gap: 6}}>
                    <MaterialIcons name="place" size={13} color="#9ca3af" />
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                </View>

                {/* 참석 인원 + 버튼 */}
                <View className="mt-3 flex-row items-center justify-between">
                  <View className="flex-row items-center" style={{gap: 4}}>
                    <MaterialIcons name="group" size={14} color="#9ca3af" />
                    <Text className="text-xs text-gray-400">
                      {item.attendeeCount}
                      <Text className="text-gray-300"> / {item.maxAttendees}명</Text>
                    </Text>
                    {item.isAttending && (
                      <View className="ml-1 rounded-full bg-green-50 px-2 py-0.5">
                        <Text className="text-xs font-semibold text-green-600">참석 예정</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center" style={{gap: 8}}>
                    {/* 위치공유 버튼 — 대회 연동 + 대회 진행 중일 때만 활성 */}
                    {item.connectedRace && item.isAttending && (
                      <TouchableOpacity
                        onPress={() => raceActive && setLocationShareTarget(item)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 20,
                          backgroundColor: raceActive ? '#fff7ed' : '#f3f4f6',
                          borderWidth: 1,
                          borderColor: raceActive ? '#fed7aa' : '#e5e7eb',
                        }}>
                        <MaterialIcons
                          name="my-location"
                          size={13}
                          color={raceActive ? '#f97316' : '#9ca3af'}
                        />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: raceActive ? '#ea580c' : '#9ca3af',
                          }}>
                          {raceActive ? '위치공유' : '대회 전'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* 참석/취소 버튼 */}
                    <TouchableOpacity
                      onPress={() => toggleAttend(item.id)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 7,
                        borderRadius: 20,
                        backgroundColor: item.isAttending ? '#f3f4f6' : '#f97316',
                      }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 'bold',
                          color: item.isAttending ? '#6b7280' : '#fff',
                        }}>
                        {item.isAttending ? '참석 취소' : '참석하기'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* 모임 만들기 FAB — 모임장·운영진만 노출 */}
      {isLeader && (
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-orange-500"
          style={{
            elevation: 4,
            shadowColor: '#f97316',
            shadowOpacity: 0.4,
            shadowRadius: 8,
            shadowOffset: {width: 0, height: 4},
          }}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* 모임 만들기 모달 */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => { setShowCreateModal(false); resetCreateForm(); }}
          className="flex-1 justify-center"
          style={{backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 24}}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={{backgroundColor: '#fff', borderRadius: 24, padding: 24}}>
            <Text className="mb-4 text-lg font-bold text-gray-900">모임 만들기</Text>

            <Text className="mb-1 text-xs font-semibold text-gray-500">모임 이름</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="예) 일요일 새벽 러닝"
              placeholderTextColor="#9ca3af"
              className="mb-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
              style={{borderWidth: 1, borderColor: '#e5e7eb'}}
              maxLength={30}
            />

            <Text className="mb-1 text-xs font-semibold text-gray-500">날짜·시간</Text>
            <TextInput
              value={newDatetime}
              onChangeText={setNewDatetime}
              placeholder="예) 2026-06-22 07:00"
              placeholderTextColor="#9ca3af"
              className="mb-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
              style={{borderWidth: 1, borderColor: '#e5e7eb'}}
            />

            <Text className="mb-1 text-xs font-semibold text-gray-500">장소</Text>
            <TextInput
              value={newLocation}
              onChangeText={setNewLocation}
              placeholder="예) 뚝섬역 1번 출구"
              placeholderTextColor="#9ca3af"
              className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
              style={{borderWidth: 1, borderColor: '#e5e7eb'}}
              maxLength={40}
            />

            {/* 대회 연동 토글 */}
            <TouchableOpacity
              onPress={() => {
                const next = !raceLinked;
                setRaceLinked(next);
                if (!next) {
                  setSelectedRace(null);
                  setShowRacePicker(false);
                } else {
                  setShowRacePicker(true);
                }
              }}
              className="mb-1 flex-row items-center justify-between rounded-xl px-4 py-3"
              style={{
                borderWidth: 1,
                borderColor: raceLinked ? '#fed7aa' : '#e5e7eb',
                backgroundColor: raceLinked ? '#fff7ed' : '#f9fafb',
              }}>
              <View className="flex-row items-center" style={{gap: 8}}>
                <MaterialIcons
                  name="emoji-events"
                  size={18}
                  color={raceLinked ? '#f97316' : '#9ca3af'}
                />
                <Text
                  className="text-sm font-semibold"
                  style={{color: raceLinked ? '#ea580c' : '#6b7280'}}>
                  대회 연동
                </Text>
              </View>
              <View
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: raceLinked ? '#f97316' : '#d1d5db',
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: '#fff',
                    alignSelf: raceLinked ? 'flex-end' : 'flex-start',
                    elevation: 1,
                    shadowColor: '#000',
                    shadowOpacity: 0.15,
                    shadowRadius: 2,
                    shadowOffset: {width: 0, height: 1},
                  }}
                />
              </View>
            </TouchableOpacity>

            {/* 대회 선택 패널 */}
            {raceLinked && (
              <View
                className="mb-1 overflow-hidden rounded-xl"
                style={{borderWidth: 1, borderColor: '#fed7aa', borderTopWidth: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
                <TouchableOpacity
                  onPress={() => setShowRacePicker(p => !p)}
                  className="flex-row items-center justify-between bg-orange-50 px-4 py-2.5">
                  <Text className="text-xs font-semibold text-orange-700">
                    {selectedRace ? selectedRace.name : '대회를 선택하세요'}
                  </Text>
                  <MaterialIcons
                    name={showRacePicker ? 'expand-less' : 'expand-more'}
                    size={18}
                    color="#f97316"
                  />
                </TouchableOpacity>
                {showRacePicker &&
                  MOCK_RACE_OPTIONS.map((race, idx) => (
                    <TouchableOpacity
                      key={race.id}
                      onPress={() => {
                        setSelectedRace(race);
                        setShowRacePicker(false);
                      }}
                      className="flex-row items-center justify-between px-4 py-3"
                      style={{
                        backgroundColor: selectedRace?.id === race.id ? '#fff7ed' : '#fff',
                        borderTopWidth: idx === 0 ? 1 : 0,
                        borderTopColor: '#fed7aa',
                        borderBottomWidth: idx < MOCK_RACE_OPTIONS.length - 1 ? 1 : 0,
                        borderBottomColor: '#f3f4f6',
                      }}>
                      <View style={{gap: 2}}>
                        <Text
                          className="text-sm font-semibold"
                          style={{color: selectedRace?.id === race.id ? '#ea580c' : '#111827'}}>
                          {race.name}
                        </Text>
                        <Text className="text-xs text-gray-400">{race.startTime}</Text>
                      </View>
                      {selectedRace?.id === race.id && (
                        <MaterialIcons name="check-circle" size={18} color="#f97316" />
                      )}
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            {raceLinked && selectedRace && (
              <Text className="mb-3 mt-1 text-xs text-orange-500">
                대회 시간({selectedRace.startTime} ~ {selectedRace.endTime.split(' ')[1]})에만 위치공유가 활성화돼요.
              </Text>
            )}
            {raceLinked && !selectedRace && (
              <Text className="mb-3 mt-1 text-xs text-gray-400">
                대회를 선택하면 대회 당일 위치공유 기능을 쓸 수 있어요.
              </Text>
            )}

            <View className="mt-1 flex-row" style={{gap: 8}}>
              <TouchableOpacity
                onPress={() => { setShowCreateModal(false); resetCreateForm(); }}
                className="flex-1 items-center rounded-xl bg-gray-100 py-3">
                <Text className="text-sm font-bold text-gray-500">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                className="flex-1 items-center rounded-xl py-3"
                style={{
                  backgroundColor:
                    newTitle.trim() && newDatetime.trim() && newLocation.trim()
                      ? '#f97316'
                      : '#fed7aa',
                }}>
                <Text className="text-sm font-bold text-white">만들기</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 위치공유 시작 확인 모달 */}
      <Modal visible={!!locationShareTarget} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setLocationShareTarget(null)}
          className="flex-1 justify-center"
          style={{backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 24}}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={{backgroundColor: '#fff', borderRadius: 24, padding: 24}}>
            <View className="mb-4 items-center">
              <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                <MaterialIcons name="my-location" size={32} color="#f97316" />
              </View>
              <Text className="text-base font-bold text-gray-900">위치공유 시작</Text>
              <Text className="mt-1 text-center text-xs text-gray-400">
                {locationShareTarget?.connectedRace?.name}
              </Text>
              <Text className="mt-2 text-center text-xs text-gray-500">
                참석 멤버들에게 내 위치가 대회 코스 맵 위에 실시간으로 표시됩니다.
              </Text>
            </View>
            <View className="flex-row" style={{gap: 8}}>
              <TouchableOpacity
                onPress={() => setLocationShareTarget(null)}
                className="flex-1 items-center rounded-xl bg-gray-100 py-3">
                <Text className="text-sm font-bold text-gray-500">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLocationShareTarget(null)}
                className="flex-1 items-center rounded-xl bg-orange-500 py-3">
                <Text className="text-sm font-bold text-white">시작하기</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────
// 메인 화면
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// 멤버 관리 화면
// ─────────────────────────────────────────

const ROLE_LABEL: Record<GroupRole, string> = {
  OWNER: '모임장',
  MANAGER: '운영진',
  MEMBER: '회원',
};

const ROLE_COLOR: Record<GroupRole, {bg: string; text: string}> = {
  OWNER:   {bg: '#fff7ed', text: '#ea580c'},
  MANAGER: {bg: '#eff6ff', text: '#3b82f6'},
  MEMBER:  {bg: '#f3f4f6', text: '#6b7280'},
};

function MemberManagementScreen({
  groupIdx,
  role,
  myUserIdx,
  onBack,
}: {
  groupIdx: number;
  role: GroupRole;
  myUserIdx: number;
  onBack: () => void;
}) {
  type TabType = 'applications' | 'members';
  const [activeTab, setActiveTab] = useState<TabType>('applications');
  const [members, setMembers] = useState<GroupMemberItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = async () => {
    try {
      const [m, a] = await Promise.all([
        fetchGroupMembers(groupIdx),
        fetchGroupApplications(groupIdx, 'PENDING'),
      ]);
      setMembers(m);
      setApplications(a);
    } catch {
      Alert.alert('오류', '데이터를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const handleApprove = async (applicationIdx: number) => {
    setActionLoading(applicationIdx);
    try {
      await approveApplication(groupIdx, applicationIdx);
      setApplications(prev => prev.filter(a => a.applicationIdx !== applicationIdx));
      const updated = await fetchGroupMembers(groupIdx);
      setMembers(updated);
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationIdx: number) => {
    setActionLoading(applicationIdx);
    try {
      await rejectApplication(groupIdx, applicationIdx);
      setApplications(prev => prev.filter(a => a.applicationIdx !== applicationIdx));
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleKick = (target: GroupMemberItem) => {
    Alert.alert(
      '멤버 강퇴',
      `멤버 #${target.userIdx}를 강퇴하시겠어요?`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '강퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              await kickMember(groupIdx, target.userIdx);
              setMembers(prev => prev.filter(m => m.userIdx !== target.userIdx));
            } catch (e: any) {
              Alert.alert('오류', e.message);
            }
          },
        },
      ],
    );
  };

  const handleRoleChange = (target: GroupMemberItem) => {
    const newRole: GroupRole = target.role === 'MEMBER' ? 'MANAGER' : 'MEMBER';
    const label = newRole === 'MANAGER' ? '운영진으로 변경' : '회원으로 변경';
    Alert.alert(
      '역할 변경',
      `멤버 #${target.userIdx}를 ${ROLE_LABEL[newRole]}으로 변경하시겠어요?`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: label,
          onPress: async () => {
            try {
              await changeMemberRole(groupIdx, target.userIdx, newRole);
              setMembers(prev =>
                prev.map(m => m.userIdx === target.userIdx ? {...m, role: newRole} : m),
              );
            } catch (e: any) {
              Alert.alert('오류', e.message);
            }
          },
        },
      ],
    );
  };

  const canActOn = (target: GroupMemberItem) => {
    if (target.userIdx === myUserIdx) return false; // 본인
    if (target.role === 'OWNER') return false;       // 모임장은 건드릴 수 없음
    if (role === 'MANAGER' && target.role === 'MANAGER') return false; // 운영진끼리
    return true;
  };

  const pendingCount = applications.length;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="flex-row items-center bg-white px-4 py-3"
        style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
        <TouchableOpacity onPress={onBack} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 flex-1 text-lg font-bold text-gray-900">멤버 관리</Text>
      </View>

      {/* 탭 */}
      <View className="flex-row bg-white" style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
        {([['applications', '가입 신청'], ['members', '멤버']] as [TabType, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            className="flex-1 items-center py-3">
            <View className="flex-row items-center" style={{gap: 4}}>
              <Text className="text-sm font-semibold"
                style={{color: activeTab === key ? '#f97316' : '#9ca3af'}}>
                {label}
              </Text>
              {key === 'applications' && pendingCount > 0 && (
                <View className="h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1">
                  <Text className="text-xs font-bold text-white">{pendingCount}</Text>
                </View>
              )}
            </View>
            {activeTab === key && <View className="absolute bottom-0 h-0.5 w-full bg-orange-500" />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : activeTab === 'applications' ? (
        /* ── 가입 신청 탭 ── */
        <FlatList
          data={applications}
          keyExtractor={item => String(item.applicationIdx)}
          contentContainerStyle={{padding: 16, paddingBottom: 24}}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <MaterialIcons name="inbox" size={52} color="#d1d5db" />
              <Text className="mt-3 text-sm font-semibold text-gray-400">대기 중인 신청이 없어요</Text>
            </View>
          }
          renderItem={({item}) => {
            const isLoading = actionLoading === item.applicationIdx;
            return (
              <View className="mb-3 rounded-2xl bg-white px-4 py-4"
                style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: {width: 0, height: 1}}}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center" style={{gap: 8}}>
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                      <MaterialIcons name="person" size={20} color="#9ca3af" />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-gray-900">멤버 #{item.userIdx}</Text>
                      <Text className="text-xs text-gray-400">{item.createDt.slice(0, 10)}</Text>
                    </View>
                  </View>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#f97316" />
                  ) : (
                    <View className="flex-row" style={{gap: 8}}>
                      <TouchableOpacity
                        onPress={() => handleReject(item.applicationIdx)}
                        className="items-center rounded-xl bg-gray-100 px-4 py-2">
                        <Text className="text-xs font-bold text-gray-500">거절</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleApprove(item.applicationIdx)}
                        className="items-center rounded-xl bg-orange-500 px-4 py-2">
                        <Text className="text-xs font-bold text-white">승인</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {item.message ? (
                  <View className="mt-3 rounded-xl bg-gray-50 px-3 py-2">
                    <Text className="text-xs leading-5 text-gray-600">"{item.message}"</Text>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      ) : (
        /* ── 멤버 탭 ── */
        <FlatList
          data={members}
          keyExtractor={item => String(item.groupMemberIdx)}
          contentContainerStyle={{padding: 16, paddingBottom: 24}}
          ListHeaderComponent={
            <Text className="mb-3 text-xs font-semibold text-gray-400">전체 {members.length}명</Text>
          }
          renderItem={({item}) => {
            const isMe = item.userIdx === myUserIdx;
            const rc = ROLE_COLOR[item.role];
            const showActions = role === 'OWNER' && canActOn(item);
            const showKickOnly = role === 'MANAGER' && canActOn(item);
            return (
              <View className="mb-2 flex-row items-center rounded-2xl bg-white px-4 py-3"
                style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: {width: 0, height: 1}}}>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <MaterialIcons name="person" size={20} color="#9ca3af" />
                </View>
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center" style={{gap: 6}}>
                    <Text className="text-sm font-bold text-gray-900">
                      {isMe ? '나' : `멤버 #${item.userIdx}`}
                    </Text>
                    <View className="rounded-full px-2 py-0.5" style={{backgroundColor: rc.bg}}>
                      <Text className="text-xs font-bold" style={{color: rc.text}}>
                        {ROLE_LABEL[item.role]}
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-0.5 text-xs text-gray-400">
                    {item.createDt.slice(0, 10)} 가입
                  </Text>
                </View>
                {(showActions || showKickOnly) && (
                  <TouchableOpacity
                    onPress={() => {
                      if (showActions) {
                        Alert.alert(
                          `멤버 #${item.userIdx}`,
                          '작업을 선택하세요',
                          [
                            {text: '취소', style: 'cancel'},
                            {
                              text: item.role === 'MEMBER' ? '운영진으로 변경' : '회원으로 변경',
                              onPress: () => handleRoleChange(item),
                            },
                            {text: '강퇴', style: 'destructive', onPress: () => handleKick(item)},
                          ],
                        );
                      } else {
                        handleKick(item);
                      }
                    }}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <MaterialIcons name="more-vert" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

type Props = {
  group: Group;
  onBack: () => void;
};

export default function GroupDetailScreen({group, onBack}: Props) {
  const {updateGroup} = useGroups();
  const {sidoList} = useAreas();
  const {user} = useUser();

  const {role, isLeader} = group;
  const myUserIdx = user ? Number(user.id) : 0;

  const [activeTab, setActiveTab] = useState<TabType>('게시판');
  const [showMenu, setShowMenu] = useState(false);
  const [showMemberMgmt, setShowMemberMgmt] = useState(false);

  // ── 모임 정보 수정 ─────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editMaxMembers, setEditMaxMembers] = useState('');
  const [editMaxOperators, setEditMaxOperators] = useState('');
  const [editImageUri, setEditImageUri] = useState<string | null>(null);
  const [editSubmitted, setEditSubmitted] = useState(false);
  const [editTagDuplicateError, setEditTagDuplicateError] = useState(false);
  const [saving, setSaving] = useState(false);

  const editMembersNum = Number(editMaxMembers);
  const editMaxOpLimit = editMaxMembers ? Math.floor(editMembersNum * 0.2) : 0;
  const editMembersValid = !!editMaxMembers && editMembersNum >= 2 && editMembersNum <= 1000;
  const editOpOver = editMaxOperators !== '' && Number(editMaxOperators) > editMaxOpLimit;

  const editNameError = editSubmitted && editName.trim().length < 2
    ? (editName.trim().length === 0 ? '모임 이름을 입력해 주세요' : '2자 이상 입력해 주세요')
    : null;
  const editRegionError = editSubmitted && !editRegion ? '지역을 선택해 주세요' : null;
  const editMembersError = editSubmitted && !editMembersValid
    ? (!editMaxMembers ? '최대 인원을 입력해 주세요' : '2~1000명 사이로 입력해 주세요')
    : (!editSubmitted && editMaxMembers && !editMembersValid ? '2~1000명 사이로 입력해 주세요' : null);
  const editOpError = editOpOver
    ? `최대 ${editMaxOpLimit}명 (인원의 20%)까지 가능해요`
    : (editSubmitted && editMembersValid && editMaxOperators === '' ? '운영진 수를 입력해 주세요' : null);

  const editCanSave =
    editName.trim().length >= 2 && editRegion && editMembersValid &&
    editMaxOperators !== '' && !editOpOver;

  // ── 멤버 관리 화면 인라인 전환 (훅 선언 이후에 위치) ──
  if (showMemberMgmt && group.groupIdx && (role === 'OWNER' || role === 'MANAGER')) {
    return (
      <MemberManagementScreen
        groupIdx={group.groupIdx}
        role={role}
        myUserIdx={myUserIdx}
        onBack={() => setShowMemberMgmt(false)}
      />
    );
  }

  const TABS: TabType[] = ['게시판', '채팅', '모임'];

  const openEditModal = () => {
    setEditName(group.name);
    setEditDesc(group.description);
    setEditRegion(group.region);
    setEditTags([...group.tags]);
    setEditTagInput('');
    setEditMaxMembers(group.maxMembers >= 999999 ? '' : String(group.maxMembers));
    setEditMaxOperators(String(group.maxOperators));
    setEditImageUri(null);
    setEditSubmitted(false);
    setEditTagDuplicateError(false);
    setShowMenu(false);
    setShowEditModal(true);
  };

  const resetEditForm = () => {
    setEditSubmitted(false);
    setEditTagDuplicateError(false);
    setEditImageUri(null);
  };

  const addEditTag = () => {
    const t = editTagInput.trim();
    if (!t) return;
    if (editTags.includes(t)) { setEditTagDuplicateError(true); return; }
    if (editTags.length >= 5) return;
    setEditTags(prev => [...prev, t]);
    setEditTagInput('');
    setEditTagDuplicateError(false);
  };

  const handlePickEditImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    setEditImageUri(result.assets[0].uri);
  };

  const handleSaveEdit = async () => {
    setEditSubmitted(true);
    if (!editCanSave || saving || !group.groupIdx) return;
    setSaving(true);
    try {
      await updateGroup({
        groupIdx: group.groupIdx,
        name: editName.trim(),
        description: editDesc.trim(),
        region: editRegion,
        tags: editTags,
        maxMembers: Number(editMaxMembers),
        maxOperators: Number(editMaxOperators),
        imageUri: editImageUri ?? undefined,
      });
      resetEditForm();
      setShowEditModal(false);
    } catch {
      Alert.alert('오류', '수정에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  // ── 탈퇴 / 삭제 ────────────────────────────────────────
  const handleLeave = () => {
    setShowMenu(false);
    Alert.alert(
      '모임 탈퇴',
      `'${group.name}' 모임에서 탈퇴하시겠어요?`,
      [
        {text: '취소', style: 'cancel'},
        {text: '탈퇴', style: 'destructive', onPress: () => onBack()},
      ],
    );
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      '모임 삭제',
      `'${group.name}' 모임을 삭제하시겠어요?\n삭제 후에는 복구할 수 없어요.`,
      [
        {text: '취소', style: 'cancel'},
        {text: '삭제', style: 'destructive', onPress: () => onBack()},
      ],
    );
  };

  const roleBadge = role === 'OWNER'
    ? {label: '모임장', bg: '#fff7ed', text: '#ea580c'}
    : role === 'MANAGER'
    ? {label: '운영진', bg: '#eff6ff', text: '#3b82f6'}
    : null;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View
        className="flex-row items-center bg-white px-4 py-3"
        style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
        <TouchableOpacity onPress={onBack} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 flex-1 text-lg font-bold text-gray-900" numberOfLines={1}>
          {group.name}
        </Text>
        {roleBadge && (
          <View className="mr-2 rounded-full px-2 py-0.5" style={{backgroundColor: roleBadge.bg}}>
            <Text className="text-xs font-bold" style={{color: roleBadge.text}}>{roleBadge.label}</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="more-vert" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* ... 메뉴 바텀시트 */}
      <Modal visible={showMenu} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
          className="flex-1 justify-end"
          style={{backgroundColor: 'rgba(0,0,0,0.35)'}}>
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
            <SafeAreaView edges={['bottom']} style={{backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20}}>
              <View style={{paddingTop: 12, paddingBottom: 8}}>
                {/* 핸들 */}
                <View className="mb-4 self-center h-1 w-10 rounded-full bg-gray-200" />

                {/* 모임 정보 수정 — OWNER */}
                {role === 'OWNER' && (
                  <TouchableOpacity
                    onPress={openEditModal}
                    className="flex-row items-center px-6 py-4"
                    style={{gap: 14}}>
                    <MaterialIcons name="edit" size={22} color="#374151" />
                    <Text className="text-base text-gray-800">모임 정보 수정</Text>
                  </TouchableOpacity>
                )}

                {/* 멤버 관리 — OWNER, MANAGER */}
                {(role === 'OWNER' || role === 'MANAGER') && (
                  <TouchableOpacity
                    onPress={() => { setShowMenu(false); setShowMemberMgmt(true); }}
                    className="flex-row items-center px-6 py-4"
                    style={{gap: 14}}>
                    <MaterialIcons name="group" size={22} color="#374151" />
                    <Text className="text-base text-gray-800">멤버 관리</Text>
                  </TouchableOpacity>
                )}

                {/* 구분선 */}
                <View className="mx-6 my-1 h-px bg-gray-100" />

                {/* 모임 탈퇴 — MANAGER, MEMBER */}
                {(role === 'MANAGER' || role === 'MEMBER') && (
                  <TouchableOpacity
                    onPress={handleLeave}
                    className="flex-row items-center px-6 py-4"
                    style={{gap: 14}}>
                    <MaterialIcons name="exit-to-app" size={22} color="#ef4444" />
                    <Text className="text-base text-red-500">모임 탈퇴</Text>
                  </TouchableOpacity>
                )}

                {/* 모임 삭제 — OWNER */}
                {role === 'OWNER' && (
                  <TouchableOpacity
                    onPress={handleDelete}
                    className="flex-row items-center px-6 py-4"
                    style={{gap: 14}}>
                    <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
                    <Text className="text-base text-red-500">모임 삭제</Text>
                  </TouchableOpacity>
                )}

                {/* 취소 */}
                <TouchableOpacity
                  onPress={() => setShowMenu(false)}
                  className="mx-4 mt-2 mb-2 items-center rounded-2xl bg-gray-100 py-4">
                  <Text className="text-sm font-semibold text-gray-500">취소</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 모임 정보 수정 모달 */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowEditModal(false); resetEditForm(); }}>
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
          {/* 헤더 */}
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <TouchableOpacity onPress={() => { setShowEditModal(false); resetEditForm(); }}>
              <Text className="text-base text-gray-500">취소</Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-gray-900">모임 정보 수정</Text>
            <TouchableOpacity onPress={handleSaveEdit} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#f97316" />
              ) : (
                <Text className="text-base font-bold" style={{color: editCanSave ? '#f97316' : '#fed7aa'}}>
                  저장
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
                <TouchableOpacity onPress={handlePickEditImage} activeOpacity={0.8}>
                  {editImageUri || group.imageUri ? (
                    <View>
                      <Image
                        source={{uri: editImageUri ?? group.imageUri}}
                        style={{width: 88, height: 88, borderRadius: 20}}
                      />
                      <View style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 26, height: 26, borderRadius: 13,
                        backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2, borderColor: '#fff',
                      }}>
                        <MaterialIcons name="edit" size={13} color="#fff" />
                      </View>
                    </View>
                  ) : (
                    <View style={{
                      width: 88, height: 88, borderRadius: 20,
                      backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
                      borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed',
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
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="예) 한강 러닝 크루"
                  placeholderTextColor="#9ca3af"
                  className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                  style={{borderWidth: 1, borderColor: editNameError ? '#ef4444' : '#e5e7eb'}}
                  maxLength={30}
                />
                {editNameError && <Text className="mt-1 text-xs text-red-400">{editNameError}</Text>}
              </View>

              {/* 소개 */}
              <Text className="mb-1 text-sm font-semibold text-gray-700">소개 (선택)</Text>
              <TextInput
                value={editDesc}
                onChangeText={setEditDesc}
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
                  const active = editRegion === r;
                  return (
                    <TouchableOpacity
                      key={area.areaCode}
                      onPress={() => setEditRegion(r)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
                        borderWidth: 1,
                        borderColor: active ? '#f97316' : '#e5e7eb',
                        backgroundColor: active ? '#fff7ed' : '#f9fafb',
                      }}>
                      <Text style={{fontSize: 12, fontWeight: '600', color: active ? '#ea580c' : '#6b7280'}}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {editRegionError && <Text className="mt-1 text-xs text-red-400">{editRegionError}</Text>}
              <View className="mb-4" />

              {/* 태그 */}
              <Text className="mb-1 text-sm font-semibold text-gray-700">태그 (선택, 최대 5개)</Text>
              <View className="mb-2 flex-row items-center" style={{gap: 8}}>
                <TextInput
                  value={editTagInput}
                  onChangeText={setEditTagInput}
                  onSubmitEditing={addEditTag}
                  placeholder="예) 새벽, 초보환영"
                  placeholderTextColor="#9ca3af"
                  returnKeyType="done"
                  className="flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                  style={{borderWidth: 1, borderColor: '#e5e7eb'}}
                  maxLength={10}
                />
                <TouchableOpacity
                  onPress={addEditTag}
                  className="h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
                  <MaterialIcons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              {editTagDuplicateError && <Text className="mt-1 text-xs text-red-400">이미 추가된 태그예요</Text>}
              {editTags.length > 0 && (
                <View className="mt-2 mb-4 flex-row flex-wrap" style={{gap: 6}}>
                  {editTags.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => setEditTags(prev => prev.filter(t => t !== tag))}
                      className="flex-row items-center rounded-full bg-orange-50 px-3 py-1"
                      style={{gap: 4}}>
                      <Text className="text-xs font-semibold text-orange-500">#{tag}</Text>
                      <MaterialIcons name="close" size={12} color="#f97316" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!editTags.length && <View className="mb-4" />}

              {/* 최대 인원 + 운영진 */}
              <View className="flex-row" style={{gap: 12}}>
                <View className="flex-1">
                  <Text className="mb-1 text-sm font-semibold text-gray-700">
                    최대 인원 <Text className="text-orange-500">*</Text>
                  </Text>
                  <View className="flex-row items-center" style={{gap: 6}}>
                    <TextInput
                      value={editMaxMembers}
                      onChangeText={v => {
                        const cleaned = v.replace(/[^0-9]/g, '');
                        setEditMaxMembers(cleaned);
                        const num = Number(cleaned);
                        const limit = Math.floor(num * 0.2);
                        if (cleaned && num >= 2 && num <= 1000 && limit === 0) {
                          setEditMaxOperators('0');
                        } else {
                          setEditMaxOperators('');
                        }
                      }}
                      placeholder="최대 1000"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={4}
                      className="flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      style={{borderWidth: 1, borderColor: editMembersError ? '#ef4444' : '#e5e7eb'}}
                    />
                    <Text className="text-sm text-gray-500">명</Text>
                  </View>
                  {editMembersError && <Text className="mt-1 text-xs text-red-400">{editMembersError}</Text>}
                </View>

                <View className="flex-1">
                  <Text className="mb-1 text-sm font-semibold text-gray-700">
                    운영진 <Text className="text-orange-500">*</Text>
                  </Text>
                  <View className="flex-row items-center" style={{gap: 6}}>
                    <TextInput
                      value={editMaxOperators}
                      onChangeText={v => setEditMaxOperators(v.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={3}
                      editable={editMembersValid && editMaxOpLimit > 0}
                      className="flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      style={{
                        borderWidth: 1,
                        borderColor: editOpError ? '#ef4444' : '#e5e7eb',
                        opacity: !editMembersValid ? 0.5 : 1,
                      }}
                    />
                    <Text className="text-sm text-gray-500">명</Text>
                  </View>
                  {editMembersValid && (
                    <Text className={`mt-1 text-xs ${editOpError ? 'text-red-400' : 'text-gray-400'}`}>
                      {editOpError ?? `최대 ${editMaxOpLimit}명 (인원의 20%)`}
                    </Text>
                  )}
                </View>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* 탭 */}
      <View
        className="flex-row bg-white"
        style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="flex-1 items-center py-3">
            <Text
              className="text-sm font-semibold"
              style={{color: activeTab === tab ? '#f97316' : '#9ca3af'}}>
              {tab}
            </Text>
            {activeTab === tab && (
              <View className="absolute bottom-0 h-0.5 w-full bg-orange-500" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 콘텐츠 */}
      {activeTab === '게시판' && <BoardTab />}
      {activeTab === '채팅' && <ChatTab />}
      {activeTab === '모임' && <MeetingTab isLeader={isLeader} />}
    </SafeAreaView>
  );
}
