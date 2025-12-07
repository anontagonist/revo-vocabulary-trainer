import { VocabSet } from "../types";

const STORAGE_KEY = 'vokabel_profi_sets';
const STREAK_KEY = 'vokabel_profi_streak';

interface StreakData {
  current: number;
  best: number;
  lastActivityDate: number | null;
}

// Helper to get streak key per user
const getStreakKey = (userId: string) => `${STREAK_KEY}_${userId}`;

export const saveSets = (sets: VocabSet[]) => {
  try {
    // We load ALL sets first, then replace the ones for the current user or append
    // In this simple implementation, we assume the 'sets' passed in are ONLY the user's sets
    // So we need to fetch 'global' sets, remove current user's old sets, and add new ones.
    // However, to keep it simple and performant for this demo:
    // We will just store everything in one big array and filter on load.
    // Ideally, we would have 'vokabel_profi_sets_USERID'. Let's switch to that for cleaner separation.
    
    // BUT, we need to handle migration or existing sets if we care about the previous version.
    // For V1.1 Multi-tenant, let's strictly use user-spaced keys.
    const userId = sets.length > 0 ? sets[0].userId : null;
    if (userId) {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(sets));
    }
  } catch (e) {
    console.error("Failed to save sets", e);
  }
};

export const loadSets = (userId: string): VocabSet[] => {
  try {
    // Try load specific user sets
    const data = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (data) return JSON.parse(data);

    // Migration fallback: If it's the very first user and they have no data, 
    // maybe check the old key 'vokabel_profi_sets' and claim it?
    // Let's decide NOT to auto-claim to avoid security issues where User B claims User A's data.
    // Users start fresh in V1.1
    return [];
  } catch (e) {
    console.error("Failed to load sets", e);
    return [];
  }
};

export const getStreakInfo = (userId: string) => {
  try {
    const key = getStreakKey(userId);
    const data = localStorage.getItem(key);
    const streak: StreakData = data ? JSON.parse(data) : { current: 0, best: 0, lastActivityDate: null };

    if (!streak.lastActivityDate) {
      return { current: 0, best: 0, isBroken: false, daysMissed: 0 };
    }

    const lastDate = new Date(streak.lastActivityDate);
    const today = new Date();
    
    // Reset time part to compare dates correctly
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      // Streak is active (0 = today, 1 = yesterday)
      return { current: streak.current, best: streak.best, isBroken: false, daysMissed: 0 };
    } else {
      // Streak is broken
      return { 
        current: streak.current, 
        best: streak.best, 
        isBroken: true, 
        daysMissed: diffDays - 1 
      };
    }
  } catch (e) {
    console.error("Failed to get streak info", e);
    return { current: 0, best: 0, isBroken: false, daysMissed: 0 };
  }
};

export const updateStreak = (userId: string) => {
  try {
    const key = getStreakKey(userId);
    const data = localStorage.getItem(key);
    let streak: StreakData = data ? JSON.parse(data) : { current: 0, best: 0, lastActivityDate: null };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let lastDate = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
        streak.current = 1;
    } else {
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak.current += 1;
        } else if (diffDays > 1) {
            streak.current = 1;
        }
        // if diffDays === 0, do nothing (already updated today)
    }

    if (streak.current > streak.best) {
        streak.best = streak.current;
    }
    
    streak.lastActivityDate = Date.now();
    localStorage.setItem(key, JSON.stringify(streak));
  } catch(e) {
      console.error("Failed to update streak", e);
  }
};