import { StorageInterface } from './StorageInterface';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { StorageType } from '../config/storage';
import { BackendServerStorageAdapter } from '../services/storage/BackendServerStorageAdapter';

export class StorageFactory {
  static createStorage(type: StorageType, options?: any): StorageInterface {
    switch (type) {
      case 'backend':
        return new BackendServerStorageAdapter();
      case 'localStorage':
        return new LocalStorageAdapter(options);
      default:
        // Default to localStorage if type is not recognized
        console.warn(`Storage type "${type}" not recognized, falling back to localStorage`);
        return new LocalStorageAdapter(options);
    }
  }
} 