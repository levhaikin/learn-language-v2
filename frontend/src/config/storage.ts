export type StorageType = 'localStorage' | 'backend';

interface StorageConfig {
  type: StorageType;
  options?: {
    prefix?: string;
  };
}

// Default configuration
const backendStorageConfig: StorageConfig = {
  type: 'backend',
  options: {
    prefix: 'english_learning_',
  }
};

// Default configuration
const localStorageConfig: StorageConfig = {
  type: 'localStorage',
  options: {
    prefix: 'english_learning_',
  }
};

const config = backendStorageConfig;

export default config; 