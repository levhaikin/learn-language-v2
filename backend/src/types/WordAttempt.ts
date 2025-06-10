export interface WordAttempt {
  word: string;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;
  timeTaken: number;
  accuracyPoints: number;
  speedPoints: number;
  category: string;
  hintUsed: boolean;
  attemptsCount: number;
} 