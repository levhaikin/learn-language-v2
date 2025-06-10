import { WordAttempt } from '../types/history';
import { UserScores } from '../types/scores';
 
export interface StorageInterface {
  saveAttempt(attempt: WordAttempt): Promise<void>;
  saveUserScores(scores: UserScores): Promise<void>;
  getUserScores(): Promise<UserScores | null>;
  getAllAttempts(): Promise<WordAttempt[]>;
}
