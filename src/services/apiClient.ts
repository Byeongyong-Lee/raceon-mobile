import Config from 'react-native-config';
import {tokenStorage, refreshTokenStorage} from './tokenStorage';
import {refreshAccessToken} from './authApi';

const BASE_URL = Config.API_BASE_URL ?? 'http://localhost:28300';

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

let onUnauthorized: (() => void) | null = null;
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

function drainQueue(error: Error | null, token?: string) {
  refreshQueue.forEach(({resolve, reject}) =>
    error ? reject(error) : resolve(token!),
  );
  refreshQueue = [];
}

function buildHeaders(
  token: string | null,
  extra?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {'Content-Type': 'application/json', ...extra};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function executeRequest<T>(
  path: string,
  options: RequestOptions,
  token: string | null,
): Promise<T> {
  const headers = buildHeaders(token, options.headers);
  const res = await fetch(`${BASE_URL}${path}`, {...options, headers});
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = await tokenStorage.get();
  const headers = buildHeaders(token, options.headers);
  const res = await fetch(`${BASE_URL}${path}`, {...options, headers});

  // 정상 응답
  if (res.status !== 401) {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  // 401 — 다른 갱신이 진행 중이면 큐에 추가
  if (isRefreshing) {
    return new Promise<T>((resolve, reject) => {
      refreshQueue.push({
        resolve: newToken =>
          resolve(executeRequest<T>(path, options, newToken)),
        reject,
      });
    });
  }

  isRefreshing = true;
  const storedRefreshToken = await refreshTokenStorage.get();

  if (!storedRefreshToken) {
    isRefreshing = false;
    onUnauthorized?.();
    throw new Error('HTTP 401');
  }

  try {
    const newAccessToken = await refreshAccessToken(storedRefreshToken);
    await tokenStorage.set(newAccessToken);
    drainQueue(null, newAccessToken);
    isRefreshing = false;
    // 원래 요청 재시도
    return executeRequest<T>(path, options, newAccessToken);
  } catch {
    drainQueue(new Error('HTTP 401'));
    isRefreshing = false;
    onUnauthorized?.();
    throw new Error('HTTP 401');
  }
}
