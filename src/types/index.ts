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
