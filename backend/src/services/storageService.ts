import { sql } from '../config/database';
import { WordAttempt } from '../types/WordAttempt';
import { UserState } from '../types/UserState';

export class StorageService {
  async saveAttempt(userId: number, attempt: WordAttempt): Promise<void> {
    try {
      await sql`
        INSERT INTO user_attempts (
          user_id, word, user_answer, is_correct, "timestamp", time_taken,
          accuracy_points, speed_points, category, hint_used, attempts_count
        ) VALUES (
          ${userId}, ${attempt.word}, ${attempt.userAnswer}, ${attempt.isCorrect},
          ${attempt.timestamp}, ${attempt.timeTaken}, ${attempt.accuracyPoints},
          ${attempt.speedPoints}, ${attempt.category}, ${attempt.hintUsed},
          ${attempt.attemptsCount}
        )
      `;
    } catch (error) {
      console.error('Error saving attempt to database:', error);
      throw new Error('Failed to save attempt.');
    }
  }

  async getAllAttempts(userId: number): Promise<WordAttempt[]> {
    try {
      const result = await sql`
        SELECT
          word, user_answer, is_correct,
          "timestamp", time_taken, accuracy_points,
          speed_points, category, hint_used,
          attempts_count
        FROM user_attempts
        WHERE user_id = ${userId}
        ORDER BY "timestamp" DESC
      `;
      return result.map(row => ({
        word: row.word,
        userAnswer: row.user_answer,
        isCorrect: row.is_correct,
        timestamp: Number(row.timestamp),
        timeTaken: row.time_taken,
        accuracyPoints: row.accuracy_points,
        speedPoints: row.speed_points,
        category: row.category,
        hintUsed: row.hint_used,
        attemptsCount: row.attempts_count,
      }));
    } catch (error) {
      console.error('Error retrieving attempts from database:', error);
      throw new Error('Failed to retrieve attempts.');
    }
  }

  async saveUserState(userId: number, state: UserState): Promise<void> {
    try {
      await sql`
        INSERT INTO user_state (user_id, accuracy_points, speed_points, owned_items, timestamp)
        VALUES (${userId}, ${state.accuracyPoints}, ${state.speedPoints}, ${JSON.stringify(state.ownedItems)}, ${state.timestamp})
        ON CONFLICT (user_id)
        DO UPDATE SET
          accuracy_points = EXCLUDED.accuracy_points,
          speed_points = EXCLUDED.speed_points,
          owned_items = EXCLUDED.owned_items,
          timestamp = EXCLUDED.timestamp
      `;
    } catch (error) {
      console.error('Error saving user state to database:', error);
      throw new Error('Failed to save user state.');
    }
  }

  async getUserState(userId: number): Promise<UserState | null> {
    try {
      const result = await sql`
        SELECT
          accuracy_points,
          speed_points,
          owned_items,
          timestamp
        FROM user_state
        WHERE user_id = ${userId}
      `;
      if (result.length === 0) {
        return null;
      }
      const row = result[0];
      return {
        accuracyPoints: row.accuracy_points,
        speedPoints: row.speed_points,
        ownedItems: row.owned_items ? JSON.parse(row.owned_items) : [],
        timestamp: Number(row.timestamp),
      };
    } catch (error) {
      console.error('Error retrieving user state from database:', error);
      throw new Error('Failed to retrieve user state.');
    }
  }
} 