import Config from 'react-native-config';
import {apiFetch} from './apiClient';
import {tokenStorage} from './tokenStorage';
import {GroupResponse} from '../types';

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

// ── 가입 신청 ─────────────────────────────────────────────
export async function applyGroupApi(groupIdx: number, message?: string): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(
    `/api/groups/${groupIdx}/applications`,
    {method: 'POST', body: JSON.stringify({message: message ?? null})},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}
