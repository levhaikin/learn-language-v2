export interface WordAttempt {
  // Basic attempt information
  word: string;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;  // Unix timestamp in milliseconds

  // Performance metrics
  timeTaken: number;  // Time in milliseconds
  accuracyPoints: number;
  speedPoints: number;

  // Additional context
  category: string;
  hintUsed: boolean;
  attemptsCount: number;  // How many tries for this word in this session
}

export interface SessionHistory {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalPoints: number;
  attempts: WordAttempt[];
}

export interface UserHistory {
  userId: string;
  sessions: SessionHistory[];
  
  // Aggregate statistics
  totalWordsAttempted: number;
  correctWords: number;
  averageAccuracy: number;
  averageTimePerWord: number;
  totalPoints: number;
  
  // Tracking progress by category
  categoryStats: {
    [category: string]: {
      attempted: number;
      correct: number;
      averageTime: number;
      totalPoints: number;
    };
  };
} 