import {Area} from '../types';

/** API 미응답 시 사용하는 정적 fallback */
export const FALLBACK_AREAS: Area[] = [
  {areaIdx: 1,  areaCode: '11', areaName: '서울특별시',     areaLevel: 1, parentCode: null, fullName: '서울특별시'},
  {areaIdx: 2,  areaCode: '26', areaName: '부산광역시',     areaLevel: 1, parentCode: null, fullName: '부산광역시'},
  {areaIdx: 3,  areaCode: '27', areaName: '대구광역시',     areaLevel: 1, parentCode: null, fullName: '대구광역시'},
  {areaIdx: 4,  areaCode: '28', areaName: '인천광역시',     areaLevel: 1, parentCode: null, fullName: '인천광역시'},
  {areaIdx: 5,  areaCode: '29', areaName: '광주광역시',     areaLevel: 1, parentCode: null, fullName: '광주광역시'},
  {areaIdx: 6,  areaCode: '30', areaName: '대전광역시',     areaLevel: 1, parentCode: null, fullName: '대전광역시'},
  {areaIdx: 7,  areaCode: '31', areaName: '울산광역시',     areaLevel: 1, parentCode: null, fullName: '울산광역시'},
  {areaIdx: 8,  areaCode: '36', areaName: '세종특별자치시', areaLevel: 1, parentCode: null, fullName: '세종특별자치시'},
  {areaIdx: 9,  areaCode: '41', areaName: '경기도',         areaLevel: 1, parentCode: null, fullName: '경기도'},
  {areaIdx: 10, areaCode: '51', areaName: '강원특별자치도', areaLevel: 1, parentCode: null, fullName: '강원특별자치도'},
  {areaIdx: 11, areaCode: '43', areaName: '충청북도',       areaLevel: 1, parentCode: null, fullName: '충청북도'},
  {areaIdx: 12, areaCode: '44', areaName: '충청남도',       areaLevel: 1, parentCode: null, fullName: '충청남도'},
  {areaIdx: 13, areaCode: '52', areaName: '전북특별자치도', areaLevel: 1, parentCode: null, fullName: '전북특별자치도'},
  {areaIdx: 14, areaCode: '46', areaName: '전라남도',       areaLevel: 1, parentCode: null, fullName: '전라남도'},
  {areaIdx: 15, areaCode: '47', areaName: '경상북도',       areaLevel: 1, parentCode: null, fullName: '경상북도'},
  {areaIdx: 16, areaCode: '48', areaName: '경상남도',       areaLevel: 1, parentCode: null, fullName: '경상남도'},
  {areaIdx: 17, areaCode: '50', areaName: '제주특별자치도', areaLevel: 1, parentCode: null, fullName: '제주특별자치도'},
];

/** 행정구역 전체명 → 짧은 표시 이름 (예: '경상북도' → '경북') */
const SHORT_LABEL_MAP: Record<string, string> = {
  '서울특별시':     '서울',
  '부산광역시':     '부산',
  '대구광역시':     '대구',
  '인천광역시':     '인천',
  '광주광역시':     '광주',
  '대전광역시':     '대전',
  '울산광역시':     '울산',
  '세종특별자치시': '세종',
  '경기도':         '경기',
  '강원특별자치도': '강원',
  '충청북도':       '충북',
  '충청남도':       '충남',
  '전북특별자치도': '전북',
  '전라남도':       '전남',
  '경상북도':       '경북',
  '경상남도':       '경남',
  '제주특별자치도': '제주',
};

export function toShortLabel(areaName: string): string {
  return SHORT_LABEL_MAP[areaName] ?? areaName;
}

/** areaCode → 짧은 표시 이름 (예: '11' → '서울') */
export function areaCodeToLabel(areaCode: string): string {
  const area = FALLBACK_AREAS.find(a => a.areaCode === areaCode);
  return area ? toShortLabel(area.areaName) : areaCode;
}

/** 짧은 표시 이름 → areaCode (예: '서울' → '11') */
export function labelToAreaCode(label: string): string | undefined {
  const fullName = Object.entries(SHORT_LABEL_MAP).find(([, v]) => v === label)?.[0];
  return FALLBACK_AREAS.find(a => a.areaName === fullName)?.areaCode;
}
