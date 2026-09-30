import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';

export type OtaStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'error';

interface OtaUpdateState {
  status: OtaStatus;
  errorMessage?: string;
}

interface UseOtaUpdateReturn extends OtaUpdateState {
  /** Call this to download + apply the update (will reload the app). */
  applyUpdate: () => Promise<void>;
  /** Dismiss the update banner (until next app foreground). */
  dismiss: () => void;
}

const CHECK_INTERVAL_MS = 30 * 60 * 1000; // re-check every 30 min in background

export function useOtaUpdate(): UseOtaUpdateReturn {
  const [state, setState] = useState<OtaUpdateState>({ status: 'idle' });
  const lastCheckedAt = useRef<number>(0);
  const dismissed = useRef(false);

  async function checkForUpdate() {
    // Skip in Expo Go dev client or if updates are disabled
    if (__DEV__ || !Updates.isEnabled) return;
    if (dismissed.current) return;

    const now = Date.now();
    if (now - lastCheckedAt.current < CHECK_INTERVAL_MS && lastCheckedAt.current !== 0) {
      return;
    }
    lastCheckedAt.current = now;

    setState({ status: 'checking' });
    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        setState({ status: 'available' });
      } else {
        setState({ status: 'idle' });
      }
    } catch {
      // Silently fail — don't surface network/server errors to the user
      setState({ status: 'idle' });
    }
  }

  async function applyUpdate() {
    setState({ status: 'downloading' });
    try {
      await Updates.fetchUpdateAsync();
      setState({ status: 'ready' });
      // Small delay so the user sees the "Restarting…" state before reload
      setTimeout(() => {
        Updates.reloadAsync();
      }, 800);
    } catch (e: any) {
      setState({ status: 'error', errorMessage: e?.message ?? 'Failed to download update.' });
    }
  }

  function dismiss() {
    dismissed.current = true;
    setState({ status: 'idle' });
  }

  useEffect(() => {
    // Check when app comes back to foreground
    const handleAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        dismissed.current = false; // reset dismiss on each foreground
        checkForUpdate();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    // Also check immediately on first mount
    checkForUpdate();

    return () => sub.remove();
  }, []);

  return { ...state, applyUpdate, dismiss };
}
