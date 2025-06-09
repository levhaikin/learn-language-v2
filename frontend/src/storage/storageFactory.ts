import { HistoryStorage } from './HistoryStorage';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { StorageType } from '../config/storage';

export class StorageFactory {
  static createStorage(type: StorageType, options?: any): HistoryStorage {
    switch (type) {
      case 'localStorage':
        return new LocalStorageAdapter(options);
      case 'indexedDB':
        // Future implementation
        throw new Error('IndexedDB storage not implemented yet');
      case 'firebase':
        // Future implementation
        throw new Error('Firebase storage not implemented yet');
      default:
        // Default to localStorage if type is not recognized
        console.warn(`Storage type "${type}" not recognized, falling back to localStorage`);
        return new LocalStorageAdapter(options);
    }
  }
} 