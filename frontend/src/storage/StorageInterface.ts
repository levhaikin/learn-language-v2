import { WordAttempt } from '../types/history';
import { UserState } from '../types/scores';
 
export interface StorageInterface {
  saveAttempt(attempt: WordAttempt): Promise<void>;
  saveUserState(state: UserState): Promise<void>;
  getUserState(): Promise<UserState | null>;
  getAllAttempts(): Promise<WordAttempt[]>;
}
