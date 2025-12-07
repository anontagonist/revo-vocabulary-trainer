export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  password?: string; // In a real app, never store plain text. This is a simulation.
}

export interface VocabItem {
  id: string;
  original: string; // The foreign word (e.g., English, French)
  translation: string; // The known language (e.g., German)
  correctCount?: number;
  wrongCount?: number;
}

export interface SetMetadata {
  language: string;
  grade: string;
  chapter: string;
  page: string;
}

export interface VocabSet {
  id: string;
  userId: string; // Added for multi-tenancy
  title: string;
  metadata?: SetMetadata;
  createdAt: number;
  items: VocabItem[];
  color: string; // Helper for UI aesthetics
  lastScore?: number; // Persistence of the last quiz result (0-100)
}

export enum AppView {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  CREATE_SET = 'CREATE_SET',
  QUIZ = 'QUIZ', // Simple Cards
  MATCHING_GAME = 'MATCHING_GAME', // Match the cards
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', // Multiple Choice
  STATISTICS = 'STATISTICS',
}

export enum QuizDirection {
  ORIGINAL_TO_TRANSLATION = 'ORIGINAL_TO_TRANSLATION', // e.g. English -> German
  TRANSLATION_TO_ORIGINAL = 'TRANSLATION_TO_ORIGINAL', // e.g. German -> English
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