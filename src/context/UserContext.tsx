import React, {createContext, useContext, useState} from 'react';

type User = {name: string; imageUrl: string | null};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function UserProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext.Provider value={{user, setUser}}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
