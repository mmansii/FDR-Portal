export const CURRENT_SIMULATED_DATE = new Date('2026-10-24');

export function getTodayDate(): Date {
  // Use 2026-10-24 as base date for demonstration reproducibility
  return new Date(CURRENT_SIMULATED_DATE);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getDaysDifference(targetDateStr: string, baseDate: Date = getTodayDate()): number {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr);
  if (isNaN(target.getTime())) return 0;
  
  // Set both to midnight UTC for precise calendar day difference
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const utcBase = Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  
  const diffMs = utcTarget - utcBase;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getDaysPast(pastDateStr: string, baseDate: Date = getTodayDate()): number {
  return -getDaysDifference(pastDateStr, baseDate);
}

export function isUpcomingWithinDays(targetDateStr: string, days: number): boolean {
  const diff = getDaysDifference(targetDateStr);
  return diff >= 0 && diff <= days;
}

export function isDatePassed(targetDateStr: string): boolean {
  const diff = getDaysDifference(targetDateStr);
  return diff < 0;
}
