import React, {createContext, useContext, useEffect, useState} from 'react';
import {Area} from '../types';
import {fetchAreas} from '../services/areasApi';
import {FALLBACK_AREAS} from '../constants/regions';

type AreaContextType = {
  /** 시도 목록 (level=1). API 실패 시 fallback 데이터 제공 */
  sidoList: Area[];
  loading: boolean;
};

const AreaContext = createContext<AreaContextType>({
  sidoList: FALLBACK_AREAS,
  loading: false,
});

export function AreaProvider({children}: {children: React.ReactNode}) {
  const [sidoList, setSidoList] = useState<Area[]>(FALLBACK_AREAS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAreas({level: 1})
      .then(data => {
        if (data.length > 0) {
          setSidoList(data);
        }
      })
      .catch(() => {
        // API 실패 시 fallback 유지 (이미 초기값으로 설정됨)
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AreaContext.Provider value={{sidoList, loading}}>
      {children}
    </AreaContext.Provider>
  );
}

export function useAreas() {
  return useContext(AreaContext);
}
