
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  password?: string;
  createdAt: number;
  lastLogin: number;
  isPremium?: boolean;
}

export interface VocabItem {
  id: string;
  original: string;
  translation: string;
  correctCount?: number;
  wrongCount?: number;
  lastPracticed?: number;
}

export interface SetMetadata {
  language: string;
  grade: string;
  chapter: string;
  page: string;
}

export interface VocabSet {
  id: string;
  userId: string;
  title: string;
  metadata?: SetMetadata;
  createdAt: number;
  items: VocabItem[];
  color: string;
  lastScore?: number;
  isSynced?: boolean; // New: tracking sync status
}

export enum AppView {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  CREATE_SET = 'CREATE_SET',
  QUIZ = 'QUIZ',
  MATCHING_GAME = 'MATCHING_GAME',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  STATISTICS = 'STATISTICS',
}

export enum QuizDirection {
  ORIGINAL_TO_TRANSLATION = 'ORIGINAL_TO_TRANSLATION',
  TRANSLATION_TO_ORIGINAL = 'TRANSLATION_TO_ORIGINAL',
}

export interface ExtractionResponse {
  metadata: {
    language?: string;
    grade?: string;
    chapter?: string;
    page?: string;
  };
  vocabulary: {
    original: string;
    translation: string;
  }[];
}

export interface BackupData {
  version: string;
  users: User[];
  allSets: Record<string, VocabSet[]>;
  timestamp: number;
}
