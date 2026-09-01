/**
 * Safe wrapper around expo-speech with natural cadence and fallbacks.
 * Prevents app crashing if ExpoSpeech native module is unavailable.
 */

let SpeechModule: typeof import('expo-speech') | null = null;
try {
  SpeechModule = require('expo-speech');
} catch {
  SpeechModule = null;
}

/**
 * Language preference order for a natural African / international English voice.
 * Priority given to Nigerian English and warm, clear accents.
 */
const PREFERRED_LOCALES = ['en-NG', 'en-GH', 'en-ZA', 'en-GB', 'en-US', 'en-AU', 'en-IN'];

/**
 * Optimized speech parameters for a natural human cadence.
 * Rate 0.96 provides natural conversational speed instead of robotic drag.
 */
export const NIGERIAN_SPEECH_PARAMS = {
  rate: 0.96,
  pitch: 1.02,
};

let cachedVoiceId: string | null | undefined = undefined; // undefined = not yet resolved

export function isSpeechAvailable(): boolean {
  return !!SpeechModule;
}

/**
 * Prepares raw message text for TTS by stripping markdown syntax,
 * converting math notation into spoken words, and ensuring natural pauses.
 */
export function prepareTextForSpeech(text: string): string {
  if (!text) return '';

  let clean = text;

  // 1. Remove markdown bold, italic, headings, code blocks
  clean = clean.replace(/```[\s\S]*?```/g, ''); // code blocks
  clean = clean.replace(/`([^`]+)`/g, '$1'); // inline code
  clean = clean.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1');
  clean = clean.replace(/\*([^*]+)\*/g, '$1');
  clean = clean.replace(/_([^_]+)_/g, '$1');
  clean = clean.replace(/^#+\s+/gm, ''); // headings
  clean = clean.replace(/^[\s-]*[•*-]\s+/gm, ''); // bullet list items

  // 2. Convert common LaTeX / Math formulas into readable spoken words
  clean = clean.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2');
  clean = clean.replace(/\^2/g, ' squared');
  clean = clean.replace(/\^3/g, ' cubed');
  clean = clean.replace(/\\times|\*/g, ' times ');
  clean = clean.replace(/\\div|\//g, ' divided by ');
  clean = clean.replace(/\\pm/g, ' plus or minus ');
  clean = clean.replace(/=/g, ' equals ');
  clean = clean.replace(/\\approx/g, ' is approximately ');
  clean = clean.replace(/\\le|<=/g, ' is less than or equal to ');
  clean = clean.replace(/\\ge|>=/g, ' is greater than or equal to ');
  clean = clean.replace(/[\$\\]/g, ''); // strip inline $ and \

  // 3. Remove web links / emojis that disrupt speech
  clean = clean.replace(/https?:\/\/\S+/g, '');

  // 4. Normalize spaces and ensure sentence pause spacing
  clean = clean.replace(/\s+/g, ' ').trim();
  clean = clean.replace(/([.!?])\s*/g, '$1 ');

  return clean;
}

/**
 * Resolves and caches the best available voice identifier for natural English speech.
 * Prefers enhanced/high-quality voices if available.
 */
export async function getNigerianVoiceId(): Promise<string | undefined> {
  if (cachedVoiceId !== undefined) return cachedVoiceId ?? undefined;
  if (!SpeechModule) return undefined;

  try {
    const available = await SpeechModule.getAvailableVoicesAsync();

    if (!available || available.length === 0) {
      cachedVoiceId = null;
      return undefined;
    }

    // 1. Try finding enhanced quality voices matching preferred locales
    for (const locale of PREFERRED_LOCALES) {
      const match = available.find(
        (v) =>
          (v.language === locale || v.language?.startsWith(locale)) &&
          (v.quality === SpeechModule?.VoiceQuality?.Enhanced || (v.quality as string) === 'enhanced' || (v as any).quality === 'premium')
      );
      if (match) {
        cachedVoiceId = match.identifier;
        return match.identifier;
      }
    }

    // 2. Fall back to standard matching locale
    for (const locale of PREFERRED_LOCALES) {
      const match = available.find(
        (v) =>
          v.language === locale ||
          v.language?.startsWith(locale) ||
          v.identifier?.toLowerCase().includes(locale.toLowerCase().replace('-', '_'))
      );
      if (match) {
        cachedVoiceId = match.identifier;
        return match.identifier;
      }
    }

    // 3. Last resort: any English voice
    const anyEnglish = available.find((v) => v.language?.startsWith('en'));
    cachedVoiceId = anyEnglish?.identifier ?? null;
    return anyEnglish?.identifier;
  } catch {
    cachedVoiceId = null;
    return undefined;
  }
}

export type NigerianSpeakOptions = {
  onDone?: () => void;
  onError?: (err?: any) => void;
  onStopped?: () => void;
};

/**
 * Speaks text using the best available voice with natural cadence and text sanitization.
 */
export async function speakNigerian(text: string, options: NigerianSpeakOptions = {}): Promise<void> {
  if (!SpeechModule) {
    options.onError?.(new Error('Speech not supported on this client'));
    return;
  }

  const spokenText = prepareTextForSpeech(text);
  if (!spokenText) {
    options.onDone?.();
    return;
  }

  try {
    const voiceId = await getNigerianVoiceId();
    SpeechModule.speak(spokenText, {
      ...NIGERIAN_SPEECH_PARAMS,
      ...(voiceId ? { voice: voiceId } : { language: 'en-NG' }),
      ...options,
    });
  } catch (err) {
    options.onError?.(err);
  }
}

import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

let activeAudioPlayer: AudioPlayer | null = null;

export async function playAudioBase64Async(
  base64Audio: string,
  options: NigerianSpeakOptions = {}
): Promise<void> {
  await stopSpeechAsync();
  try {
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    const uri = base64Audio.startsWith('data:') ? base64Audio : `data:audio/mp3;base64,${base64Audio}`;
    const player = createAudioPlayer({ uri });
    activeAudioPlayer = player;

    player.addListener('playbackStatusUpdate', (status: any) => {
      if (status.didJustFinish) {
        options.onDone?.();
        if (activeAudioPlayer === player) {
          activeAudioPlayer = null;
        }
      }
    });

    player.play();
  } catch (err) {
    options.onError?.(err);
  }
}

export async function stopSpeechAsync(): Promise<void> {
  try {
    if (activeAudioPlayer) {
      activeAudioPlayer.pause();
      activeAudioPlayer.remove();
      activeAudioPlayer = null;
    }
  } catch {
    // Ignore error
  }
  try {
    if (SpeechModule) {
      await SpeechModule.stop();
    }
  } catch {
    // Ignore error
  }
}

export async function isSpeakingAsync(): Promise<boolean> {
  if (activeAudioPlayer?.playing) return true;
  try {
    if (SpeechModule) {
      return await SpeechModule.isSpeakingAsync();
    }
    return false;
  } catch {
    return false;
  }
}
