import React, {createContext, useContext, useEffect, useState} from 'react';
import {UserRace} from '../types';
import {AuthUser, getMe} from '../services/authApi';
import {tokenStorage, refreshTokenStorage, userStorage} from '../services/tokenStorage';
import {getMyRaces, addUserRace, removeUserRace} from '../services/userRaceApi';
import {setUnauthorizedHandler} from '../services/apiClient';

type UserContextType = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  myRaces: UserRace[];
  addMyRace: (raceIdx: number, course: string) => Promise<void>;
  removeMyRace: (userRaceIdx: number) => Promise<void>;
  updateMyRace: (updated: UserRace) => void;
  isMyRace: (raceId: string) => boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  isReady: false,
  setAuth: (_u, _a, _r) => {},
  logout: () => {},
  myRaces: [],
  addMyRace: async () => {},
  removeMyRace: async () => {},
  updateMyRace: () => {},
  isMyRace: () => false,
});

export function UserProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [myRaces, setMyRaces] = useState<UserRace[]>([]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      setMyRaces([]);
      tokenStorage.clear();
      refreshTokenStorage.clear();
      userStorage.clear();
    });
  }, []);

  const loadMyRaces = async () => {
    try {
      const races = await getMyRaces();
      setMyRaces(races);
    } catch {
      // 조용히 실패
    }
  };

  useEffect(() => {
    (async () => {
      const savedToken = await tokenStorage.get();
      if (!savedToken) {
        setIsReady(true);
        return;
      }

      // 캐시된 유저 정보로 즉시 복원 → 로그인 상태 유지
      const cachedUser = await userStorage.get<AuthUser>();
      if (cachedUser) {
        setToken(savedToken);
        setUser(cachedUser);
        setIsReady(true);
      }

      // 백그라운드에서 서버 검증
      try {
        const authUser = await getMe(savedToken);
        setToken(savedToken);
        setUser(authUser);
        await userStorage.set(authUser);
        await loadMyRaces();
      } catch (e) {
        const isAuthError = e instanceof Error && /HTTP 40[13]/.test(e.message);
        if (isAuthError) {
          // 토큰 만료 → 로그아웃
          setToken(null);
          setUser(null);
          setMyRaces([]);
          await tokenStorage.clear();
          await refreshTokenStorage.clear();
          await userStorage.clear();
        } else {
          // 네트워크 오류 등 → 캐시 유지, 내 대회 로드 시도
          if (cachedUser) {
            await loadMyRaces();
          }
        }
      }

      if (!cachedUser) {
        setIsReady(true);
      }
    })();
  }, []);

  const setAuth = (authUser: AuthUser, accessToken: string, refreshToken: string) => {
    setUser(authUser);
    setToken(accessToken);
    tokenStorage.set(accessToken);
    refreshTokenStorage.set(refreshToken);
    userStorage.set(authUser);
    loadMyRaces();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setMyRaces([]);
    tokenStorage.clear();
    refreshTokenStorage.clear();
    userStorage.clear();
  };

  const addMyRace = async (raceIdx: number, course: string) => {
    const userRace = await addUserRace(raceIdx, course);
    setMyRaces(prev => {
      if (prev.some(r => r.userRaceIdx === userRace.userRaceIdx)) return prev;
      return [...prev, userRace];
    });
  };

  const removeMyRace = async (userRaceIdx: number) => {
    await removeUserRace(userRaceIdx);
    setMyRaces(prev => prev.filter(r => r.userRaceIdx !== userRaceIdx));
  };

  const updateMyRace = (updated: UserRace) => {
    setMyRaces(prev =>
      prev.map(r => (r.userRaceIdx === updated.userRaceIdx ? updated : r)),
    );
  };

  const isMyRace = (raceId: string) =>
    myRaces.some(r => r.raceIdx === parseInt(raceId, 10));

  return (
    <UserContext.Provider
      value={{user, token, isReady, setAuth, logout, myRaces, addMyRace, removeMyRace, updateMyRace, isMyRace}}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
