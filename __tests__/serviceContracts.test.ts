/**
 * Service contract tests
 *
 * 클라이언트 service 함수가 백엔드와 합의된 "계약"(경로·HTTP 메서드·응답 필드 매핑)을
 * 지키는지 고정한다. 백엔드 라우트나 DTO 필드명이 바뀌어 클라이언트와 어긋나는
 * 회귀(예: getMe가 /api/users/me 대신 존재하지 않는 /api/auth/me를 호출하던 버그,
 * UserResponse.userIdx를 userId로 잘못 읽던 버그)를 잡는 것이 목적이다.
 *
 * @format
 */

// react-native-config는 네이티브 모듈이므로 테스트용 값으로 모킹한다.
jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {API_BASE_URL: 'http://test.local'},
}));

// apiFetch가 의존하는 토큰 저장소(AsyncStorage 래퍼)를 모킹한다.
jest.mock('../src/services/tokenStorage', () => ({
  tokenStorage: {
    get: jest.fn().mockResolvedValue('access-tok'),
    set: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  refreshTokenStorage: {
    get: jest.fn().mockResolvedValue('refresh-tok'),
    set: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

import {getMe, loginWithSocial, refreshAccessToken} from '../src/services/authApi';
import {fetchAreas} from '../src/services/areasApi';
import {getMyRaces} from '../src/services/userRaceApi';
import {fetchMyGroups} from '../src/services/groupApi';

const BASE = 'http://test.local';

type FetchInit = {ok?: boolean; status?: number};

function mockFetchOnce(body: unknown, init: FetchInit = {}) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
}

/** 직전 fetch 호출의 [url, options]를 반환 */
function lastFetchCall(): [string, any] {
  const calls = (global.fetch as jest.Mock).mock.calls;
  return calls[calls.length - 1];
}

beforeEach(() => {
  global.fetch = jest.fn();
});

describe('authApi 계약', () => {
  it('getMe → GET /api/users/me, Bearer 토큰 첨부, userIdx→id 매핑', async () => {
    mockFetchOnce({
      success: true,
      data: {userIdx: 7, nickname: '홍길동', profileImage: null},
      message: null,
    });

    const user = await getMe('tok123');

    const [url, opts] = lastFetchCall();
    expect(url).toBe(`${BASE}/api/users/me`);
    expect(opts.headers.Authorization).toBe('Bearer tok123');
    expect(user).toEqual({id: '7', name: '홍길동', imageUrl: null});
  });

  it('loginWithSocial → POST /api/auth/{provider}', async () => {
    mockFetchOnce({
      success: true,
      data: {
        accessToken: 'a',
        refreshToken: 'r',
        userId: 1,
        nickname: 'n',
        profileImage: null,
        role: 'USER',
      },
      message: null,
    });

    await loginWithSocial('kakao', {socialId: 's1', nickname: 'n'});

    const [url, opts] = lastFetchCall();
    expect(url).toBe(`${BASE}/api/auth/kakao`);
    expect(opts.method).toBe('POST');
  });

  it('refreshAccessToken → POST /api/auth/refresh, accessToken 반환', async () => {
    mockFetchOnce({success: true, data: {accessToken: 'new-token'}, message: null});

    const token = await refreshAccessToken('refresh-1');

    const [url, opts] = lastFetchCall();
    expect(url).toBe(`${BASE}/api/auth/refresh`);
    expect(opts.method).toBe('POST');
    expect(token).toBe('new-token');
  });
});

describe('areasApi 계약', () => {
  it('fetchAreas → GET /api/areas?level=&parentCode=', async () => {
    mockFetchOnce({success: true, data: [], message: null});

    await fetchAreas({level: 2, parentCode: '11'});

    const [url] = lastFetchCall();
    expect(url).toBe(`${BASE}/api/areas?level=2&parentCode=11`);
  });
});

describe('apiFetch 기반 service 계약', () => {
  it('getMyRaces → GET /api/user-races/me, Bearer 토큰 첨부, data 배열 반환', async () => {
    mockFetchOnce({success: true, data: [{userRaceIdx: 1}], message: null});

    const races = await getMyRaces();

    const [url, opts] = lastFetchCall();
    expect(url).toBe(`${BASE}/api/user-races/me`);
    expect(opts.headers.Authorization).toBe('Bearer access-tok');
    expect(races).toEqual([{userRaceIdx: 1}]);
  });

  it('fetchMyGroups → GET /api/groups/me', async () => {
    mockFetchOnce({success: true, data: [], message: null});

    await fetchMyGroups();

    const [url] = lastFetchCall();
    expect(url).toBe(`${BASE}/api/groups/me`);
  });
});
