// Utility functions for date calculations — data now lives in the database

export function getDaysRemaining(startDate: string, durationDays: number): number {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const remaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return remaining; // Can go negative to show behind schedule
}

export function getChallengeDayNumber(challengeStartDate: string, totalDays: number): number {
  const start = new Date(challengeStartDate);
  const now = new Date();
  const dayNum = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(dayNum, totalDays));
}
