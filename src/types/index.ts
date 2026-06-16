export type Race = {
  id: string;
  sourceId: string;
  name: string;
  raceDate: string;
  location: string;
  course: string;
  organizer: string;
  phone: string;
  homepage: string;
  detailUrl: string;
};

export type UserRace = {
  userRaceIdx: number;
  raceIdx: number;
  raceName: string;
  raceDate: string;
  raceLocation: string;
  course: string;
  bibNumber: string | null;
  recordTime: string | null;
  pace: string | null;
  ranking: number | null;
  finishYn: string | null;
  memo: string | null;
  recordImagePath: string | null;
};

export type SocialProvider = 'google' | 'naver' | 'kakao';

export type GroupRole = 'OWNER' | 'MANAGER' | 'MEMBER';

export type GroupResponse = {
  groupIdx: number;
  name: string;
  description: string | null;
  groupMembers: number | null;   // null = 무제한
  managerMembers: number | null;
  areaCode: string;
  tag1: string | null;
  tag2: string | null;
  tag3: string | null;
  tag4: string | null;
  tag5: string | null;
  profileImage: string | null;
  ownerIdx: number;
  role: GroupRole | null;  // 비회원 탐색 시 null
  memberCount: number;
};

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type GroupMemberItem = {
  groupMemberIdx: number;
  userIdx: number;
  role: GroupRole;
  createDt: string;
};

export type ApplicationItem = {
  applicationIdx: number;
  groupIdx: number;
  userIdx: number;
  message: string | null;
  status: ApplicationStatus;
  processedBy: number | null;
  createDt: string;
};

export type ChatMessage = {
  chatIdx: number;
  senderIdx: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM';
  createDt: string;
};

export type BoardPost = {
  boardIdx: number;
  groupIdx: number;
  authorIdx: number;
  title: string;
  content: string;
  isNotice: 'Y' | 'N';
  createDt: string;
  updateDt: string;
};

export type BoardComment = {
  commentIdx: number;
  boardIdx: number;
  authorIdx: number;
  content: string;
  delAt: 'Y' | 'N';
  createDt: string;
  updateDt: string;
};

export type Area = {
  areaIdx: number;
  areaCode: string;  // 시도 2자리 / 시군구 5자리 / 읍면동 8자리
  areaName: string;  // 예: 서울특별시, 종로구
  areaLevel: 1 | 2 | 3;
  parentCode: string | null;
  fullName: string;  // 예: 경기도 수원시 장안구
};
