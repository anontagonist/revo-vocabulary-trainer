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
  title: string;
  metadata?: SetMetadata;
  createdAt: number;
  items: VocabItem[];
  color: string; // Helper for UI aesthetics
  lastScore?: number; // Persistence of the last quiz result (0-100)
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CREATE_SET = 'CREATE_SET',
  QUIZ = 'QUIZ',
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