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

export type SocialProvider = 'google' | 'naver' | 'kakao';
