import Config from 'react-native-config';
import {Area} from '../types';

const BASE_URL = Config.API_BASE_URL ?? 'http://localhost:28300';

type AreasResponse = {
  success: boolean;
  data: Area[];
  message: string | null;
};

type FetchAreasParams = {
  level?: 1 | 2 | 3;
  parentCode?: string;
};

export async function fetchAreas(params?: FetchAreasParams): Promise<Area[]> {
  const query = new URLSearchParams();
  if (params?.level !== undefined) {
    query.append('level', String(params.level));
  }
  if (params?.parentCode !== undefined) {
    query.append('parentCode', params.parentCode);
  }
  const qs = query.toString();
  const url = `${BASE_URL}/api/areas${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {headers: {'Content-Type': 'application/json'}});
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const json: AreasResponse = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? '서버 오류');
  }
  return json.data;
}
