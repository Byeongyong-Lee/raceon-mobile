import {apiFetch} from './apiClient';
import {GroupResponse} from '../types';

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
  profileImage?: string; // 서버 URL (추후 업로드 API 연동 시 사용)
};

export async function createGroupApi(params: CreateGroupApiParams): Promise<GroupResponse> {
  const json = await apiFetch<ApiResult<GroupResponse>>('/api/groups', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!json.success) throw new Error(json.message ?? '서버 오류');
  return json.data;
}

// ── 가입 신청 ─────────────────────────────────────────────
export async function applyGroupApi(groupIdx: number, message?: string): Promise<void> {
  const json = await apiFetch<ApiResult<null>>(
    `/api/groups/${groupIdx}/applications`,
    {method: 'POST', body: JSON.stringify({message: message ?? null})},
  );
  if (!json.success) throw new Error(json.message ?? '서버 오류');
}
