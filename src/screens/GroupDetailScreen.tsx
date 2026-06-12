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

type TabType = '게시판' | '채팅' | '위치';

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

type Member = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
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

const MOCK_MEMBERS: Member[] = [
  {id: '1', name: '나', color: '#f97316', x: 45, y: 38},
  {id: '2', name: '김러너', color: '#3b82f6', x: 60, y: 52},
  {id: '3', name: '이달리기', color: '#10b981', x: 35, y: 62},
  {id: '4', name: '박마라톤', color: '#8b5cf6', x: 55, y: 28},
];

type Props = {
  groupName: string;
  onBack: () => void;
};

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

function LocationTab() {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{padding: 16}}>
      {/* 안내 카드 */}
      <View className="mb-4 flex-row items-center rounded-2xl bg-orange-50 px-4 py-3" style={{gap: 8}}>
        <MaterialIcons name="info-outline" size={18} color="#f97316" />
        <Text className="flex-1 text-xs text-orange-600">
          대회 당일, 멤버들의 실시간 위치가 코스 맵 위에 표시됩니다.
        </Text>
      </View>

      {/* 지도 목업 */}
      <View
        className="overflow-hidden rounded-2xl bg-gray-100"
        style={{height: 300, position: 'relative'}}>
        {/* 배경 격자 */}
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="map" size={64} color="#d1d5db" />
          <Text className="mt-2 text-sm text-gray-400">대회 코스 맵</Text>
          <Text className="mt-1 text-xs text-gray-400">대회 당일 활성화돼요</Text>
        </View>

        {/* 멤버 위치 핀 (목업) */}
        {MOCK_MEMBERS.map(member => (
          <View
            key={member.id}
            style={{
              position: 'absolute',
              left: `${member.x}%`,
              top: `${member.y}%`,
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: member.color,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#fff',
                elevation: 3,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 4,
                shadowOffset: {width: 0, height: 2},
              }}>
              <Text style={{color: '#fff', fontSize: 11, fontWeight: 'bold'}}>
                {member.name.slice(0, 1)}
              </Text>
            </View>
            <View
              style={{
                marginTop: 2,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 4,
                paddingHorizontal: 4,
                paddingVertical: 1,
              }}>
              <Text style={{color: '#fff', fontSize: 9}}>{member.name}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 멤버 목록 */}
      <Text className="mb-3 mt-5 text-sm font-bold text-gray-700">멤버 위치</Text>
      {MOCK_MEMBERS.map(member => (
        <View
          key={member.id}
          className="mb-2 flex-row items-center rounded-2xl bg-white px-4 py-3"
          style={{gap: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: {width: 0, height: 1}}}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: member.color,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: '#fff', fontSize: 14, fontWeight: 'bold'}}>
              {member.name.slice(0, 1)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900">{member.name}</Text>
            <Text className="text-xs text-gray-400">위치 공유 중</Text>
          </View>
          <MaterialIcons name="location-on" size={18} color={member.color} />
        </View>
      ))}
    </ScrollView>
  );
}

export default function GroupDetailScreen({groupName, onBack}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('게시판');
  const TABS: TabType[] = ['게시판', '채팅', '위치'];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="flex-row items-center bg-white px-4 py-3" style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
        <TouchableOpacity onPress={onBack} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 flex-1 text-lg font-bold text-gray-900" numberOfLines={1}>
          {groupName}
        </Text>
        <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="more-vert" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* 탭 */}
      <View className="flex-row bg-white" style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
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
      {activeTab === '위치' && <LocationTab />}
    </SafeAreaView>
  );
}
