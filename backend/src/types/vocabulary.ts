export interface Word {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  definition?: string;
  examples?: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface VocabularyCategory {
  id: string;
  name: string;
  description?: string;
  words: Word[];
} 