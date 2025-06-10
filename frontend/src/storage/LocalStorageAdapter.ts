import { WordAttempt } from '../types/history';
import { UserScores } from '../types/scores';
import { StorageInterface } from './StorageInterface';

interface LocalStorageOptions {
  prefix?: string;
}

export class LocalStorageAdapter implements StorageInterface {
  private readonly storageKey: string;
  private readonly scoresKey: string;

  constructor(options?: LocalStorageOptions) {
    const prefix = options?.prefix || '';
    this.storageKey = `${prefix}word_attempts`;
    this.scoresKey = `${prefix}user_scores`;
  }

  async saveAttempt(attempt: WordAttempt): Promise<void> {
    try {
      // Get existing attempts
      const existingData = localStorage.getItem(this.storageKey);
      const attempts: WordAttempt[] = existingData ? JSON.parse(existingData) : [];

      // Add new attempt
      attempts.push(attempt);

      // Save back to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(attempts));
    } catch (error) {
      console.error('Failed to save attempt to localStorage:', error);
      throw new Error('Storage operation failed');
    }
  }

  async saveUserScores(scores: UserScores): Promise<void> {
    try {
      localStorage.setItem(this.scoresKey, JSON.stringify({
        ...scores,
        lastUpdated: Date.now() // Ensure the timestamp is current
      }));
    } catch (error) {
      console.error('Failed to save user scores to localStorage:', error);
      throw new Error('Storage operation failed');
    }
  }

  async getUserScores(): Promise<UserScores | null> {
    try {
      const data = localStorage.getItem(this.scoresKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get user scores from localStorage:', error);
      return null;
    }
  }

  // Helper method to clear all data (useful for testing)
  clear(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.scoresKey);
  }

  // Helper method to get all attempts (now async for interface compatibility)
  async getAllAttempts(): Promise<WordAttempt[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get attempts from localStorage:', error);
      return [];
    }
  }
}
