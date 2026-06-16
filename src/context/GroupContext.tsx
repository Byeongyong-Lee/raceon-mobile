import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import Config from 'react-native-config';
import {GroupResponse, GroupRole} from '../types';
import {fetchGroups, fetchMyGroups, createGroupApi, updateGroupApi, applyGroupApi, leaveGroupApi, deleteGroupApi} from '../services/groupApi';
import {areaCodeToLabel, labelToAreaCode} from '../constants/regions';
import {useUser} from './UserContext';

const BASE_URL = Config.API_BASE_URL ?? 'http://localhost:28300';

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
  role: GroupRole | null;
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
  imageUri?: string;
};

type UpdateGroupParams = CreateGroupParams & {groupIdx: number};

type SearchGroupsParams = {keyword?: string; areaCode?: string};

type GroupContextType = {
  groups: Group[];            // 전체 탐색용 (모임 목록 탭, API)
  groupsLoading: boolean;
  myGroups: Group[];          // 내 모임 (API)
  myGroupsLoading: boolean;
  applyGroup: (id: string, message?: string) => Promise<void>;
  createGroup: (params: CreateGroupParams) => Promise<void>;
  updateGroup: (params: UpdateGroupParams) => Promise<void>;
  leaveGroup: (groupIdx: number) => Promise<void>;
  deleteGroup: (groupIdx: number) => Promise<void>;
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
  updateGroup: async _p => {},
  leaveGroup: async _p => {},
  deleteGroup: async _p => {},
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
    role: r.role ?? null,
    lastActivity: '',
    region: areaCodeToLabel(r.areaCode),
    imageUri: r.profileImage ? `${BASE_URL}${r.profileImage}` : undefined,
  };
}

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
      setGroups(() => {
        const pending = pendingIdsRef.current;
        return data.map(r => {
          const base = mapGroupResponse(r, 'none');
          if (pending.includes(base.id)) return {...base, status: 'pending' as GroupStatus};
          // 서버가 role을 반환하면 이미 가입된 모임
          if (r.role !== null) return {...base, status: 'joined' as GroupStatus};
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
  const applyGroup = async (id: string, message?: string) => {
    const target = groups.find(g => g.id === id);

    // 낙관적 업데이트
    pendingIdsRef.current = [...pendingIdsRef.current, id];
    setGroups(prev =>
      prev.map(g => (g.id === id ? {...g, status: 'pending' as GroupStatus} : g)),
    );
    if (target) {
      setMyGroups(prev => [
        ...prev.filter(g => g.id !== id),
        {...target, status: 'pending' as GroupStatus, isLeader: false, role: null},
      ]);
    }

    const groupIdx = target?.groupIdx;
    if (!groupIdx) return;

    try {
      await applyGroupApi(groupIdx, message);
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
    imageUri,
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
      imageUri,
    });

    const newGroup = mapGroupResponse(response, 'joined');
    setMyGroups(prev => [newGroup, ...prev]);
    setGroups(prev => [newGroup, ...prev]);
  };

  // ── 모임 수정 ───────────────────────────────────────────
  const updateGroup = async ({
    groupIdx,
    name,
    description,
    region,
    tags,
    maxMembers,
    maxOperators,
    imageUri,
  }: UpdateGroupParams) => {
    const areaCode = labelToAreaCode(region) ?? region;

    await updateGroupApi(groupIdx, {
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
      imageUri,
    });

    // 로컬 상태 업데이트 (이미지 변경 시 리로드)
    if (imageUri) {
      await loadMyGroups();
    } else {
      const patch = (g: Group): Group =>
        g.groupIdx === groupIdx
          ? {...g, name, description, region: areaCodeToLabel(areaCode), tags,
              maxMembers, maxOperators}
          : g;
      setMyGroups(prev => prev.map(patch));
      setGroups(prev => prev.map(patch));
    }
  };

  // ── 모임 삭제 ───────────────────────────────────────────
  const deleteGroup = async (groupIdx: number) => {
    await deleteGroupApi(groupIdx);
    setMyGroups(prev => prev.filter(g => g.groupIdx !== groupIdx));
    setGroups(prev => prev.filter(g => g.groupIdx !== groupIdx));
  };

  // ── 모임 탈퇴 ───────────────────────────────────────────
  const leaveGroup = async (groupIdx: number) => {
    await leaveGroupApi(groupIdx);
    const id = String(groupIdx);
    setMyGroups(prev => prev.filter(g => g.groupIdx !== groupIdx));
    setGroups(prev =>
      prev.map(g => g.groupIdx === groupIdx ? {...g, status: 'none' as GroupStatus, role: null, isLeader: false} : g),
    );
    pendingIdsRef.current = pendingIdsRef.current.filter(pid => pid !== id);
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
        updateGroup,
        leaveGroup,
        deleteGroup,
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
