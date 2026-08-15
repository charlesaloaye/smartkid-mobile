import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { speakNigerian } from '../../utils/speechUtils';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Icon } from '../../components/Icon';
import { colors, radii, type } from '../../theme';
import { extractErrorMessage } from '../../api/client';
import { showToast } from '../../utils/toast';
import type { Message } from '../../api/types';

type Status = 'listening' | 'thinking' | 'speaking' | 'error';

type Props = {
  childName: string;
  subject?: string;
  initialLongTalk?: boolean;
  onClose: () => void;
  onResult: (userMsg: Message, aiMsg: Message) => void;
  sendVoice: (uri: string) => Promise<{ message: Message; reply: Message; audio_url?: string; audio_base64?: string }>;
};

function Waveform({ active }: { active: boolean }) {
  const bars = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const loops = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, { toValue: 1, duration: 280 + i * 60, useNativeDriver: true }),
          Animated.timing(bar, { toValue: 0.3, duration: 280 + i * 60, useNativeDriver: true }),
        ])
      )
    );
    if (active) loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, bars]);

  return (
    <View style={styles.waveform}>
      {bars.map((bar, i) => (
        <Animated.View key={i} style={[styles.waveBar, { transform: [{ scaleY: bar }], opacity: active ? 1 : 0.35 }]} />
      ))}
    </View>
  );
}

export function VoiceMode({ childName, subject, initialLongTalk = false, onClose, onResult, sendVoice }: Props) {
  const [status, setStatus] = useState<Status>('listening');
  const [isLongTalk, setIsLongTalk] = useState(initialLongTalk);
  const [caption, setCaption] = useState('');
  const [silenceDetected, setSilenceDetected] = useState(false);
  const mountedRef = useRef(true);
  const closingRef = useRef(false);
  const sendingRef = useRef(false);
  const hasSpokenRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const peakMeteringRef = useRef<number>(-60);

  const recorderOptions = useMemo(
    () => ({
      ...RecordingPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    }),
    []
  );
  const recorder = useAudioRecorder(recorderOptions);
  // Poll state every 80ms for near-instant level detection
  const recorderState = useAudioRecorderState(recorder, 80);

  const orbScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    mountedRef.current = true;
    beginListening();
    return () => {
      mountedRef.current = false;
      closingRef.current = true;
      Speech.stop();
      recorder.stop().catch(() => {});
      setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale, { toValue: status === 'thinking' ? 1.04 : 1.12, duration: 700, useNativeDriver: true }),
        Animated.timing(orbScale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [status, orbScale]);

  // Silence detection & Auto-sending with 850ms quick pickup threshold & adaptive VAD
  useEffect(() => {
    if (status !== 'listening' || sendingRef.current) return;

    const { isRecording, durationMillis, metering } = recorderState;
    // Lower min recording buffer from 1200ms to 400ms for short responses ("Yes", "Option B", "12")
    if (!isRecording || durationMillis < 400) return;

    // Quick Mode silence: 850ms, Long Talk: 1800ms
    const SILENCE_DURATION_MS = isLongTalk ? 1800 : 850;
    const BASE_SILENCE_THRESHOLD = isLongTalk ? -38 : -32;

    if (metering !== undefined) {
      if (metering > peakMeteringRef.current) {
        peakMeteringRef.current = metering;
      }

      // Dynamic speech threshold based on peak speech volume vs room floor
      const dynamicSpeechThreshold = Math.max(BASE_SILENCE_THRESHOLD, peakMeteringRef.current - 14);

      if (metering > dynamicSpeechThreshold) {
        hasSpokenRef.current = true;
        silenceStartRef.current = null;
        if (silenceDetected) setSilenceDetected(false);
      } else if (hasSpokenRef.current) {
        if (silenceStartRef.current === null) {
          silenceStartRef.current = Date.now();
        } else if (Date.now() - silenceStartRef.current >= SILENCE_DURATION_MS) {
          sendingRef.current = true;
          setSilenceDetected(true);
          finishAndSend();
        }
      }
    }
  }, [status, recorderState, isLongTalk, silenceDetected]);

  const beginListening = async () => {
    if (closingRef.current || !mountedRef.current) return;
    try {
      hasSpokenRef.current = false;
      silenceStartRef.current = null;
      sendingRef.current = false;
      peakMeteringRef.current = -60;
      setSilenceDetected(false);

      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        showToast.error('Enable microphone access in Settings so your child can talk to Ada.', 'Microphone Needed');
        onClose();
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      if (mountedRef.current) {
        setStatus('listening');
        setCaption('');
      }
    } catch (e) {
      if (mountedRef.current) {
        setStatus('error');
        setCaption(extractErrorMessage(e));
      }
    }
  };

  const finishAndSend = async () => {
    if (closingRef.current || !mountedRef.current) return;
    sendingRef.current = true;
    try {
      await recorder.stop();
    } catch {
      // recorder may already be stopped
    }

    const uri = recorder.uri;
    if (!uri) {
      sendingRef.current = false;
      hasSpokenRef.current = false;
      silenceStartRef.current = null;
      setSilenceDetected(false);
      if (mountedRef.current) {
        setStatus('listening');
      }
      return;
    }

    if (mountedRef.current) {
      setStatus('thinking');
      setCaption('');
    }

    try {
      const res = await sendVoice(uri);
      if (!mountedRef.current || closingRef.current) return;
      onResult(res.message, res.reply);
      setStatus('speaking');
      setCaption(res.reply.message);
      Speech.stop();
      speakNigerian(res.reply.message, {
        onDone: () => {
          if (mountedRef.current && !closingRef.current) {
            setTimeout(() => beginListening(), 250);
          }
        },
        onError: () => {
          if (mountedRef.current && !closingRef.current) {
            setTimeout(() => beginListening(), 250);
          }
        },
      });
    } catch (e) {
      if (!mountedRef.current) return;
      setStatus('error');
      setCaption(extractErrorMessage(e));
    }
  };

  const handleClose = () => {
    closingRef.current = true;
    Speech.stop();
    onClose();
  };

  const statusLabel =
    status === 'listening'
      ? silenceDetected
        ? 'Got it! Sending to Ada…'
        : isLongTalk
        ? 'Ada is listening (Long Talk)…'
        : 'Ada is listening…'
    : status === 'thinking' ? 'Ada is thinking…'
    : status === 'speaking' ? 'Ada'
    : 'Something went wrong';

  const orbColors: [string, string] =
    status === 'error' ? [colors.coral, '#b8441f']
    : status === 'thinking' ? [colors.mutedLight, colors.muted]
    : silenceDetected ? [colors.sage, colors.teal]
    : isLongTalk ? [colors.amber, colors.amberDark]
    : [colors.amberLight, colors.amber];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.subjectPill}>
          <Text style={styles.subjectPillText}>{subject ? `${childName} · ${subject}` : childName}</Text>
        </View>

        <Pressable
          style={[styles.modeToggle, isLongTalk && styles.modeToggleActive]}
          onPress={() => setIsLongTalk((prev) => !prev)}
          hitSlop={8}
        >
          <Icon name={isLongTalk ? 'lock' : 'sparkle'} size={12} color={isLongTalk ? colors.amberDark : colors.white} />
          <Text style={[styles.modeToggleText, isLongTalk && styles.modeToggleTextActive]}>
            {isLongTalk ? 'Long Talk' : 'Quick Mode'}
          </Text>
        </Pressable>

        <Pressable style={styles.iconBtn} onPress={handleClose} hitSlop={10}>
          <Icon name="x" size={16} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale: orbScale }] }}>
          <Pressable
            onPress={() => {
              if (status === 'listening') {
                sendingRef.current = true;
                setSilenceDetected(true);
                finishAndSend();
              }
            }}
          >
            <LinearGradient colors={orbColors} start={{ x: 0.2, y: 0.1 }} end={{ x: 1, y: 1 }} style={styles.orb} />
          </Pressable>
        </Animated.View>

        <Text style={styles.statusText}>{statusLabel}</Text>

        {status === 'listening' && (
          <Text style={styles.tapTipText}>Tap orb or button anytime to send instantly</Text>
        )}

        {!!caption && (
          <Text style={styles.caption} numberOfLines={4}>
            {status === 'speaking' ? `"${caption}"` : caption}
          </Text>
        )}

        <Waveform active={status === 'listening' || status === 'speaking'} />
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.sideBtn} onPress={handleClose} hitSlop={10}>
          <Icon name="chat" size={18} color={colors.white} />
        </Pressable>

        <Pressable
          style={[styles.mainBtn, status === 'thinking' && { opacity: 0.5 }]}
          onPress={() => {
            if (status === 'speaking') {
              Speech.stop();
              beginListening();
            } else if (status === 'listening') {
              sendingRef.current = true;
              setSilenceDetected(true);
              finishAndSend();
            } else if (status === 'error') {
              beginListening();
            }
          }}
          disabled={status === 'thinking'}
          accessibilityLabel={status === 'speaking' ? 'Pause speaking and listen' : status === 'listening' ? 'Send voice message' : 'Start listening'}
        >
          <Icon name={status === 'speaking' ? 'pause' : status === 'listening' ? 'phone-end' : 'mic'} size={22} color={colors.white} />
        </Pressable>

        <Pressable style={styles.sideBtn} onPress={handleClose} hitSlop={10}>
          <Icon name="x" size={18} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navyDark },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  subjectPill: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 },
  subjectPillText: { fontFamily: type.bodySemi, fontSize: 11.5, color: 'rgba(255,255,255,0.85)' },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modeToggleActive: {
    backgroundColor: colors.amberLight,
  },
  modeToggleText: {
    fontFamily: type.bodyBold,
    fontSize: 11.5,
    color: colors.white,
  },
  modeToggleTextActive: {
    color: colors.amberDark,
  },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  orb: { width: 128, height: 128, borderRadius: 64 },
  statusText: { fontFamily: type.displaySemi, fontSize: 16, color: colors.white, marginTop: 22, textAlign: 'center' },
  tapTipText: { fontFamily: type.body, fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginTop: 6, textAlign: 'center' },
  caption: { fontFamily: type.body, fontSize: 13.5, lineHeight: 20, color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: 12 },

  waveform: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 24, marginTop: 22 },
  waveBar: { width: 3, height: 22, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.6)' },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 26, paddingBottom: 30, paddingTop: 10 },
  sideBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  mainBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
});
