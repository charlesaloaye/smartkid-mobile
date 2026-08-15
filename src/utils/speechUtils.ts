import * as Speech from 'expo-speech';

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

  try {
    const available = await Speech.getAvailableVoicesAsync();

    if (!available || available.length === 0) {
      cachedVoiceId = null;
      return undefined;
    }

    // 1. Try finding enhanced quality voices matching preferred locales
    for (const locale of PREFERRED_LOCALES) {
      const match = available.find(
        (v) =>
          (v.language === locale || v.language?.startsWith(locale)) &&
          (v.quality === Speech.VoiceQuality.Enhanced || (v.quality as string) === 'enhanced' || (v as any).quality === 'premium')
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

export type NigerianSpeakOptions = Omit<Speech.SpeechOptions, 'voice' | 'language' | 'rate' | 'pitch'> & {
  onDone?: () => void;
  onError?: () => void;
};

/**
 * Speaks text using the best available voice with natural cadence and text sanitization.
 */
export async function speakNigerian(text: string, options: NigerianSpeakOptions = {}): Promise<void> {
  const spokenText = prepareTextForSpeech(text);
  if (!spokenText) {
    options.onDone?.();
    return;
  }

  const voiceId = await getNigerianVoiceId();

  Speech.speak(spokenText, {
    ...NIGERIAN_SPEECH_PARAMS,
    ...(voiceId ? { voice: voiceId } : { language: 'en-NG' }),
    ...options,
  });
}

