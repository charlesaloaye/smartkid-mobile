import * as Speech from 'expo-speech';

/**
 * Language preference order for a Nigerian-sounding voice.
 * - en-NG  → Native Nigerian English (best, but rarely pre-installed)
 * - en-IN  → Indian English (closest widely-available warm accent)
 * - en-ZA  → South African English (another African English option)
 * - en-AU  → Australian English (warm, non-British fallback)
 * - en-GB  → British English (system fallback)
 */
const PREFERRED_LOCALES = ['en-NG', 'en-IN', 'en-ZA', 'en-AU', 'en-GB'];

/**
 * Speech parameters that make the voice sound warm, clear, and child-friendly.
 * Slightly slower rate and a touch warmer pitch than robotic defaults.
 */
export const NIGERIAN_SPEECH_PARAMS = {
  rate: 0.88,
  pitch: 1.05,
};

let cachedVoiceId: string | null | undefined = undefined; // undefined = not yet resolved

/**
 * Resolves and caches the best available voice identifier for Nigerian-sounding English.
 * Falls back gracefully if specific voices are not installed on the device.
 */
export async function getNigerianVoiceId(): Promise<string | undefined> {
  if (cachedVoiceId !== undefined) return cachedVoiceId ?? undefined;

  try {
    const available = await Speech.getAvailableVoicesAsync();

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

    // Last resort: any English voice
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
 * Speaks text using the best available Nigerian English voice.
 * Resolves the voice on first call and caches it for all subsequent calls.
 */
export async function speakNigerian(text: string, options: NigerianSpeakOptions = {}): Promise<void> {
  const voiceId = await getNigerianVoiceId();

  Speech.speak(text, {
    ...NIGERIAN_SPEECH_PARAMS,
    ...(voiceId ? { voice: voiceId } : { language: 'en-NG' }),
    ...options,
  });
}
