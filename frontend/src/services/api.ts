import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configure axios instance with default settings
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      const response = await axiosInstance.get('/vocabulary');
      return response.data;
    },

    getByCategory: async (category: string): Promise<Word[]> => {
      const response = await axiosInstance.get(`/vocabulary/category/${encodeURIComponent(category)}`);
      return response.data;
    },

    getByDifficulty: async (level: 'easy' | 'medium' | 'hard'): Promise<Word[]> => {
      const response = await axiosInstance.get(`/vocabulary/difficulty/${level}`);
      return response.data;
    },

    getCategories: async (): Promise<string[]> => {
      const response = await axiosInstance.get('/vocabulary/categories');
      return response.data;
    },

    getWord: async (word: string): Promise<Word> => {
      const response = await axiosInstance.get(`/vocabulary/word/${encodeURIComponent(word)}`);
      return response.data;
    }
  },

  // Image endpoints
  images: {
    getWordImage: async (word: string): Promise<WordImage> => {
      const response = await axiosInstance.get(`/images/word/${encodeURIComponent(word)}`);
      return response.data;
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
      await axiosInstance.post('/attempts', attempt);
    },

    getHistory: async () => {
      const response = await axiosInstance.get('/attempts');
      return response.data;
    },

    getWordAttempts: async (word: string) => {
      const response = await axiosInstance.get(`/attempts/word/${encodeURIComponent(word)}`);
      return response.data;
    }
  }
}; 