import React, {useState} from 'react';
import {
  FlatList,
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

type Props = {
  groupName: string;
  isLeader?: boolean;
  onBack: () => void;
};

export default function GroupDetailScreen({groupName, isLeader = false, onBack}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('게시판');
  const TABS: TabType[] = ['게시판', '채팅', '모임'];

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
          {groupName}
        </Text>
        {isLeader && (
          <View className="mr-2 rounded-full bg-orange-100 px-2 py-0.5">
            <Text className="text-xs font-bold text-orange-500">모임장</Text>
          </View>
        )}
        <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="more-vert" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

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
