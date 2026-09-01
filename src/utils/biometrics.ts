/**
 * Safe wrapper around expo-local-authentication.
 * Handles environments where the native module is unavailable (e.g. Expo Go or older native builds)
 * without crashing bundle initialization.
 */

let localAuthModule: typeof import('expo-local-authentication') | null = null;
try {
  localAuthModule = require('expo-local-authentication');
} catch {
  localAuthModule = null;
}

export const Biometrics = {
  isSupported(): boolean {
    return !!localAuthModule;
  },

  async hasHardwareAsync(): Promise<boolean> {
    try {
      if (!localAuthModule) return false;
      return await localAuthModule.hasHardwareAsync();
    } catch {
      return false;
    }
  },

  async isEnrolledAsync(): Promise<boolean> {
    try {
      if (!localAuthModule) return false;
      return await localAuthModule.isEnrolledAsync();
    } catch {
      return false;
    }
  },

  async supportedAuthenticationTypesAsync(): Promise<number[]> {
    try {
      if (!localAuthModule) return [];
      return await localAuthModule.supportedAuthenticationTypesAsync();
    } catch {
      return [];
    }
  },

  async authenticateAsync(options?: {
    promptMessage?: string;
    fallbackLabel?: string;
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
  }) {
    try {
      if (!localAuthModule) {
        return { success: false, error: 'Biometrics not supported on this client.' };
      }
      return await localAuthModule.authenticateAsync(options);
    } catch (e: any) {
      return { success: false, error: e?.message || 'Biometrics authentication failed.' };
    }
  },
};

export default Biometrics;
