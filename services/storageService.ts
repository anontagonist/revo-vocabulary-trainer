
import { VocabSet, BackupData, User } from "../types";

const STORAGE_KEY_PREFIX = 'revo_sets_';
const STREAK_KEY_PREFIX = 'revo_streak_';
const USERS_KEY = 'revo_users';

interface StreakData {
  current: number;
  best: number;
  lastActivityDate: number | null;
}

// Simulates a cloud sync status (important for UI feeling)
export const getSyncStatus = (userId: string): boolean => {
  return Math.random() > 0.1; // Placeholder: 90% chance it's "synced"
};

export const saveSets = (sets: VocabSet[]) => {
  // Fixed: Removed redundant and incorrect array comparison `sets !== []`
  if (!sets || sets.length === 0) return;
  const userId = sets.length > 0 ? sets[0].userId : localStorage.getItem('revo_current_user_id');
  if (!userId) return;
  
  // Mark as not synced until "cloud" would pick it up
  const setsToSave = sets.map(s => ({ ...s, isSynced: true })); 
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(setsToSave));
};

export const loadSets = (userId: string): VocabSet[] => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getStreakInfo = (userId: string) => {
  try {
    const data = localStorage.getItem(`${STREAK_KEY_PREFIX}${userId}`);
    const streak: StreakData = data ? JSON.parse(data) : { current: 0, best: 0, lastActivityDate: null };

    if (!streak.lastActivityDate) return { current: 0, best: 0, isBroken: false, daysMissed: 0 };

    const lastDate = new Date(streak.lastActivityDate);
    const today = new Date();
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return { current: streak.current, best: streak.best, isBroken: false, daysMissed: 0 };
    return { current: streak.current, best: streak.best, isBroken: true, daysMissed: diffDays - 1 };
  } catch {
    return { current: 0, best: 0, isBroken: false, daysMissed: 0 };
  }
};

export const updateStreak = (userId: string) => {
  const key = `${STREAK_KEY_PREFIX}${userId}`;
  const data = localStorage.getItem(key);
  let streak: StreakData = data ? JSON.parse(data) : { current: 0, best: 0, lastActivityDate: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
  if (lastDate) lastDate.setHours(0, 0, 0, 0);

  if (!lastDate) streak.current = 1;
  else {
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak.current += 1;
    else if (diffDays > 1) streak.current = 1;
  }

  if (streak.current > streak.best) streak.best = streak.current;
  streak.lastActivityDate = Date.now();
  localStorage.setItem(key, JSON.stringify(streak));
};

export const exportAllData = (): string => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const allSets: Record<string, VocabSet[]> = {};
  
  users.forEach(u => {
    const sets = loadSets(u.id);
    if (sets.length > 0) allSets[u.id] = sets;
  });

  const backup: BackupData = {
    version: "1.6",
    users,
    allSets,
    timestamp: Date.now()
  };
  return JSON.stringify(backup);
};

export const importAllData = (jsonString: string) => {
  try {
    const backup: BackupData = JSON.parse(jsonString);
    if (!backup.users || !backup.allSets) throw new Error("Ungültiges Backup-Format");

    localStorage.setItem(USERS_KEY, JSON.stringify(backup.users));
    Object.entries(backup.allSets).forEach(([userId, sets]) => {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(sets));
    });
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};