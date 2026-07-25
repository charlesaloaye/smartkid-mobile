import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { clearToken, getToken, saveToken } from '../api/client';
import { fetchCurrentUser, loginParent, logoutParent, registerParent } from '../api/endpoints';
import type { User } from '../api/types';

const ONBOARDING_KEY = 'smartkid_onboarding_seen';
export const BIOMETRICS_ENABLED_KEY = '@smartkid_biometrics_enabled';

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  authEntryScreen: 'Login' | 'Register';
  user: User | null;
  completeOnboarding: (entry?: 'Login' | 'Register') => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    consent: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: User) => void;
  refreshUser: () => Promise<void>;
  loginWithBiometrics: () => Promise<boolean>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [authEntryScreen, setAuthEntryScreen] = useState<'Login' | 'Register'>('Login');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const [token, seen] = await Promise.all([
        getToken(),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);
      setHasSeenOnboarding(seen === 'true');

      if (token) {
        try {
          const me = await fetchCurrentUser();
          setUser(me);
          setIsAuthenticated(true);
        } catch {
          await clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const completeOnboarding = useCallback(async (entry: 'Login' | 'Register' = 'Login') => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setAuthEntryScreen(entry);
    setHasSeenOnboarding(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginParent({ email, password });
    await saveToken(res.access_token);
    const me = await fetchCurrentUser();
    setUser(me);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
      consent: boolean;
    }) => {
      const res = await registerParent(payload);
      await saveToken(res.access_token);
      const me = await fetchCurrentUser();
      setUser(me);
      setIsAuthenticated(true);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await logoutParent();
    } catch {
      // token may already be invalid server-side; clear locally regardless
    }
    await clearToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await fetchCurrentUser();
      setUser(me);
    } catch {
      // keep current state if offline
    }
  }, []);

  const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      throw new Error('Biometric authentication is not supported or set up on this device.');
    }

    const token = await getToken();
    if (!token) {
      throw new Error('No saved login session found. Please log in with email and password first.');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Log in to SmartKid Tutor',
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      const me = await fetchCurrentUser();
      setUser(me);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      hasSeenOnboarding,
      authEntryScreen,
      user,
      completeOnboarding,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      loginWithBiometrics,
    }),
    [
      isLoading,
      isAuthenticated,
      hasSeenOnboarding,
      authEntryScreen,
      user,
      completeOnboarding,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      loginWithBiometrics,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
