import { VocabSet } from "../types";

const STORAGE_KEY = 'vokabel_profi_sets';
const STREAK_KEY = 'vokabel_profi_streak';

interface StreakData {
  current: number;
  best: number;
  lastActivityDate: number | null;
}

export const saveSets = (sets: VocabSet[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch (e) {
    console.error("Failed to save sets", e);
  }
};

export const loadSets = (): VocabSet[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load sets", e);
    return [];
  }
};

export const getStreakInfo = () => {
  try {
    const data = localStorage.getItem(STREAK_KEY);
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

export const updateStreak = () => {
  try {
    const data = localStorage.getItem(STREAK_KEY);
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
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch(e) {
      console.error("Failed to update streak", e);
  }
};