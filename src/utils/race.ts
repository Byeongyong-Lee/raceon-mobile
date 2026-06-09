export function getDdayLabel(raceDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = raceDate.slice(0, 10).split('-').map(Number);
  const diff = Math.ceil(
    (new Date(y, m - 1, d).getTime() - today.getTime()) / 86400000,
  );
  if (diff === 0) return 'D-day';
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

export function formatDate(raceDate: string): string {
  return raceDate.slice(0, 10).replace(/-/g, '.');
}

export function getDay(raceDate: string): string {
  return raceDate.slice(0, 10).split('-')[2];
}
