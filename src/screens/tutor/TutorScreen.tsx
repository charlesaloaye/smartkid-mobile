import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { speakNigerian } from '../../utils/speechUtils';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { colors, radii, type } from '../../theme';
import {
  fetchChildDetail,
  fetchChildren,
  fetchMessages,
  sendTextMessage,
  sendVoiceMessage,
} from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { renderFormattedText } from '../../utils/formatText';
import type { Child, Message } from '../../api/types';
import { VoiceMode } from './VoiceMode';
import { EmptyState } from '../../components/EmptyState';

type ChatMessage = Message | { id: string; sender: 'system'; message: string };

const QUICK_REPLIES = ['Show me an example', 'I understand now', 'Can you explain again?'];

export default function TutorScreen({ navigation, route }: any) {
  const requestedChildId = route?.params?.childId as number | undefined;
  const [children, setChildren] = useState<Child[] | null>(null);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [sendOnEnter, setSendOnEnter] = useState(true);
  const [insight, setInsight] = useState<string | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceLongTalk, setVoiceLongTalk] = useState(false);
  const [isSwipingMic, setIsSwipingMic] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<number | string | null>(null);
  const listRef = useRef<FlatList>(null);

  const micPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        setIsSwipingMic(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < -15) {
          setIsSwipingMic(true);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const isUpSwipe = gestureState.dy < -20;
        setIsSwipingMic(false);
        setVoiceLongTalk(isUpSwipe);
        setVoiceOpen(true);
      },
      onPanResponderTerminate: () => {
        setIsSwipingMic(false);
      },
    })
  ).current;

  useEffect(() => {
    AsyncStorage.getItem('@send_on_enter').then((val) => {
      if (val !== null) setSendOnEnter(val === 'true');
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchChildren();
        setChildren(list);
        const requested = requestedChildId ? list.find((c) => c.id === requestedChildId) : null;
        if (list.length > 0) setActiveChild(requested ?? list[0]);
      } catch {
        setChildren([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!requestedChildId || !children) return;
    const requested = children.find((c) => c.id === requestedChildId);
    if (requested && requested.id !== activeChild?.id) setActiveChild(requested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedChildId]);

  const loadMessages = useCallback(async (childId: number) => {
    try {
      const history = await fetchMessages(childId);
      setMessages(history);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!activeChild) return;
    loadMessages(activeChild.id);
    setInsight(null);
    fetchChildDetail(activeChild.id)
      .then((detail) => setInsight(detail.insight))
      .catch(() => setInsight(null));
  }, [activeChild, loadMessages]);

  const scrollToEnd = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const handleSendText = async () => {
    const text = draft.trim();
    if (!text || !activeChild || sending) return;
    setDraft('');
    setSending(true);

    const optimistic: Message = {
      id: Date.now(),
      child_id: activeChild.id,
      sender: 'child',
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToEnd();

    try {
      const res = await sendTextMessage(activeChild.id, text);
      setMessages((prev) => [...prev.filter((m) => m.id !== optimistic.id), res.message, res.reply]);
    } catch (e) {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimistic.id),
        optimistic,
        { id: `err-${Date.now()}`, sender: 'system', message: extractErrorMessage(e) },
      ]);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  const toggleSpeakMessage = (id: number | string, text: string) => {
    if (speakingMsgId === id) {
      Speech.stop();
      setSpeakingMsgId(null);
    } else {
      Speech.stop();
      setSpeakingMsgId(id);
      speakNigerian(text, {
        onDone: () => setSpeakingMsgId((current) => (current === id ? null : current)),
        onError: () => setSpeakingMsgId((current) => (current === id ? null : current)),
      });
    }
  };

  const sendQuickReply = (text: string) => {
    setDraft(text);
    setTimeout(() => handleSendText(), 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.teal} />
      </SafeAreaView>
    );
  }

  if (!children || children.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="sparkle"
            title="Add a child to chat with Ada"
            description="Once registered, you can chat by text or voice right here in the app."
            actionLabel="Add a child"
            onAction={() => navigation.navigate('AddChild')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ada</Text>
          <Text style={styles.headerSub}>{activeChild?.name}{activeChild?.subjects?.[0] ? ` · ${activeChild.subjects[0]}` : ''}</Text>
        </View>
        <Pill label="Synced with WhatsApp" tone="sage" />
      </View>

      {children.length > 1 && (
        <FlatList
          horizontal
          data={children}
          keyExtractor={(c) => String(c.id)}
          showsHorizontalScrollIndicator={false}
          style={styles.childRow}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const selected = item.id === activeChild?.id;
            return (
              <Pressable
                style={[styles.childChip, selected && styles.childChipSelected]}
                onPress={() => setActiveChild(item)}
              >
                <Text style={[styles.childChipText, selected && styles.childChipTextSelected]}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={styles.messages}
          onContentSizeChange={scrollToEnd}
          ListHeaderComponent={
            insight ? (
              <View style={styles.memoryChip}>
                <Icon name="sparkle" size={12} color={colors.amberDark} />
                <Text style={styles.memoryChipText}>
                  <Text style={{ fontFamily: type.bodyBold }}>Remembers: </Text>
                  {insight}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              compact
              icon="chat"
              title={`Say hello to Ada 👋`}
              description={`Ask a question by text or tap the mic to talk. Everything here also reaches ${activeChild?.name ?? 'your child'} on WhatsApp.`}
            />
          }
          ListFooterComponent={
            !sending && messages.length > 0 && messages[messages.length - 1].sender === 'ai' ? (
              <View style={styles.quickReplies}>
                {QUICK_REPLIES.map((q) => (
                  <Pressable key={q} style={styles.quickChip} onPress={() => sendQuickReply(q)}>
                    <Text style={styles.quickChipText}>{q}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            if (item.sender === 'system') {
              return <Text style={styles.systemText}>{item.message}</Text>;
            }
            const isChild = item.sender === 'child';
            return (
              <View style={[styles.bubbleRow, isChild ? styles.bubbleRowEnd : styles.bubbleRowStart]}>
                {!isChild && (
                  <Pressable
                    onPress={() => toggleSpeakMessage(item.id, item.message)}
                    style={[styles.speakBtn, speakingMsgId === item.id && styles.speakBtnActive]}
                    hitSlop={8}
                    accessibilityLabel={speakingMsgId === item.id ? 'Pause reading message' : 'Play message out loud'}
                  >
                    <Icon
                      name={speakingMsgId === item.id ? 'pause' : 'play'}
                      size={11}
                      color={speakingMsgId === item.id ? colors.amberDark : colors.teal}
                    />
                  </Pressable>
                )}
                <View style={[styles.bubble, isChild ? styles.bubbleChild : styles.bubbleAi]}>
                  {renderFormattedText(
                    item.message,
                    [styles.bubbleText, isChild && { color: colors.white }],
                    isChild ? { color: colors.white } : undefined
                  )}
                </View>
              </View>
            );
          }}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask Ada anything…"
            placeholderTextColor={colors.mutedLight}
            value={draft}
            onChangeText={setDraft}
            multiline
            editable={!sending}
            returnKeyType={sendOnEnter ? 'send' : 'default'}
            onSubmitEditing={sendOnEnter ? handleSendText : undefined}
            blurOnSubmit={false}
          />
          <Pressable style={styles.micBtn} onPress={() => setVoiceOpen(true)} disabled={sending}>
            <Icon name="mic" size={16} color={colors.charcoal} />
          </Pressable>
          <Pressable style={styles.sendBtn} onPress={handleSendText} disabled={sending || !draft.trim()}>
            {sending ? <ActivityIndicator size="small" color={colors.white} /> : <Icon name="arrow-right" size={15} color={colors.white} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={voiceOpen} animationType="slide" onRequestClose={() => setVoiceOpen(false)}>
        {activeChild && (
          <VoiceMode
            childName={activeChild.name}
            subject={activeChild.subjects?.[0]}
            onClose={() => setVoiceOpen(false)}
            onResult={(userMsg: Message, aiMsg: Message) => {
              setMessages((prev) => [...prev, userMsg, aiMsg]);
              scrollToEnd();
            }}
            sendVoice={(uri: string) => sendVoiceMessage(activeChild.id, uri)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  emptyWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  emptyIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(26,95,122,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyTitle: { fontFamily: type.displaySemi, fontSize: 15, color: colors.charcoal, textAlign: 'center', marginBottom: 6, paddingHorizontal: 12 },
  emptyBody: { fontFamily: type.body, fontSize: 12.5, color: colors.mutedLight, textAlign: 'center', lineHeight: 18, paddingHorizontal: 12, marginBottom: 18 },
  emptyBtn: { backgroundColor: colors.teal, borderRadius: radii.md, paddingVertical: 12, paddingHorizontal: 22 },
  emptyBtnText: { fontFamily: type.displaySemi, fontSize: 13, color: colors.white },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontFamily: type.display, fontSize: 19, color: colors.charcoal },
  headerSub: { fontFamily: type.bodyMedium, fontSize: 11.5, color: colors.mutedLight, marginTop: 2 },

  childRow: { flexGrow: 0, marginBottom: 10 },
  childChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  childChipSelected: { backgroundColor: colors.teal, borderColor: colors.teal },
  childChipText: { fontFamily: type.bodyBold, fontSize: 12, color: colors.teal },
  childChipTextSelected: { color: colors.white },

  messages: { paddingHorizontal: 20, paddingBottom: 16, flexGrow: 1 },
  introWrap: { paddingVertical: 30, alignItems: 'center' },
  introText: { fontFamily: type.body, fontSize: 13, lineHeight: 20, color: colors.mutedLight, textAlign: 'center', maxWidth: 280 },

  memoryChip: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(217,119,6,0.08)', borderRadius: radii.md,
    paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14,
  },
  memoryChipText: { flex: 1, fontFamily: type.body, fontSize: 12, lineHeight: 17, color: colors.amberDark },

  quickReplies: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 8 },
  quickChip: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill,
    paddingVertical: 8, paddingHorizontal: 13, backgroundColor: colors.white,
  },
  quickChipText: { fontFamily: type.bodySemi, fontSize: 12, color: colors.teal },

  systemText: { fontFamily: type.bodyMedium, fontSize: 11, color: colors.mutedLight, textAlign: 'center', marginVertical: 8 },

  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 10 },
  bubbleRowStart: { justifyContent: 'flex-start' },
  bubbleRowEnd: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', paddingVertical: 10, paddingHorizontal: 13, borderRadius: 16 },
  bubbleAi: { backgroundColor: colors.white, borderBottomLeftRadius: 4 },
  bubbleChild: { backgroundColor: colors.teal, borderBottomRightRadius: 4 },
  bubbleText: { fontFamily: type.body, fontSize: 13.5, lineHeight: 20, color: colors.charcoal },
  speakBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(26,95,122,0.1)', alignItems: 'center', justifyContent: 'center' },
  speakBtnActive: { backgroundColor: 'rgba(217,119,6,0.18)' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, maxHeight: 100, backgroundColor: colors.cream, borderRadius: radii.pill,
    paddingHorizontal: 15, paddingVertical: 10, fontFamily: type.body, fontSize: 13.5, color: colors.charcoal,
  },
  micBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
});
