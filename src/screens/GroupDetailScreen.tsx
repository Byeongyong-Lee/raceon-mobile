import React, {useState} from 'react';
import {Client} from '@stomp/stompjs';
import Config from 'react-native-config';
import {tokenStorage} from '../services/tokenStorage';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
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
  fetchBoardPosts,
  createBoardPost,
  updateBoardPost,
  deleteBoardPost,
  toggleBoardNotice,
  fetchBoardComments,
  createBoardComment,
  deleteBoardComment,
  fetchChatHistory,
  fetchMeetups,
  createMeetup,
  updateMeetup,
  deleteMeetup,
  respondMeetup,
  fetchMeetupParticipants,
} from '../services/groupApi';
import {GroupMemberItem, ApplicationItem, GroupRole, BoardPost, BoardComment, ChatMessage, Meetup, MeetupParticipant, MeetupStatus} from '../types';

type TabType = '게시판' | '채팅' | '모임';


// ─────────────────────────────────────────
// 게시글 상세 + 댓글
// ─────────────────────────────────────────
function PostDetailView({
  groupIdx,
  post,
  myUserIdx,
  role,
  onBack,
  onEdit,
  onDelete,
  onToggleNotice,
}: {
  groupIdx: number;
  post: BoardPost;
  myUserIdx: number;
  role: GroupRole | null;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleNotice: () => void;
}) {
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const isAuthor = post.authorIdx === myUserIdx;
  const canManage = role === 'OWNER' || role === 'MANAGER';

  React.useEffect(() => {
    fetchBoardComments(groupIdx, post.boardIdx)
      .then(setComments)
      .catch(() => {})
      .finally(() => setCommentsLoading(false));
  }, [post.boardIdx]);

  const handleSubmitComment = async () => {
    if (!commentInput.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const created = await createBoardComment(groupIdx, post.boardIdx, commentInput.trim());
      setComments(prev => [...prev, created]);
      setCommentInput('');
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = (comment: BoardComment) => {
    Alert.alert('댓글 삭제', '이 댓글을 삭제하시겠어요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBoardComment(groupIdx, post.boardIdx, comment.commentIdx);
            setComments(prev => prev.filter(c => c.commentIdx !== comment.commentIdx));
          } catch (e: any) {
            Alert.alert('오류', e.message);
          }
        },
      },
    ]);
  };

  const showPostMenu = () => {
    const options: Array<{text: string; onPress?: () => void; style?: 'cancel' | 'destructive' | 'default'}> = [];
    if (isAuthor) options.push({text: '수정', onPress: onEdit});
    if (canManage) options.push({
      text: post.isNotice === 'Y' ? '공지 해제' : '공지 설정',
      onPress: onToggleNotice,
    });
    if (isAuthor || canManage) options.push({text: '삭제', style: 'destructive', onPress: onDelete});
    options.push({text: '취소', style: 'cancel'});
    Alert.alert('게시글 관리', undefined, options);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View
        className="flex-row items-center bg-white px-4 py-3"
        style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
        <TouchableOpacity onPress={onBack} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="ml-3 flex-1 text-base font-bold text-gray-900">게시판</Text>
        {(isAuthor || canManage) && (
          <TouchableOpacity
            onPress={showPostMenu}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <MaterialIcons name="more-vert" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerStyle={{paddingBottom: 16}} showsVerticalScrollIndicator={false}>
          {/* 게시글 본문 */}
          <View
            className="bg-white px-4 py-5"
            style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
            {post.isNotice === 'Y' && (
              <View className="mb-2 self-start rounded-full bg-orange-100 px-2 py-0.5">
                <Text className="text-xs font-bold text-orange-600">공지</Text>
              </View>
            )}
            <Text className="text-lg font-bold text-gray-900">{post.title}</Text>
            <View className="mt-2 flex-row items-center" style={{gap: 8}}>
              <Text className="text-xs text-gray-400">
                {post.authorIdx === myUserIdx ? '나' : `멤버 #${post.authorIdx}`}
              </Text>
              <Text className="text-xs text-gray-300">·</Text>
              <Text className="text-xs text-gray-400">{post.createDt?.slice(0, 10)}</Text>
            </View>
            <View className="mt-4 border-t border-gray-50 pt-4">
              <Text className="text-sm leading-6 text-gray-700">{post.content}</Text>
            </View>
          </View>

          {/* 댓글 */}
          <View className="px-4 pt-4">
            <Text className="mb-3 text-sm font-bold text-gray-700">댓글 {comments.length}개</Text>
            {commentsLoading ? (
              <ActivityIndicator color="#f97316" />
            ) : comments.length === 0 ? (
              <Text className="text-xs text-gray-400">첫 번째 댓글을 남겨보세요!</Text>
            ) : (
              comments.map(comment => (
                <View
                  key={comment.commentIdx}
                  className="mb-3 rounded-2xl bg-white px-4 py-3"
                  style={{
                    elevation: 1,
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    shadowOffset: {width: 0, height: 1},
                  }}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center" style={{gap: 8}}>
                      <View className="h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                        <MaterialIcons name="person" size={16} color="#9ca3af" />
                      </View>
                      <View>
                        <Text className="text-xs font-semibold text-gray-700">
                          {comment.authorIdx === myUserIdx ? '나' : `멤버 #${comment.authorIdx}`}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          {comment.createDt?.slice(0, 10)}
                        </Text>
                      </View>
                    </View>
                    {(comment.authorIdx === myUserIdx || canManage) && (
                      <TouchableOpacity
                        onPress={() => handleDeleteComment(comment)}
                        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                        <MaterialIcons name="close" size={16} color="#9ca3af" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className="mt-2 text-sm leading-5 text-gray-700">{comment.content}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* 댓글 입력 */}
        <View
          className="flex-row items-center border-t border-gray-100 bg-white px-3 py-2"
          style={{gap: 8}}>
          <TextInput
            value={commentInput}
            onChangeText={setCommentInput}
            placeholder="댓글을 입력하세요"
            placeholderTextColor="#9ca3af"
            className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-900"
            returnKeyType="send"
            onSubmitEditing={handleSubmitComment}
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSubmitComment}
            disabled={submittingComment}
            className="h-9 w-9 items-center justify-center rounded-full bg-orange-500">
            {submittingComment ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─────────────────────────────────────────
// 게시판 탭
// ─────────────────────────────────────────
function BoardTab({
  groupIdx,
  myUserIdx,
  role,
}: {
  groupIdx: number;
  myUserIdx: number;
  role: GroupRole | null;
}) {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BoardPost | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalIsNotice, setModalIsNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canManage = role === 'OWNER' || role === 'MANAGER';

  const loadPosts = async (pageNum: number) => {
    try {
      const {posts: newPosts, last} = await fetchBoardPosts(groupIdx, pageNum);
      setPosts(prev => (pageNum === 0 ? newPosts : [...prev, ...newPosts]));
      setIsLast(last);
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '게시글을 불러오지 못했어요.');
    }
  };

  React.useEffect(() => {
    loadPosts(0).finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    if (isLast || loadingMore) return;
    setLoadingMore(true);
    const next = page + 1;
    await loadPosts(next);
    setPage(next);
    setLoadingMore(false);
  };

  const openWrite = () => {
    setEditingPost(null);
    setModalTitle('');
    setModalContent('');
    setModalIsNotice(false);
    setShowWriteModal(true);
  };

  const openEdit = (post: BoardPost) => {
    setEditingPost(post);
    setModalTitle(post.title);
    setModalContent(post.content);
    setModalIsNotice(post.isNotice === 'Y');
    setShowWriteModal(true);
  };

  const handleSubmitPost = async () => {
    if (!modalTitle.trim() || !modalContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      if (editingPost) {
        await updateBoardPost(groupIdx, editingPost.boardIdx, modalTitle.trim(), modalContent.trim());
        const updated = {...editingPost, title: modalTitle.trim(), content: modalContent.trim()};
        setPosts(prev => prev.map(p => (p.boardIdx === editingPost.boardIdx ? updated : p)));
        if (selectedPost?.boardIdx === editingPost.boardIdx) setSelectedPost(updated);
      } else {
        const created = await createBoardPost(groupIdx, modalTitle.trim(), modalContent.trim());
        if (modalIsNotice) {
          await toggleBoardNotice(groupIdx, created.boardIdx, 'Y');
          setPosts(prev => [{...created, isNotice: 'Y'}, ...prev]);
        } else {
          setPosts(prev => [created, ...prev]);
        }
      }
      setShowWriteModal(false);
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '실패했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = (post: BoardPost) => {
    Alert.alert('게시글 삭제', '이 게시글을 삭제하시겠어요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBoardPost(groupIdx, post.boardIdx);
            setPosts(prev => prev.filter(p => p.boardIdx !== post.boardIdx));
            if (selectedPost?.boardIdx === post.boardIdx) setSelectedPost(null);
          } catch (e: any) {
            Alert.alert('오류', e.message);
          }
        },
      },
    ]);
  };

  const handleToggleNotice = async (post: BoardPost) => {
    const next: 'Y' | 'N' = post.isNotice === 'Y' ? 'N' : 'Y';
    try {
      await toggleBoardNotice(groupIdx, post.boardIdx, next);
      const updated = {...post, isNotice: next};
      setPosts(prev => prev.map(p => (p.boardIdx === post.boardIdx ? updated : p)));
      if (selectedPost?.boardIdx === post.boardIdx) setSelectedPost(updated);
    } catch (e: any) {
      Alert.alert('오류', e.message);
    }
  };

  const notices = posts.filter(p => p.isNotice === 'Y');
  const regular = posts.filter(p => p.isNotice !== 'Y');
  const displayPosts = [...notices, ...regular];

  return (
    <View className="flex-1">
      {selectedPost ? (
        <PostDetailView
          groupIdx={groupIdx}
          post={selectedPost}
          myUserIdx={myUserIdx}
          role={role}
          onBack={() => setSelectedPost(null)}
          onEdit={() => openEdit(selectedPost)}
          onDelete={() => handleDeletePost(selectedPost)}
          onToggleNotice={() => handleToggleNotice(selectedPost)}
        />
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <>
          <FlatList
            data={displayPosts}
            keyExtractor={item => String(item.boardIdx)}
            contentContainerStyle={{padding: 16, paddingBottom: 80}}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator color="#f97316" style={{marginVertical: 16}} />
              ) : null
            }
            ListEmptyComponent={
              <View className="mt-20 items-center">
                <MaterialIcons name="article" size={52} color="#d1d5db" />
                <Text className="mt-3 text-sm font-semibold text-gray-400">
                  아직 게시글이 없어요
                </Text>
                <Text className="mt-1 text-xs text-gray-400">첫 번째 게시글을 작성해보세요!</Text>
              </View>
            }
            renderItem={({item}) => (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setSelectedPost(item)}
                className="mb-3 rounded-2xl bg-white px-4 py-4"
                style={{
                  elevation: 1,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  shadowOffset: {width: 0, height: 1},
                }}>
                <View className="flex-row items-center" style={{gap: 6}}>
                  {item.isNotice === 'Y' && (
                    <View className="rounded-full bg-orange-100 px-2 py-0.5">
                      <Text className="text-xs font-bold text-orange-600">공지</Text>
                    </View>
                  )}
                  <Text
                    className="flex-1 text-sm font-bold text-gray-900"
                    numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
                <Text className="mt-1 text-xs text-gray-400" numberOfLines={2}>
                  {item.content}
                </Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-xs text-gray-400">{item.createDt?.slice(0, 10)}</Text>
                  <Text className="text-xs text-gray-400">
                    {item.authorIdx === myUserIdx ? '나' : `멤버 #${item.authorIdx}`}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            onPress={openWrite}
            className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-orange-500"
            style={{
              elevation: 4,
              shadowColor: '#f97316',
              shadowOpacity: 0.4,
              shadowRadius: 8,
              shadowOffset: {width: 0, height: 4},
            }}>
            <MaterialIcons name="edit" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      {/* 글쓰기/수정 모달 */}
      <Modal
        visible={showWriteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWriteModal(false)}>
        <View className="flex-1">
          {/* 배경 터치로 닫기 */}
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setShowWriteModal(false)}
          />
          {/* 바텀시트 */}
          <SafeAreaView
            edges={['bottom']}
            className="rounded-t-3xl bg-gray-50"
            style={{maxHeight: '88%'}}>
            {/* 드래그 핸들 */}
            <View className="items-center pb-1 pt-3">
              <View className="h-1 w-10 rounded-full bg-gray-300" />
            </View>
            {/* 헤더 */}
            <View className="flex-row items-center justify-between px-4 py-3">
              <TouchableOpacity onPress={() => setShowWriteModal(false)}>
                <MaterialIcons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
              <Text className="text-base font-bold text-gray-900">
                {editingPost ? '게시글 수정' : '새 글 작성'}
              </Text>
              <TouchableOpacity
                onPress={handleSubmitPost}
                disabled={submitting || !modalTitle.trim() || !modalContent.trim()}
                className="rounded-full bg-orange-500 px-4 py-1.5"
                style={{opacity: modalTitle.trim() && modalContent.trim() ? 1 : 0.35}}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-sm font-bold text-white">
                    {editingPost ? '수정' : '등록'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              className="flex-1">
              <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{paddingBottom: 24}}>
                {/* 제목 */}
                <View className="mx-4 mt-1 rounded-2xl bg-white px-4 py-4">
                  <TextInput
                    value={modalTitle}
                    onChangeText={setModalTitle}
                    placeholder="제목을 입력하세요"
                    placeholderTextColor="#9ca3af"
                    className="text-base font-semibold text-gray-900"
                    maxLength={100}
                  />
                </View>
                {/* 내용 */}
                <View className="mx-4 mt-2 rounded-2xl bg-white px-4 py-4">
                  <TextInput
                    value={modalContent}
                    onChangeText={setModalContent}
                    placeholder="내용을 입력하세요"
                    placeholderTextColor="#9ca3af"
                    multiline
                    textAlignVertical="top"
                    className="text-sm text-gray-700"
                    style={{minHeight: 140}}
                  />
                </View>
                {/* 공지 토글 - 새 글 작성 + OWNER/MANAGER만 */}
                {!editingPost && canManage && (
                  <View className="mx-4 mt-2 flex-row items-center justify-between rounded-2xl bg-white px-4 py-3.5">
                    <View className="flex-row items-center" style={{gap: 8}}>
                      <MaterialIcons name="campaign" size={18} color="#f97316" />
                      <Text className="text-sm font-semibold text-gray-700">공지로 등록</Text>
                    </View>
                    <Switch
                      value={modalIsNotice}
                      onValueChange={setModalIsNotice}
                      trackColor={{false: '#e5e7eb', true: '#fdba74'}}
                      thumbColor={modalIsNotice ? '#f97316' : '#f9fafb'}
                    />
                  </View>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────
// 채팅 탭
// ─────────────────────────────────────────
function ChatTab({groupIdx, myUserIdx}: {groupIdx: number; myUserIdx: number}) {
  // messages: DESC 순 (최신이 index 0) — inverted FlatList에 맞춤
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const stompRef = React.useRef<Client | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const init = async () => {
      // 1) 채팅 기록 로드 (DESC 순)
      try {
        const history = await fetchChatHistory(groupIdx);
        if (mounted) {
          setMessages(history);
          setHasMore(history.length >= 50);
        }
      } catch {
        // 기록 없어도 연결은 진행
      } finally {
        if (mounted) setLoading(false);
      }

      // 2) STOMP 연결
      const token = await tokenStorage.get();
      const baseUrl = Config.API_BASE_URL ?? 'http://localhost:28300';
      const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/native';

      const client = new Client({
        webSocketFactory: () => new WebSocket(wsUrl),
        connectHeaders: token ? {Authorization: `Bearer ${token}`} : {},
        reconnectDelay: 5000,
        onConnect: () => {
          if (!mounted) return;
          setConnected(true);
          client.subscribe(`/sub/groups/${groupIdx}/chat`, frame => {
            if (!mounted) return;
            const msg: ChatMessage = JSON.parse(frame.body);
            setMessages(prev => [msg, ...prev]); // 최신을 앞에
          });
        },
        onDisconnect: () => { if (mounted) setConnected(false); },
        onStompError: () => { if (mounted) setConnected(false); },
        onWebSocketError: () => { if (mounted) setConnected(false); },
      });
      client.activate();
      if (mounted) stompRef.current = client;
    };

    init();

    return () => {
      mounted = false;
      stompRef.current?.deactivate();
      stompRef.current = null;
    };
  }, []);

  // 오래된 메시지 더 불러오기 (inverted FlatList에서 onEndReached = 위 끝에 도달)
  const loadMore = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    const oldest = messages[messages.length - 1]; // DESC에서 마지막 = 가장 오래됨
    setLoadingMore(true);
    try {
      const older = await fetchChatHistory(groupIdx, oldest.chatIdx);
      if (older.length === 0) {
        setHasMore(false);
      } else {
        setMessages(prev => [...prev, ...older]);
        setHasMore(older.length >= 50);
      }
    } catch {}
    finally { setLoadingMore(false); }
  };

  const sendMessage = () => {
    const text = messageInput.trim();
    if (!text || !stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/pub/groups/${groupIdx}/chat`,
      body: JSON.stringify({content: text, messageType: 'TEXT'}),
    });
    setMessageInput('');
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      {!connected && (
        <View
          className="flex-row items-center justify-center bg-gray-50 py-1.5"
          style={{gap: 6}}>
          <ActivityIndicator size="small" color="#9ca3af" />
          <Text className="text-xs text-gray-400">채팅 서버에 연결 중...</Text>
        </View>
      )}

      <FlatList
        inverted
        data={messages}
        keyExtractor={item => String(item.chatIdx)}
        contentContainerStyle={{padding: 16}}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color="#f97316" style={{marginVertical: 12}} />
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center py-10">
            <MaterialIcons name="chat" size={48} color="#e5e7eb" />
            <Text className="mt-3 text-sm text-gray-400">첫 번째 메시지를 보내보세요!</Text>
          </View>
        }
        renderItem={({item}) => {
          const isMine = item.senderIdx === myUserIdx;
          const timeStr = item.createDt?.slice(11, 16) ?? '';
          return isMine ? (
            <View className="mb-3 flex-row justify-end">
              <View>
                <View
                  className="rounded-2xl rounded-tr-sm bg-orange-500 px-4 py-2"
                  style={{maxWidth: 240}}>
                  <Text className="text-sm text-white">{item.content}</Text>
                </View>
                <Text className="mt-0.5 text-right text-xs text-gray-400">{timeStr}</Text>
              </View>
            </View>
          ) : (
            <View className="mb-3 flex-row items-end" style={{gap: 8}}>
              <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <Text className="text-xs font-bold text-gray-600">
                  {String(item.senderIdx).slice(-2)}
                </Text>
              </View>
              <View>
                <Text className="mb-1 text-xs text-gray-400">멤버 #{item.senderIdx}</Text>
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
                <Text className="mt-0.5 text-xs text-gray-400">{timeStr}</Text>
              </View>
            </View>
          );
        }}
      />

      <View
        className="flex-row items-center border-t border-gray-100 bg-white px-3 py-2"
        style={{gap: 8}}>
        <TextInput
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder={connected ? '메시지 입력' : '연결 중...'}
          placeholderTextColor="#9ca3af"
          editable={connected}
          className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-900"
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!connected}
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{backgroundColor: connected ? '#f97316' : '#e5e7eb'}}>
          <MaterialIcons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────
// 모임 탭
// ─────────────────────────────────────────

function formatMeetupDt(dt: string): string {
  const d = new Date(dt);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const dow = weekdays[d.getDay()];
  return `${month}월 ${day}일 (${dow}) ${hh}:${mm}`;
}

type ParticipantInfo = {
  attendCount: number;
  myStatus: MeetupStatus | null;
  list: MeetupParticipant[];
};

function MeetingTab({
  groupIdx,
  myUserIdx,
  role,
}: {
  groupIdx: number;
  myUserIdx: number;
  role: GroupRole | null;
}) {
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [participantMap, setParticipantMap] = useState<Record<number, ParticipantInfo>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeetup, setEditingMeetup] = useState<Meetup | null>(null);
  const [showParticipantsFor, setShowParticipantsFor] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 폼
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDatetime, setFormDatetime] = useState('');
  const [formLocation, setFormLocation] = useState('');

  const canManage = role === 'OWNER' || role === 'MANAGER';

  const load = async () => {
    try {
      const list = await fetchMeetups(groupIdx);
      setMeetups(list);
      if (list.length > 0) {
        const results = await Promise.all(
          list.map(m => fetchMeetupParticipants(groupIdx, m.meetupIdx)),
        );
        const map: Record<number, ParticipantInfo> = {};
        list.forEach((m, i) => {
          const parts = results[i];
          const mine = parts.find(p => p.userIdx === myUserIdx);
          map[m.meetupIdx] = {
            attendCount: parts.filter(p => p.status === 'ATTEND').length,
            myStatus: mine?.status ?? null,
            list: parts,
          };
        });
        setParticipantMap(map);
      }
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '데이터를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const handleRespond = async (meetupIdx: number, status: MeetupStatus) => {
    const current = participantMap[meetupIdx]?.myStatus;
    const newStatus: MeetupStatus = current === status ? 'PENDING' : status;
    try {
      const result = await respondMeetup(groupIdx, meetupIdx, newStatus);
      setParticipantMap(prev => {
        const old = prev[meetupIdx] ?? {attendCount: 0, myStatus: null, list: []};
        const existingIdx = old.list.findIndex(p => p.userIdx === myUserIdx);
        const updated =
          existingIdx >= 0
            ? old.list.map(p => (p.userIdx === myUserIdx ? {...p, status: newStatus} : p))
            : [...old.list, result];
        return {
          ...prev,
          [meetupIdx]: {
            attendCount: updated.filter(p => p.status === 'ATTEND').length,
            myStatus: newStatus,
            list: updated,
          },
        };
      });
    } catch (e: any) {
      Alert.alert('오류', e.message);
    }
  };

  const openCreate = () => {
    setEditingMeetup(null);
    setFormTitle('');
    setFormDesc('');
    setFormDatetime('');
    setFormLocation('');
    setShowModal(true);
  };

  const openEdit = (m: Meetup) => {
    setEditingMeetup(m);
    setFormTitle(m.title);
    setFormDesc(m.description ?? '');
    setFormDatetime(m.meetupDt?.slice(0, 16).replace('T', ' ') ?? '');
    setFormLocation(m.location);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formDatetime.trim() || !formLocation.trim() || submitting) return;
    const meetupDt = formDatetime.trim().replace(' ', 'T');
    setSubmitting(true);
    try {
      const params = {
        title: formTitle.trim(),
        description: formDesc.trim() || null,
        meetupDt,
        location: formLocation.trim(),
      };
      if (editingMeetup) {
        await updateMeetup(groupIdx, editingMeetup.meetupIdx, params);
        setMeetups(prev =>
          prev.map(m =>
            m.meetupIdx === editingMeetup.meetupIdx
              ? {...m, ...params, meetupDt}
              : m,
          ),
        );
      } else {
        const created = await createMeetup(groupIdx, params);
        setMeetups(prev => [...prev, created]);
        setParticipantMap(prev => ({
          ...prev,
          [created.meetupIdx]: {attendCount: 0, myStatus: null, list: []},
        }));
      }
      setShowModal(false);
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '실패했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (m: Meetup) => {
    Alert.alert(`'${m.title}' 삭제`, '이 약속을 삭제하시겠어요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMeetup(groupIdx, m.meetupIdx);
            setMeetups(prev => prev.filter(x => x.meetupIdx !== m.meetupIdx));
          } catch (e: any) {
            Alert.alert('오류', e.message);
          }
        },
      },
    ]);
  };

  const canSubmit = formTitle.trim() && formDatetime.trim() && formLocation.trim();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const participantsModalList = showParticipantsFor
    ? (participantMap[showParticipantsFor]?.list ?? [])
    : [];

  return (
    <View className="flex-1">
      <FlatList
        data={meetups}
        keyExtractor={item => String(item.meetupIdx)}
        contentContainerStyle={{padding: 16, paddingBottom: 90}}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          meetups.length === 0 ? null : (
            <Text className="mb-3 text-xs font-semibold text-gray-400">
              예정된 약속 {meetups.length}개
            </Text>
          )
        }
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <MaterialIcons name="event" size={52} color="#d1d5db" />
            <Text className="mt-3 text-sm font-semibold text-gray-400">예정된 약속이 없어요</Text>
            {canManage && (
              <Text className="mt-1 text-xs text-gray-400">+ 버튼으로 약속을 만들어보세요</Text>
            )}
          </View>
        }
        renderItem={({item}) => {
          const info = participantMap[item.meetupIdx];
          const myStatus = info?.myStatus ?? null;
          const attendCount = info?.attendCount ?? 0;

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
              <View className="px-4 py-4">
                {/* 제목 + 관리 버튼 */}
                <View className="flex-row items-start justify-between">
                  <Text className="flex-1 text-sm font-bold text-gray-900" numberOfLines={2}>
                    {item.title}
                  </Text>
                  {canManage && (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(item.title, undefined, [
                          {text: '취소', style: 'cancel'},
                          {text: '수정', onPress: () => openEdit(item)},
                          {text: '삭제', style: 'destructive', onPress: () => handleDelete(item)},
                        ])
                      }
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                      className="ml-2">
                      <MaterialIcons name="more-vert" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* 설명 */}
                {!!item.description && (
                  <Text className="mt-1 text-xs text-gray-400" numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                {/* 날짜·장소 */}
                <View className="mt-2" style={{gap: 4}}>
                  <View className="flex-row items-center" style={{gap: 6}}>
                    <MaterialIcons name="schedule" size={13} color="#9ca3af" />
                    <Text className="text-xs text-gray-500">{formatMeetupDt(item.meetupDt)}</Text>
                  </View>
                  <View className="flex-row items-center" style={{gap: 6}}>
                    <MaterialIcons name="place" size={13} color="#9ca3af" />
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                </View>

                {/* 참석 인원 + 응답 버튼 */}
                <View className="mt-3 flex-row items-center justify-between">
                  {/* 참석자 수 */}
                  <TouchableOpacity
                    onPress={() => setShowParticipantsFor(item.meetupIdx)}
                    className="flex-row items-center"
                    style={{gap: 4}}>
                    <MaterialIcons name="group" size={14} color="#9ca3af" />
                    <Text className="text-xs text-gray-400">참석 {attendCount}명</Text>
                    <MaterialIcons name="chevron-right" size={13} color="#d1d5db" />
                  </TouchableOpacity>

                  {/* 참석 / 불참 버튼 */}
                  <View className="flex-row" style={{gap: 6}}>
                    <TouchableOpacity
                      onPress={() => handleRespond(item.meetupIdx, 'ATTEND')}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: myStatus === 'ATTEND' ? '#f97316' : '#f3f4f6',
                      }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 'bold',
                          color: myStatus === 'ATTEND' ? '#fff' : '#6b7280',
                        }}>
                        참석
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRespond(item.meetupIdx, 'ABSENT')}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: myStatus === 'ABSENT' ? '#ef4444' : '#f3f4f6',
                      }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 'bold',
                          color: myStatus === 'ABSENT' ? '#fff' : '#6b7280',
                        }}>
                        불참
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* 약속 만들기 FAB */}
      {canManage && (
        <TouchableOpacity
          onPress={openCreate}
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

      {/* 약속 생성/수정 모달 */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text className="text-base text-gray-500">취소</Text>
            </TouchableOpacity>
            <Text className="text-base font-bold text-gray-900">
              {editingMeetup ? '약속 수정' : '약속 만들기'}
            </Text>
            <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="#f97316" />
              ) : (
                <Text
                  className="text-base font-bold"
                  style={{color: canSubmit ? '#f97316' : '#fed7aa'}}>
                  {editingMeetup ? '수정' : '만들기'}
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

              <Text className="mb-1 text-sm font-semibold text-gray-700">
                약속 이름 <Text className="text-orange-500">*</Text>
              </Text>
              <TextInput
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="예) 일요일 새벽 러닝"
                placeholderTextColor="#9ca3af"
                className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                style={{borderWidth: 1, borderColor: '#e5e7eb'}}
                maxLength={50}
              />

              <Text className="mb-1 text-sm font-semibold text-gray-700">소개 (선택)</Text>
              <TextInput
                value={formDesc}
                onChangeText={setFormDesc}
                placeholder="약속을 간단히 설명해 주세요"
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                style={{borderWidth: 1, borderColor: '#e5e7eb', height: 72}}
                maxLength={200}
              />

              <Text className="mb-1 text-sm font-semibold text-gray-700">
                날짜·시간 <Text className="text-orange-500">*</Text>
              </Text>
              <TextInput
                value={formDatetime}
                onChangeText={setFormDatetime}
                placeholder="예) 2026-06-22 07:00"
                placeholderTextColor="#9ca3af"
                className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                style={{borderWidth: 1, borderColor: '#e5e7eb'}}
              />
              <Text className="mb-4 mt-1 text-xs text-gray-400">
                오늘로부터 10일 이내 날짜만 설정할 수 있어요
              </Text>

              <Text className="mb-1 text-sm font-semibold text-gray-700">
                장소 <Text className="text-orange-500">*</Text>
              </Text>
              <TextInput
                value={formLocation}
                onChangeText={setFormLocation}
                placeholder="예) 뚝섬역 1번 출구"
                placeholderTextColor="#9ca3af"
                className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900"
                style={{borderWidth: 1, borderColor: '#e5e7eb'}}
                maxLength={100}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* 참석자 목록 모달 */}
      <Modal visible={showParticipantsFor !== null} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowParticipantsFor(null)}
          className="flex-1 justify-end"
          style={{backgroundColor: 'rgba(0,0,0,0.4)'}}>
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
            <SafeAreaView
              edges={['bottom']}
              style={{backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24}}>
              <View style={{paddingTop: 12, paddingHorizontal: 20, paddingBottom: 8}}>
                <View className="mb-4 self-center h-1 w-10 rounded-full bg-gray-200" />
                <Text className="mb-3 text-base font-bold text-gray-900">참석자 목록</Text>
                {participantsModalList.length === 0 ? (
                  <View className="py-8 items-center">
                    <Text className="text-sm text-gray-400">아직 응답한 멤버가 없어요</Text>
                  </View>
                ) : (
                  participantsModalList.map(p => {
                    const statusLabel =
                      p.status === 'ATTEND' ? '참석' : p.status === 'ABSENT' ? '불참' : '미정';
                    const statusColor =
                      p.status === 'ATTEND' ? '#f97316' : p.status === 'ABSENT' ? '#ef4444' : '#9ca3af';
                    return (
                      <View
                        key={p.participantIdx}
                        className="mb-2 flex-row items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                        <View className="flex-row items-center" style={{gap: 8}}>
                          <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                            <MaterialIcons name="person" size={18} color="#9ca3af" />
                          </View>
                          <Text className="text-sm font-semibold text-gray-800">
                            {p.userIdx === myUserIdx ? '나' : `멤버 #${p.userIdx}`}
                          </Text>
                        </View>
                        <View
                          className="rounded-full px-3 py-0.5"
                          style={{backgroundColor: statusColor + '20'}}>
                          <Text
                            className="text-xs font-bold"
                            style={{color: statusColor}}>
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </SafeAreaView>
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
  const {updateGroup, leaveGroup, deleteGroup} = useGroups();
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
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            if (!group.groupIdx) { onBack(); return; }
            try {
              await leaveGroup(group.groupIdx);
              onBack();
            } catch (e: any) {
              Alert.alert('오류', e.message ?? '탈퇴에 실패했어요.');
            }
          },
        },
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
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            if (!group.groupIdx) { onBack(); return; }
            try {
              await deleteGroup(group.groupIdx);
              onBack();
            } catch (e: any) {
              Alert.alert('오류', e.message ?? '삭제에 실패했어요.');
            }
          },
        },
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
      {activeTab === '게시판' && (
        <BoardTab groupIdx={group.groupIdx!} myUserIdx={myUserIdx} role={role} />
      )}
      {activeTab === '채팅' && (
        <ChatTab groupIdx={group.groupIdx!} myUserIdx={myUserIdx} />
      )}
      {activeTab === '모임' && (
        <MeetingTab groupIdx={group.groupIdx!} myUserIdx={myUserIdx} role={role} />
      )}
    </SafeAreaView>
  );
}
