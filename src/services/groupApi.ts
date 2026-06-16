import Config from 'react-native-config';
import {apiFetch} from './apiClient';
import {tokenStorage} from './tokenStorage';
import {GroupResponse, GroupMemberItem, ApplicationItem, ApplicationStatus, GroupRole, BoardPost, BoardComment, ChatMessage} from '../types';

const BASE_URL = Config.API_BASE_URL ?? 'http://localhost:28300';

type ApiResult<T> = {success: boolean; data: T; message: string | null};

// ── 전체 모임 목록 (탐색용, 인증 선택) ───────────────────
export async function fetchGroups(params?: {
  areaCode?: string;
  keyword?: string;
}): Promise<GroupResponse[]> {
  const qs = new URLSearchParams();
  if (params?.areaCode) qs.append('areaCode', params.areaCode);
  if (params?.keyword) qs.append('keyword', params.keyword);
  const path = `/api/groups${qs.toString() ? `?${qs}` : ''}`;
  const json = await apiFetch<ApiResult<GroupResponse[]>>(path);
  if (!json.success) throw new Error(json.message ?? '서버 오류');
  return json.data ?? [];
}

// ── 내 모임 목록 ──────────────────────────────────────────
export async function fetchMyGroups(): Promise<GroupResponse[]> {
  const json = await apiFetch<ApiResult<GroupResponse[]>>('/api/groups/me');
  if (!json.success) throw new Error(json.message ?? '서버 오류');
  return json.data ?? [];
}

// ── 모임 생성 ─────────────────────────────────────────────
export type CreateGroupApiParams = {
  name: string;
  description?: string;
  groupMembers?: number;
  managerMembers?: number;
  areaCode: string;
  tag1?: string;
  tag2?: string;
  tag3?: string;
  tag4?: string;
  tag5?: string;
  imageUri?: string; // 로컬 파일 URI (multipart/form-data로 전송)
};

function getMimeType(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp'};
  return map[ext] ?? 'image/jpeg';
}

export async function createGroupApi(params: CreateGroupApiParams): Promise<GroupResponse> {
  const {imageUri, ...rest} = params;

  // 1단계: JSON으로 모임 생성
  const json = await apiFetch<ApiResult<GroupResponse>>('/api/groups', {
    method: 'POST',
    body: JSON.stringify(rest),
  });
  if (!json.success) throw new Error(json.message ?? '서버 오류');

  // 2단계: 이미지가 있으면 별도 업로드 (파일 파트만 있는 multipart)
  if (imageUri) {
    const token = await tokenStorage.get();
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: getMimeType(imageUri),
      name: `profile.${imageUri.split('.').pop() ?? 'jpg'}`,
    } as any);

    await new Promise<void>(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}/api/groups/${json.data.groupIdx}/image`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.onreadystatechange = () => { if (xhr.readyState === 4) resolve(); };
      xhr.onerror = () => resolve(); // 이미지 실패해도 모임 생성은 성공
      xhr.send(formData);
    });
  }

  return json.data;
}

// ── 모임 수정 ─────────────────────────────────────────────
export type UpdateGroupApiParams = {
  name: string;
  description?: string;
  groupMembers?: number;
  managerMembers?: number;
  areaCode: string;
  tag1?: string;
  tag2?: string;
  tag3?: string;
  tag4?: string;
  tag5?: string;
  imageUri?: string;
};

export async function updateGroupApi(groupIdx: number, params: UpdateGroupApiParams): Promise<void> {
  const {imageUri, ...rest} = params;

  const json = await apiFetch<ApiResult<null>>(`/api/groups/${groupIdx}`, {
    method: 'PATCH',
    body: JSON.stringify(rest),
  });
  if (!json.success) throw new Error(json.message ?? '서버 오류');

  if (imageUri) {
    const token = await tokenStorage.get();
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: getMimeType(imageUri),
      name: `profile.${imageUri.split('.').pop() ?? 'jpg'}`,
    } as any);

    await new Promise<void>(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}/api/groups/${groupIdx}/image`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.onreadystatechange = () => { if (xhr.readyState === 4) resolve(); };
      xhr.onerror = () => resolve();
      xhr.send(formData);
    });
  }
}

// ── 멤버 목록 ─────────────────────────────────────────────
export async function fetchGroupMembers(groupIdx: number): Promise<GroupMemberItem[]> {
  const json = await apiFetch<ApiResult<GroupMemberItem[]>>(`/api/groups/${groupIdx}/members`);
  if (!json.success) throw new Error(json.message ?? '서버 오류');
  return json.data ?? [];
}

// ── 가입 신청 목록 ────────────────────────────────────────
export async function fetchGroupApplications(
  groupIdx: number,
  status?: ApplicationStatus,
): Promise<ApplicationItem[]> {
  const qs = status ? `?status=${status}` : '';
  const json = await apiFetch<ApiResult<ApplicationItem[]>>(
    `/api/groups/${groupIdx}/applications${qs}`,
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
  return json.data ?? [];
}

// ── 가입 신청 승인 ────────────────────────────────────────
export async function approveApplication(groupIdx: number, applicationIdx: number): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(
    `/api/groups/${groupIdx}/applications/${applicationIdx}/approve`,
    {method: 'POST'},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}

// ── 가입 신청 거절 ────────────────────────────────────────
export async function rejectApplication(groupIdx: number, applicationIdx: number): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(
    `/api/groups/${groupIdx}/applications/${applicationIdx}/reject`,
    {method: 'POST'},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}

// ── 멤버 강퇴 ─────────────────────────────────────────────
export async function kickMember(groupIdx: number, targetUserIdx: number): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(
    `/api/groups/${groupIdx}/members/${targetUserIdx}`,
    {method: 'DELETE'},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}

// ── 역할 변경 ─────────────────────────────────────────────
export async function changeMemberRole(
  groupIdx: number,
  targetUserIdx: number,
  role: GroupRole,
): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(
    `/api/groups/${groupIdx}/members/${targetUserIdx}/role`,
    {method: 'PATCH', body: JSON.stringify({role})},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}

// ── 모임 삭제 ─────────────────────────────────────────────
export async function deleteGroupApi(groupIdx: number): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(`/api/groups/${groupIdx}`, {method: 'DELETE'});
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}

// ── 모임 탈퇴 ─────────────────────────────────────────────
export async function leaveGroupApi(groupIdx: number): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(
    `/api/groups/${groupIdx}/members/me`,
    {method: 'DELETE'},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}

// ── 채팅 기록 ─────────────────────────────────────────────
export async function fetchChatHistory(
  groupIdx: number,
  cursor?: number,
): Promise<ChatMessage[]> {
  const qs = new URLSearchParams({size: '50'});
  if (cursor != null) qs.append('cursor', String(cursor));
  const json = await apiFetch<ApiResult<ChatMessage[]>>(
    `/api/groups/${groupIdx}/chat/messages?${qs}`,
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
  return json.data ?? [];
}

// ── 게시판 ────────────────────────────────────────────────
type SpringPage<T> = {content: T[]; last: boolean; totalElements: number; number: number};

export async function fetchBoardPosts(
  groupIdx: number,
  page = 0,
): Promise<{posts: BoardPost[]; last: boolean}> {
  const json = await apiFetch<ApiResult<SpringPage<BoardPost>>>(
    `/api/groups/${groupIdx}/boards?page=${page}&size=20`,
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
  return {posts: json.data.content, last: json.data.last};
}

export async function createBoardPost(
  groupIdx: number,
  title: string,
  content: string,
): Promise<BoardPost> {
  const json = await apiFetch<ApiResult<BoardPost>>(`/api/groups/${groupIdx}/boards`, {
    method: 'POST',
    body: JSON.stringify({title, content}),
  });
  if (!json.success) throw new Error(json.message ?? '서버 오류');
  return json.data;
}

export async function updateBoardPost(
  groupIdx: number,
  boardIdx: number,
  title: string,
  content: string,
): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(`/api/groups/${groupIdx}/boards/${boardIdx}`, {
    method: 'PATCH',
    body: JSON.stringify({title, content}),
  });
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}

export async function deleteBoardPost(groupIdx: number, boardIdx: number): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(`/api/groups/${groupIdx}/boards/${boardIdx}`, {
    method: 'DELETE',
  });
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}

export async function toggleBoardNotice(
  groupIdx: number,
  boardIdx: number,
  isNotice: 'Y' | 'N',
): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(
    `/api/groups/${groupIdx}/boards/${boardIdx}/notice`,
    {method: 'PATCH', body: JSON.stringify({isNotice})},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}

export async function fetchBoardComments(
  groupIdx: number,
  boardIdx: number,
): Promise<BoardComment[]> {
  const json = await apiFetch<ApiResult<BoardComment[]>>(
    `/api/groups/${groupIdx}/boards/${boardIdx}/comments`,
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
  return json.data ?? [];
}

export async function createBoardComment(
  groupIdx: number,
  boardIdx: number,
  content: string,
): Promise<BoardComment> {
  const json = await apiFetch<ApiResult<BoardComment>>(
    `/api/groups/${groupIdx}/boards/${boardIdx}/comments`,
    {method: 'POST', body: JSON.stringify({content})},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
  return json.data;
}

export async function deleteBoardComment(
  groupIdx: number,
  boardIdx: number,
  commentIdx: number,
): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(
    `/api/groups/${groupIdx}/boards/${boardIdx}/comments/${commentIdx}`,
    {method: 'DELETE'},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}

// ── 가입 신청 ─────────────────────────────────────────────
export async function applyGroupApi(groupIdx: number, message?: string): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(
    `/api/groups/${groupIdx}/applications`,
    {method: 'POST', body: JSON.stringify({message: message ?? null})},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}
