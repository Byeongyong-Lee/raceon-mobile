import Config from 'react-native-config';
import {apiFetch} from './apiClient';
import {tokenStorage} from './tokenStorage';
import {UserRace} from '../types';

const BASE_URL = Config.API_BASE_URL ?? 'http://localhost:18300';

export function getRecordImageUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export async function getMyRaces(): Promise<UserRace[]> {
  const res = await apiFetch<{success: boolean; data: UserRace[]; message: string | null}>(
    '/api/user-races/me',
  );
  if (!res.success) {
    throw new Error(res.message ?? '조회 실패');
  }
  return res.data ?? [];
}

export async function addUserRace(raceIdx: number, course: string): Promise<UserRace> {
  const res = await apiFetch<{success: boolean; data: UserRace; message: string | null}>(
    '/api/user-races',
    {method: 'POST', body: JSON.stringify({raceIdx, course})},
  );
  if (!res.success) {
    throw new Error(res.message ?? '등록 실패');
  }
  return res.data;
}

export async function removeUserRace(userRaceIdx: number): Promise<void> {
  await apiFetch<{success: boolean; data: null; message: string | null}>(
    `/api/user-races/${userRaceIdx}`,
    {method: 'DELETE'},
  );
}

export type RecordPayload = {
  bibNumber?: string;
  recordTime?: string;
  pace?: string;
  ranking?: number;
  finishYn?: string;
  memo?: string;
};

export async function uploadRecordImage(
  userRaceIdx: number,
  fileUri: string,
  fileName: string,
  fileType: string,
): Promise<UserRace> {
  const token = await tokenStorage.get();
  const formData = new FormData();
  formData.append('file', {uri: fileUri, name: fileName, type: fileType} as any);
  const res = await fetch(`${BASE_URL}/api/user-races/${userRaceIdx}/record-image`, {
    method: 'POST',
    headers: token ? {Authorization: `Bearer ${token}`} : {},
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json: {success: boolean; data: UserRace; message: string | null} = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? '업로드 실패');
  }
  return json.data;
}

export async function updateUserRaceRecord(
  userRaceIdx: number,
  payload: RecordPayload,
): Promise<UserRace> {
  const res = await apiFetch<{success: boolean; data: UserRace; message: string | null}>(
    `/api/user-races/${userRaceIdx}/record`,
    {method: 'PATCH', body: JSON.stringify(payload)},
  );
  if (!res.success) {
    throw new Error(res.message ?? '업데이트 실패');
  }
  return res.data;
}
