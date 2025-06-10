import axios from 'axios';
import { StorageInterface } from '../../storage/StorageInterface';
import { WordAttempt } from '../../types/history';
import { UserScores } from '../../types/scores';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// This should be the same instance used in other services to ensure consistency
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class BackendServerStorageAdapter implements StorageInterface {
  async saveAttempt(attempt: WordAttempt): Promise<void> {
    try {
      await axiosInstance.post('/storage/attempts', attempt);
    } catch (error) {
      console.error('Failed to save attempt to backend:', error);
      // Depending on the desired behavior, we might want to throw the error
      // or handle it gracefully (e.g., fallback to local storage).
      throw new Error('Failed to save attempt.');
    }
  }

  async getAllAttempts(): Promise<WordAttempt[]> {
    try {
      const response = await axiosInstance.get<WordAttempt[]>('/storage/attempts');
      return response.data;
    } catch (error) {
      console.error('Failed to get attempts from backend:', error);
      return [];
    }
  }

  async saveUserScores(scores: UserScores): Promise<void> {
    try {
      await axiosInstance.post('/storage/scores', scores);
    } catch (error) {
      console.error('Failed to save user scores to backend:', error);
      throw new Error('Failed to save user scores.');
    }
  }

  async getUserScores(): Promise<UserScores | null> {
    try {
      const response = await axiosInstance.get<UserScores>('/storage/scores');
      return response.data;
    } catch (error) {
      console.error('Failed to get user scores from backend:', error);
      // For a GET request, returning null on failure is often a safe default.
      return null;
    }
  }
} 