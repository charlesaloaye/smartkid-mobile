import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Laravel backend base URL.
//   iOS Simulator can reach the host Mac directly via localhost.
//   Android emulator needs 10.0.2.2 to reach the host's localhost.
//   A physical device needs your machine's LAN IP — override with EXPO_PUBLIC_API_URL.
import { Platform } from 'react-native';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEV_PORT = process.env.EXPO_PUBLIC_API_PORT ?? '8010';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${DEV_HOST}:${DEV_PORT}/api`;

const TOKEN_KEY = 'smartkid_auth_token';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return 'Request timed out connecting to the server. Please check your backend server.';
    }
    const data = err.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (first?.[0]) return first[0];
    }
    if (data?.message) return data.message;
    if (err.message === 'Network Error') {
      return 'Cannot reach the SmartKid server. Check your connection and try again.';
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (typeof err === 'string' && err.trim().length > 0) {
    return err;
  }
  return 'Something went wrong. Please try again.';
}
