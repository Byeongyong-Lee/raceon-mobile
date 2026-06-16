import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {GroupResponse} from '../types';
import {fetchGroups, fetchMyGroups, createGroupApi, applyGroupApi} from '../services/groupApi';
import {areaCodeToLabel, labelToAreaCode} from '../constants/regions';
import {useUser} from './UserContext';

export type GroupStatus = 'none' | 'pending' | 'joined';

export type Group = {
  id: string;
  groupIdx?: number;     // 서버 PK (mock 데이터는 undefined)
  name: string;
  description: string;
  intro: string;
  memberCount: number;
  maxMembers: number;
  maxOperators: number;
  tags: string[];
  color: string;
  status: GroupStatus;
  isLeader: boolean;
  lastActivity: string;
  region: string;
  imageUri?: string;
};

type CreateGroupParams = {
  name: string;
  description: string;
  region: string;    // 짧은 이름 ('서울' 등), 내부에서 areaCode로 변환
  tags: string[];
  maxMembers: number;
  maxOperators: number;
  imageUri?: string; // 로컬 URI (추후 업로드 연동)
};

type SearchGroupsParams = {keyword?: string; areaCode?: string};

type GroupContextType = {
  groups: Group[];            // 전체 탐색용 (모임 목록 탭, API)
  groupsLoading: boolean;
  myGroups: Group[];          // 내 모임 (API)
  myGroupsLoading: boolean;
  applyGroup: (id: string) => Promise<void>;
  createGroup: (params: CreateGroupParams) => Promise<void>;
  refreshMyGroups: () => Promise<void>;
  searchGroups: (params?: SearchGroupsParams) => Promise<void>;
};

const GroupContext = createContext<GroupContextType>({
  groups: [],
  groupsLoading: false,
  myGroups: [],
  myGroupsLoading: false,
  applyGroup: async () => {},
  createGroup: async _p => {},
  refreshMyGroups: async () => {},
  searchGroups: async () => {},
});

const GROUP_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

// ── API 응답 → Group 변환 ─────────────────────────────────
function mapGroupResponse(r: GroupResponse, status: GroupStatus = 'none'): Group {
  const tags = [r.tag1, r.tag2, r.tag3, r.tag4, r.tag5].filter(
    (t): t is string => !!t,
  );
  return {
    id: String(r.groupIdx),
    groupIdx: r.groupIdx,
    name: r.name,
    description: r.description ?? '',
    intro: r.description ?? '',
    memberCount: r.memberCount,
    maxMembers: r.groupMembers ?? 999999,
    maxOperators: r.managerMembers ?? 0,
    tags,
    color: GROUP_COLORS[r.groupIdx % GROUP_COLORS.length],
    status,
    isLeader: r.role === 'OWNER',
    lastActivity: '',
    region: areaCodeToLabel(r.areaCode),
    imageUri: r.profileImage ?? undefined,
  };
}

// ── 모임 목록 탭용 Mock 데이터 ────────────────────────────
const INITIAL_GROUPS: Group[] = [
  {
    id: '1',
    name: '한강 러닝 크루',
    description: '매주 일요일 한강에서 함께 달려요. 초보 환영!',
    intro:
      '한강 러닝 크루는 2023년부터 매주 일요일 오전 7시, 뚝섬한강공원에서 함께 달리는 모임이에요.\n\n초보부터 중급까지 누구나 환영하며, 5km·10km 코스를 자유롭게 선택할 수 있어요. 달리기 후에는 간단한 스트레칭과 함께 모임원들과 이야기를 나눠요.\n\n가입 후 운영진 승인을 거쳐 정식 멤버가 됩니다.',
    memberCount: 87,
    maxMembers: 1000,
    maxOperators: 200,
    tags: ['초보환영', '한강', '주말'],
    color: '#f97316',
    status: 'none',
    isLeader: false,
    lastActivity: '방금 전',
    region: '서울',
  },
  {
    id: '2',
    name: '마라톤 입문자 모임',
    description: '처음 마라톤에 도전하는 분들을 위한 모임이에요.',
    intro:
      '마라톤 풀코스 또는 하프를 처음 준비하는 분들을 위한 모임입니다.\n\n매주 토요일 오전, 한강 또는 올림픽공원에서 모여 계획적인 훈련을 진행해요. 전문 코치가 페이스 배분과 영양 섭취 방법을 안내해 드립니다.\n\n꾸준한 참여가 어려우신 분은 신청을 자제해 주세요.',
    memberCount: 45,
    maxMembers: 100,
    maxOperators: 10,
    tags: ['입문', '마라톤', '훈련'],
    color: '#3b82f6',
    status: 'none',
    isLeader: false,
    lastActivity: '1시간 전',
    region: '서울',
  },
  {
    id: '3',
    name: '서울 새벽 러닝',
    description: '이른 아침의 고요함을 즐기며 달리는 모임입니다.',
    intro:
      '평일 오전 6시, 서울 도심 곳곳을 달리는 새벽 러닝 모임이에요.\n\n매일 코스가 바뀌며 경복궁·남산·청계천 등 다양한 코스를 경험할 수 있어요. 출석 기록을 앱에 남기고, 한 달 개근 시 소정의 기념품을 드려요.\n\n새벽형 인간을 지향하는 분께 추천합니다!',
    memberCount: 132,
    maxMembers: 1000,
    maxOperators: 200,
    tags: ['새벽', '서울', '5km'],
    color: '#8b5cf6',
    status: 'none',
    isLeader: false,
    lastActivity: '30분 전',
    region: '서울',
  },
  {
    id: '4',
    name: '풀코스 도전단',
    description: '42.195km 완주를 목표로 함께 훈련해요.',
    intro:
      '풀코스 마라톤 완주를 목표로 체계적인 훈련을 이어가는 모임입니다.\n\n주 3회 이상 훈련이 기본이며, 서브4·서브3.5 등 목표 기록에 맞춰 그룹을 나눠 운영해요. 고강도 훈련이 포함되므로 하프마라톤 완주 경험자를 우대합니다.',
    memberCount: 23,
    maxMembers: 50,
    maxOperators: 5,
    tags: ['풀코스', '고강도', '훈련'],
    color: '#10b981',
    status: 'none',
    isLeader: false,
    lastActivity: '2시간 전',
    region: '경기',
  },
  {
    id: '5',
    name: '강남 런치런',
    description: '점심시간 30분, 짧고 굵게 달립니다.',
    intro:
      '강남 일대 직장인들을 위한 점심 러닝 모임입니다.\n\n매일 낮 12시 15분 강남역 11번 출구 앞에서 모여 약 4km를 달리고 복귀해요. 샤워 시설 정보도 공유해 드려요.\n\n편하게 참여하고 싶은 날만 나와도 됩니다.',
    memberCount: 61,
    maxMembers: 150,
    maxOperators: 15,
    tags: ['강남', '점심', '직장인'],
    color: '#ef4444',
    status: 'none',
    isLeader: false,
    lastActivity: '3시간 전',
    region: '서울',
  },
  {
    id: '6',
    name: '부산 해운대 러너스',
    description: '해운대 해변을 따라 달리는 부산 러닝 모임.',
    intro:
      '부산 해운대 해변과 마린시티 코스를 달리는 러닝 모임이에요.\n\n매주 토·일 오전 7시, 해운대 해수욕장 앞에서 출발합니다. 바다를 보며 달리는 특별한 경험을 해보세요!\n\n부산 거주자 우선 모집하며, 원정 참가도 환영해요.',
    memberCount: 38,
    maxMembers: 100,
    maxOperators: 10,
    tags: ['부산', '해변', '주말'],
    color: '#f59e0b',
    status: 'none',
    isLeader: false,
    lastActivity: '어제',
    region: '부산',
  },
];

// ── Provider ──────────────────────────────────────────────
export function GroupProvider({children}: {children: React.ReactNode}) {
  const {user} = useUser();

  // 모임 목록 탭: API 데이터 (전체 탐색)
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  // 내 모임 탭: API 데이터
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [myGroupsLoading, setMyGroupsLoading] = useState(false);

  // 로컬에서 신청한 모임 ID (서버 승인 전까지 pending 유지)
  const pendingIdsRef = useRef<string[]>([]);

  // ── 전체 모임 목록 로드 (keyword · areaCode 파라미터 선택) ──
  const loadGroups = async (params?: SearchGroupsParams) => {
    setGroupsLoading(true);
    try {
      const data = await fetchGroups(params);
      setGroups(prev => {
        const pending = pendingIdsRef.current;
        return data.map(r => {
          const base = mapGroupResponse(r, 'none');
          if (pending.includes(base.id)) return {...base, status: 'pending' as GroupStatus};
          const mine = prev.find(g => g.id === base.id);
          if (mine?.status === 'joined') return {...base, status: 'joined' as GroupStatus, isLeader: mine.isLeader};
          return base;
        });
      });
    } catch {
      // 네트워크 오류 시 빈 목록 유지
    } finally {
      setGroupsLoading(false);
    }
  };

  // ── 내 모임 목록 로드 ───────────────────────────────────
  const loadMyGroups = async () => {
    setMyGroupsLoading(true);
    try {
      const data = await fetchMyGroups();
      const mapped = data.map(r => mapGroupResponse(r, 'joined'));
      setMyGroups(mapped);
      // groups의 joined 상태 동기화
      setGroups(prev =>
        prev.map(g => {
          if (pendingIdsRef.current.includes(g.id)) return g;
          const mine = mapped.find(m => m.id === g.id);
          if (mine) return {...g, status: 'joined' as GroupStatus, isLeader: mine.isLeader};
          return g.status === 'joined' ? {...g, status: 'none' as GroupStatus} : g;
        }),
      );
    } catch {
    } finally {
      setMyGroupsLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) {
      setMyGroups([]);
      setGroups(prev => prev.map(g => ({...g, status: 'none' as GroupStatus})));
      pendingIdsRef.current = [];
      return;
    }
    loadMyGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── 가입 신청 ───────────────────────────────────────────
  const applyGroup = async (id: string) => {
    const target = groups.find(g => g.id === id);

    // 낙관적 업데이트
    pendingIdsRef.current = [...pendingIdsRef.current, id];
    setGroups(prev =>
      prev.map(g => (g.id === id ? {...g, status: 'pending' as GroupStatus} : g)),
    );
    if (target) {
      setMyGroups(prev => [
        ...prev.filter(g => g.id !== id),
        {...target, status: 'pending' as GroupStatus, isLeader: false},
      ]);
    }

    const groupIdx = target?.groupIdx;
    if (!groupIdx) return; // mock 데이터면 API 스킵

    try {
      await applyGroupApi(groupIdx);
    } catch (e) {
      // 실패 시 롤백
      pendingIdsRef.current = pendingIdsRef.current.filter(pid => pid !== id);
      setGroups(prev =>
        prev.map(g => (g.id === id ? {...g, status: 'none' as GroupStatus} : g)),
      );
      setMyGroups(prev => prev.filter(g => g.id !== id));
      throw e;
    }
  };

  // ── 모임 생성 ───────────────────────────────────────────
  const createGroup = async ({
    name,
    description,
    region,
    tags,
    maxMembers,
    maxOperators,
  }: CreateGroupParams) => {
    const areaCode = labelToAreaCode(region) ?? region;

    const response = await createGroupApi({
      name,
      description: description || undefined,
      groupMembers: maxMembers,
      managerMembers: maxOperators,
      areaCode,
      tag1: tags[0],
      tag2: tags[1],
      tag3: tags[2],
      tag4: tags[3],
      tag5: tags[4],
    });

    const newGroup = mapGroupResponse(response, 'joined');
    setMyGroups(prev => [newGroup, ...prev]);
    setGroups(prev => [newGroup, ...prev]);
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        groupsLoading,
        myGroups,
        myGroupsLoading,
        applyGroup,
        createGroup,
        refreshMyGroups: loadMyGroups,
        searchGroups: loadGroups,
      }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupContext);
}
