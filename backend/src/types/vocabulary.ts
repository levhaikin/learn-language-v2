export interface Word {
  word: string;
  translation: string;
  pronunciation?: string;
  definition?: string;
  examples?: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface VocabularyCategory {
  id: string;
  name: string;
  words: Word[];
} 