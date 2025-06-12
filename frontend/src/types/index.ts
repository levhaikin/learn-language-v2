export interface Word {
  word: string;
  image?: string;  // Optional since we'll be loading images dynamically
  pronunciation: string;
  meaning: string;
}

export interface WordStats {
  word: string;
  attempts: number;
  correctAttempts: number;
  attemptTimes: number[];  // Array of times in milliseconds
}

export interface Reward {
  accuracyPoints: number;
  speedPoints: number;
}

export interface StoreItem {
  id: string;
  name: string;
  image: string;
  description: string;
  price: {
    accuracyPoints: number;
    speedPoints: number;
  };
  bonus?: {
    accuracyPoints?: number;
    speedPoints?: number;
  };
}

export interface UserProgress {
  accuracyPoints: number;
  speedPoints: number;
  ownedItems: string[]; // Array of item IDs
} 