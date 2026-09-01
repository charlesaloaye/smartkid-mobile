import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Sanitize keys for compatibility with SecureStore.
 * SecureStore keys only accept alphanumeric characters, '.', '-', and '_'.
 */
function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
}

const memoryStore = new Map<string, string>();

/**
 * Universal async storage wrapper using Expo SecureStore for native platforms
 * and localStorage / in-memory fallback for Web / fallback environments.
 */
export const appStorage = {
  async getItem(key: string): Promise<string | null> {
    const safeKey = sanitizeKey(key);
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(safeKey) : (memoryStore.get(safeKey) ?? null);
      }
      return await SecureStore.getItemAsync(safeKey);
    } catch {
      return memoryStore.get(safeKey) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    const safeKey = sanitizeKey(key);
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(safeKey, value);
        } else {
          memoryStore.set(safeKey, value);
        }
        return;
      }
      await SecureStore.setItemAsync(safeKey, value);
    } catch {
      memoryStore.set(safeKey, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    const safeKey = sanitizeKey(key);
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(safeKey);
        } else {
          memoryStore.delete(safeKey);
        }
        return;
      }
      await SecureStore.deleteItemAsync(safeKey);
    } catch {
      memoryStore.delete(safeKey);
    }
  },
};

export default appStorage;
