export type StorageType = 'localStorage' | 'indexedDB' | 'firebase';

interface StorageConfig {
  type: StorageType;
  options?: {
    prefix?: string;
    maxAttempts?: number;
  };
}

// Default configuration
const config: StorageConfig = {
  type: 'localStorage',
  options: {
    prefix: 'english_learning_',
    maxAttempts: 1000
  }
};

export default config; 