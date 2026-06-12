import Config from 'react-native-config';
import {SocialProvider} from '../types';

const BASE_URL = Config.API_BASE_URL ?? 'http://localhost:18300';

export type SocialLoginPayload = {
  socialId: string;
  nickname: string;
  profileImage?: string | null;
  gender?: string | null;
  age?: string | null;
  birthday?: string | null;
  phone?: string | null;
};

export type AuthUser = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export type AuthResponse = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    userId: number;
    nickname: string;
    profileImage: string | null;
    role: string;
  };
  message: string | null;
};

export async function getMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {Authorization: `Bearer ${token}`},
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json: {success: boolean; data: {userId: number; nickname: string; profileImage: string | null}; message: string | null} =
    await res.json();
  if (!json.success) {
    throw new Error(json.message ?? '사용자 조회 실패');
  }
  return {
    id: String(json.data.userId),
    name: json.data.nickname,
    imageUrl: json.data.profileImage,
  };
}

export async function loginWithSocial(
  provider: SocialProvider,
  payload: SocialLoginPayload,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/${provider}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json: AuthResponse = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? '인증 실패');
  }
  return json;
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({refreshToken}),
  });
  const json: {success: boolean; data: {accessToken: string} | null; message: string | null} =
    await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message ?? '토큰 갱신 실패');
  }
  return json.data.accessToken;
}

export function parseAuthUser(data: AuthResponse['data']): AuthUser {
  return {
    id: String(data.userId),
    name: data.nickname,
    imageUrl: data.profileImage,
  };
}
