import React, {createContext, useContext, useEffect, useState} from 'react';
import {Race} from '../types';
import {AuthUser, getMe} from '../services/authApi';
import {tokenStorage} from '../services/tokenStorage';

type UserContextType = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  myRaces: Race[];
  addMyRace: (race: Race) => void;
  removeMyRace: (raceId: string) => void;
  isMyRace: (raceId: string) => boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  isReady: false,
  setAuth: () => {},
  logout: () => {},
  myRaces: [],
  addMyRace: () => {},
  removeMyRace: () => {},
  isMyRace: () => false,
});

export function UserProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [myRaces, setMyRaces] = useState<Race[]>([]);

  // 앱 시작 시 저장된 토큰 복원 (추후 토큰으로 사용자 정보 재조회 가능)
  useEffect(() => {
    tokenStorage.get().then(async saved => {
      if (saved) {
        try {
          const authUser = await getMe(saved);
          setToken(saved);
          setUser(authUser);
        } catch {
          // 토큰 만료 또는 유효하지 않음 → 로그아웃 처리
          await tokenStorage.clear();
        }
      }
      setIsReady(true);
    });
  }, []);

  const setAuth = (authUser: AuthUser, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    tokenStorage.set(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setMyRaces([]);
    tokenStorage.clear();
  };

  const addMyRace = (race: Race) => {
    setMyRaces(prev => {
      if (prev.some(r => r.id === race.id)) return prev;
      return [...prev, race];
    });
  };

  const removeMyRace = (raceId: string) => {
    setMyRaces(prev => prev.filter(r => r.id !== raceId));
  };

  const isMyRace = (raceId: string) => myRaces.some(r => r.id === raceId);

  return (
    <UserContext.Provider
      value={{user, token, isReady, setAuth, logout, myRaces, addMyRace, removeMyRace, isMyRace}}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
