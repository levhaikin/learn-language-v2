import { HistoryStorage } from './HistoryStorage';
import { StorageFactory } from './storageFactory';
import storageConfig from '../config/storage';
 
// Create a singleton instance of the storage adapter using the factory and config
export const historyStorage: HistoryStorage = StorageFactory.createStorage(
  storageConfig.type,
  storageConfig.options
); 