import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

export const tokenStorage = {
  get: (): Promise<string | null> => AsyncStorage.getItem(TOKEN_KEY),
  set: (token: string): Promise<void> => AsyncStorage.setItem(TOKEN_KEY, token),
  clear: (): Promise<void> => AsyncStorage.removeItem(TOKEN_KEY),
};

export const refreshTokenStorage = {
  get: (): Promise<string | null> => AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  set: (token: string): Promise<void> => AsyncStorage.setItem(REFRESH_TOKEN_KEY, token),
  clear: (): Promise<void> => AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
};

export const userStorage = {
  get: async <T>(): Promise<T | null> => {
    const v = await AsyncStorage.getItem(USER_KEY);
    return v ? (JSON.parse(v) as T) : null;
  },
  set: (user: object): Promise<void> =>
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: (): Promise<void> => AsyncStorage.removeItem(USER_KEY),
};
