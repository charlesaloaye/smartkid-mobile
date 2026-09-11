import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import appStorage from '../utils/storage';
import Biometrics from '../utils/biometrics';
import { clearToken, getToken, saveToken } from '../api/client';
import {
  fetchCurrentChild,
  fetchCurrentUser,
  loginChild as loginChildApi,
  loginParent,
  logoutParent,
  registerParent,
  socialLogin,
} from '../api/endpoints';
import type { Child, User } from '../api/types';

const ONBOARDING_KEY = 'smartkid_onboarding_seen';
export const BIOMETRICS_ENABLED_KEY = 'smartkid_biometrics_enabled';
const AUTH_ROLE_KEY = 'smartkid_auth_role';

type AuthRole = 'parent' | 'child' | null;

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  authEntryScreen: 'Login' | 'Register';
  role: AuthRole;
  user: User | null;
  childUser: Child | null;
  completeOnboarding: (entry?: 'Login' | 'Register') => Promise<void>;
  resetOnboarding: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginChild: (username: string, password: string) => Promise<void>;
  loginWithSocial: (payload: {
    provider: 'google' | 'apple';
    email: string;
    name?: string;
    provider_id: string;
  }) => Promise<void>;
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
  const [role, setRole] = useState<AuthRole>(null);
  const [user, setUser] = useState<User | null>(null);
  const [childUser, setChildUser] = useState<Child | null>(null);

  useEffect(() => {
    (async () => {
      const [token, seen, savedRole] = await Promise.all([
        getToken(),
        appStorage.getItem(ONBOARDING_KEY),
        appStorage.getItem(AUTH_ROLE_KEY),
      ]);
      setHasSeenOnboarding(seen === 'true');

      if (token) {
        try {
          if (savedRole === 'child') {
            const meChild = await fetchCurrentChild();
            setChildUser(meChild.child);
            setRole('child');
            setIsAuthenticated(true);
          } else {
            const me = await fetchCurrentUser();
            setUser(me);
            setRole('parent');
            setIsAuthenticated(true);
          }
        } catch {
          await clearToken();
          await appStorage.removeItem(AUTH_ROLE_KEY);
          setRole(null);
          setUser(null);
          setChildUser(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const completeOnboarding = useCallback(async (entry: 'Login' | 'Register' = 'Login') => {
    await appStorage.setItem(ONBOARDING_KEY, 'true');
    setAuthEntryScreen(entry);
    setHasSeenOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await appStorage.removeItem(ONBOARDING_KEY);
    setHasSeenOnboarding(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginParent({ email, password });
    await saveToken(res.access_token);
    await appStorage.setItem(AUTH_ROLE_KEY, 'parent');
    const me = await fetchCurrentUser();
    setUser(me);
    setChildUser(null);
    setRole('parent');
    setIsAuthenticated(true);
  }, []);

  const loginChild = useCallback(async (username: string, password: string) => {
    const res = await loginChildApi({ username, password });
    await saveToken(res.access_token);
    await appStorage.setItem(AUTH_ROLE_KEY, 'child');
    setChildUser(res.child);
    setUser(null);
    setRole('child');
    setIsAuthenticated(true);
  }, []);

  const loginWithSocial = useCallback(
    async (payload: {
      provider: 'google' | 'apple';
      email: string;
      name?: string;
      provider_id: string;
    }) => {
      const res = await socialLogin(payload);
      await saveToken(res.access_token);
      await appStorage.setItem(AUTH_ROLE_KEY, 'parent');
      const me = await fetchCurrentUser();
      setUser(me);
      setChildUser(null);
      setRole('parent');
      setIsAuthenticated(true);
    },
    []
  );

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
      await appStorage.setItem(AUTH_ROLE_KEY, 'parent');
      const me = await fetchCurrentUser();
      setUser(me);
      setChildUser(null);
      setRole('parent');
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
    await appStorage.removeItem(AUTH_ROLE_KEY);
    setUser(null);
    setChildUser(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      if (role === 'child') {
        const me = await fetchCurrentChild();
        setChildUser(me.child);
      } else {
        const me = await fetchCurrentUser();
        setUser(me);
      }
    } catch {
      // keep current state if offline
    }
  }, [role]);

  const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
    const hasHardware = await Biometrics.hasHardwareAsync();
    const isEnrolled = await Biometrics.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      throw new Error('Biometric authentication is not supported or set up on this device.');
    }

    const token = await getToken();
    if (!token) {
      throw new Error('No saved login session found. Please log in with email and password first.');
    }

    const result = await Biometrics.authenticateAsync({
      promptMessage: 'Log in to SmartKid Tutor',
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      const savedRole = await appStorage.getItem(AUTH_ROLE_KEY);
      if (savedRole === 'child') {
        const meChild = await fetchCurrentChild();
        setChildUser(meChild.child);
        setRole('child');
      } else {
        const me = await fetchCurrentUser();
        setUser(me);
        setRole('parent');
      }
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
      role,
      user,
      childUser,
      completeOnboarding,
      resetOnboarding,
      login,
      loginChild,
      loginWithSocial,
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
      role,
      user,
      childUser,
      completeOnboarding,
      resetOnboarding,
      login,
      loginChild,
      loginWithSocial,
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

