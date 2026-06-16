import Config from 'react-native-config';
import {apiFetch} from './apiClient';
import {tokenStorage} from './tokenStorage';
import {UserRace} from '../types';

const BASE_URL = Config.API_BASE_URL ?? 'http://localhost:28300';

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

  return new Promise<UserRace>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/api/user-races/${userRaceIdx}/record-image`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      try {
        const json: {success: boolean; data: UserRace; message: string | null} =
          JSON.parse(xhr.responseText);
        if (!json.success) reject(new Error(json.message ?? '업로드 실패'));
        else resolve(json.data);
      } catch {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
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
