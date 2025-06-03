export interface Word {
  word: string;
  translation: string;
  definition?: string;
  examples?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface VocabularyLesson {
  id: string;
  title: string;
  description?: string;
  words: Word[];
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
} 