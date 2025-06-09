const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

export interface WordImage {
  url: string;
  alt: string;
}

export const api = {
  // Vocabulary endpoints
  vocabulary: {
    getAll: async (): Promise<Word[]> => {
      const response = await fetch(`${API_BASE_URL}/vocabulary`);
      if (!response.ok) throw new Error('Failed to fetch vocabulary');
      return response.json();
    },

    getByCategory: async (category: string): Promise<Word[]> => {
      const response = await fetch(`${API_BASE_URL}/vocabulary/category/${encodeURIComponent(category)}`);
      if (!response.ok) throw new Error('Failed to fetch category vocabulary');
      return response.json();
    },

    getByDifficulty: async (level: 'easy' | 'medium' | 'hard'): Promise<Word[]> => {
      const response = await fetch(`${API_BASE_URL}/vocabulary/difficulty/${level}`);
      if (!response.ok) throw new Error('Failed to fetch difficulty vocabulary');
      return response.json();
    },

    getCategories: async (): Promise<string[]> => {
      const response = await fetch(`${API_BASE_URL}/vocabulary/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },

    getWord: async (word: string): Promise<Word> => {
      const response = await fetch(`${API_BASE_URL}/vocabulary/word/${encodeURIComponent(word)}`);
      if (!response.ok) throw new Error('Word not found');
      return response.json();
    }
  },

  // Image endpoints
  images: {
    getWordImage: async (word: string): Promise<WordImage> => {
      const response = await fetch(`${API_BASE_URL}/images/word/${encodeURIComponent(word)}`);
      if (!response.ok) throw new Error('Failed to fetch image');
      return response.json();
    }
  },

  // Learning attempts endpoints
  attempts: {
    create: async (attempt: {
      word: string;
      isCorrect: boolean;
      timeTaken: number;
      category: string;
    }): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attempt),
      });
      if (!response.ok) throw new Error('Failed to record attempt');
    },

    getHistory: async () => {
      const response = await fetch(`${API_BASE_URL}/attempts`);
      if (!response.ok) throw new Error('Failed to fetch attempts history');
      return response.json();
    },

    getWordAttempts: async (word: string) => {
      const response = await fetch(`${API_BASE_URL}/attempts/word/${encodeURIComponent(word)}`);
      if (!response.ok) throw new Error('Failed to fetch word attempts');
      return response.json();
    }
  }
}; 