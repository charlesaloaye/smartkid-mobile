import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import appStorage from '../../utils/storage';
import ImagePicker from '../../utils/imagePickerUtils';
import { playAudioBase64Async, speakNigerian, stopSpeechAsync } from '../../utils/speechUtils';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { Pill } from '../../components/Pill';
import { colors, radii, shadow, type } from '../../theme';
import {
  fetchChildDetail,
  fetchChildren,
  fetchMessages,
  sendImageMessage,
  sendTextMessage,
  sendVoiceMessage,
  synthesizeSpeech,
} from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { renderFormattedText } from '../../utils/formatText';
import type { Child, Message } from '../../api/types';
import { VoiceMode } from './VoiceMode';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';

type ChatMessage = Message | { id: string; sender: 'system'; message: string };

const QUICK_REPLIES = ['Show me an example', 'I understand now', 'Can you explain again?'];

export default function TutorScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { role, childUser, logout } = useAuth();
  const requestedChildId = route?.params?.childId as number | undefined;
  const [children, setChildren] = useState<Child[] | null>(null);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imagePickerModalOpen, setImagePickerModalOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [sendOnEnter, setSendOnEnter] = useState(true);
  const [insight, setInsight] = useState<string | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<number | string | null>(null);
  const [aiConsentGranted, setAiConsentGranted] = useState<boolean | null>(null);
  const aiConsentGrantedRef = useRef(false);
  const [aiConsentModalOpen, setAiConsentModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const listRef = useRef<FlatList>(null);
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    appStorage.getItem('smartkid_ai_consent_granted').then((val) => {
      const granted = val === 'true';
      setAiConsentGranted(granted);
      aiConsentGrantedRef.current = granted;
    });
  }, []);

  const checkAiConsent = (onGranted: () => void) => {
    if (aiConsentGrantedRef.current || aiConsentGranted) {
      onGranted();
    } else {
      setPendingAction(() => onGranted);
      setAiConsentModalOpen(true);
    }
  };

  const handleAcceptAiConsent = async () => {
    aiConsentGrantedRef.current = true;
    setAiConsentGranted(true);
    setAiConsentModalOpen(false);
    try {
      await appStorage.setItem('smartkid_ai_consent_granted', 'true');
    } catch {}
    if (pendingAction) {
      const act = pendingAction;
      setPendingAction(null);
      setTimeout(() => {
        act();
      }, 50);
    }
  };

  useEffect(() => {
    const onKeyboardShow = (e: any) => {
      setKeyboardVisible(true);
      const keyboardHeight = e?.endCoordinates?.height || 0;
      const duration = Platform.OS === 'ios' ? (e?.duration || 250) : 100;

      Animated.timing(keyboardPadding, {
        toValue: keyboardHeight,
        duration,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, Platform.OS === 'ios' ? 60 : 100);
    };

    const onKeyboardHide = (e: any) => {
      setKeyboardVisible(false);
      const duration = Platform.OS === 'ios' ? (e?.duration || 250) : 100;

      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onKeyboardShow
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onKeyboardHide
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardPadding]);

  useEffect(() => {
    appStorage.getItem('smartkid_send_on_enter').then((val) => {
      if (val !== null) setSendOnEnter(val === 'true');
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (role === 'child' && childUser) {
          setActiveChild(childUser);
          setChildren([childUser]);
        } else {
          const list = await fetchChildren();
          setChildren(list);
          const requested = requestedChildId ? list.find((c) => c.id === requestedChildId) : null;
          if (list.length > 0) setActiveChild(requested ?? list[0]);
        }
      } catch {
        if (role === 'child' && childUser) {
          setActiveChild(childUser);
          setChildren([childUser]);
        } else {
          setChildren([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, childUser]);

  useEffect(() => {
    if (role === 'child' || !requestedChildId || !children) return;
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

  const handlePickImage = async (useCamera: boolean) => {
    setImagePickerModalOpen(false);
    try {
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'Please allow camera access in Settings so you can snap homework and diagram questions.'
          );
          return;
        }
        const res = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.7,
        });
        if (!res.canceled && res.assets?.[0]?.uri) {
          setAttachedImage(res.assets[0].uri);
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== 'granted') {
          Alert.alert(
            'Photos Permission Required',
            'Please allow photo library access so you can select and upload questions.'
          );
          return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.7,
        });
        if (!res.canceled && res.assets?.[0]?.uri) {
          setAttachedImage(res.assets[0].uri);
        }
      }
    } catch (e: any) {
      console.warn('Image picker error:', e);
      const errMsg = e?.message || '';
      if (errMsg.toLowerCase().includes('simulator') || errMsg.toLowerCase().includes('camera not available')) {
        Alert.alert(
          'Camera Not Available on Simulator',
          'The iOS Simulator does not have a physical camera. Please use "Choose from Library" on the simulator or test camera on a physical device.'
        );
      } else {
        Alert.alert('Error', 'Could not open camera/library. Please try again.');
      }
    }
  };

  const openImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take a Photo (Snap Homework)', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handlePickImage(true);
          if (buttonIndex === 2) handlePickImage(false);
        }
      );
    } else {
      setImagePickerModalOpen(true);
    }
  };

  const handleSend = async (overrideText?: string) => {
    if (!aiConsentGrantedRef.current && !aiConsentGranted) {
      checkAiConsent(() => handleSend(overrideText));
      return;
    }

    const text = (typeof overrideText === 'string' ? overrideText : draft).trim();
    const imageUri = attachedImage;

    if ((!text && !imageUri) || !activeChild || sending) return;

    setDraft('');
    setAttachedImage(null);
    setSending(true);

    const optimistic: Message = {
      id: Date.now(),
      child_id: activeChild.id,
      sender: 'child',
      message: text || (imageUri ? '📸 Homework photo submitted' : ''),
      metadata: imageUri ? { channel: 'app', type: 'image', image_url: imageUri } : { channel: 'app' },
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToEnd();

    try {
      if (imageUri) {
        const res = await sendImageMessage(activeChild.id, imageUri, text);
        setMessages((prev) => [...prev.filter((m) => m.id !== optimistic.id), res.message, res.reply]);
      } else {
        const res = await sendTextMessage(activeChild.id, text);
        setMessages((prev) => [...prev.filter((m) => m.id !== optimistic.id), res.message, res.reply]);
      }
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

  const toggleSpeakMessage = async (id: number | string, text: string) => {
    if (speakingMsgId === id) {
      stopSpeechAsync();
      setSpeakingMsgId(null);
      return;
    }

    stopSpeechAsync();
    setSpeakingMsgId(id);

    try {
      if (activeChild) {
        const res = await synthesizeSpeech(activeChild.id, text);
        if (res.audio_base64) {
          await playAudioBase64Async(res.audio_base64, {
            onDone: () => setSpeakingMsgId((current) => (current === id ? null : current)),
            onError: () => {
              speakNigerian(text, {
                onDone: () => setSpeakingMsgId((current) => (current === id ? null : current)),
                onError: () => setSpeakingMsgId((current) => (current === id ? null : current)),
              });
            },
          });
          return;
        }
      }
    } catch {
      // Fallback to local speech
    }

    speakNigerian(text, {
      onDone: () => setSpeakingMsgId((current) => (current === id ? null : current)),
      onError: () => setSpeakingMsgId((current) => (current === id ? null : current)),
    });
  };

  const sendQuickReply = (text: string) => {
    checkAiConsent(() => handleSend(text));
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
            description="Once registered, you can chat by text, voice, or snap homework right here."
            actionLabel="Add a child"
            onAction={() => navigation.navigate('AddChild')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top', 'left', 'right']}>
      <Animated.View style={{ flex: 1, paddingBottom: keyboardPadding }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Ada Tutor</Text>
            <Text style={styles.headerSub}>
              {activeChild?.name ? `${activeChild.name}${activeChild?.grade ? ` · ${activeChild.grade}` : ''}` : 'Personalized Learning'}
            </Text>
          </View>
          {role === 'child' ? (
            <Pressable
              style={styles.childLogoutBtn}
              onPress={() => {
                Alert.alert(
                  'Log out',
                  `Are you sure you want to log out of ${activeChild?.name || 'student'}'s account?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Log Out', style: 'destructive', onPress: logout },
                  ]
                );
              }}
            >
              <Icon name="chevron-left" size={14} color={colors.charcoal} />
              <Text style={styles.childLogoutText}>Log out</Text>
            </Pressable>
          ) : (
            <Pill label="Synced with WhatsApp" tone="sage" icon="whatsapp" />
          )}
        </View>

        {role !== 'child' && children.length > 1 && (
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

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messages}
          onContentSizeChange={scrollToEnd}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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
              description="Ask a question, snap homework, or tap the mic to speak."
            />
          }
          ListFooterComponent={
            sending ? (
              <View style={styles.thinkingContainer}>
                <View style={styles.thinkingBubble}>
                  <View style={styles.thinkingHeader}>
                    <Icon name="chat" size={14} color={colors.teal} />
                    <Text style={styles.thinkingTitle}>Ada is thinking & reviewing…</Text>
                    <ActivityIndicator size="small" color={colors.teal} style={{ marginLeft: 4 }} />
                  </View>
                  <View style={styles.thinkingSubRow}>
                    <Icon name="sparkle" size={12} color={colors.amberDark} />
                    <Text style={styles.thinkingSub}>
                      Take a moment to reflect and consider what you already know
                    </Text>
                  </View>
                </View>
              </View>
            ) : !sending && messages.length > 0 && messages[messages.length - 1].sender === 'ai' ? (
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
            const imageUrl = item.metadata?.image_url;

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
                  {imageUrl ? (
                    <View style={styles.imageWrap}>
                      <Image source={{ uri: imageUrl }} style={styles.bubbleImage} resizeMode="cover" />
                    </View>
                  ) : null}
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

        {/* Homework Photo Attachment Preview Card */}
        {attachedImage && (
          <View style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <View style={styles.previewImageContainer}>
                <Image source={{ uri: attachedImage }} style={styles.previewImage} resizeMode="cover" />
                <Pressable
                  onPress={() => setAttachedImage(null)}
                  style={styles.previewCloseBtn}
                  hitSlop={8}
                  accessibilityLabel="Remove photo"
                >
                  <Icon name="x" size={12} color={colors.white} />
                </Pressable>
              </View>
              <View style={styles.previewInfo}>
                <View style={styles.previewTag}>
                  <Icon name="camera" size={11} color={colors.teal} />
                  <Text style={styles.previewTagText}>Photo Ready</Text>
                </View>
                <Text style={styles.previewCardTitle}>Homework Photo Attached</Text>
                <Text style={styles.previewCardSub} numberOfLines={2}>
                  Ada will analyze the question or handwriting and help solve it!
                </Text>
              </View>
            </View>
            <View style={styles.previewActions}>
              <Pressable
                style={styles.previewChangeBtn}
                onPress={openImagePickerOptions}
                disabled={sending}
              >
                <Icon name="camera" size={13} color={colors.charcoal} />
                <Text style={styles.previewChangeText}>Retake</Text>
              </Pressable>
              <Pressable
                style={styles.previewPrimarySendBtn}
                onPress={() => handleSend()}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.previewPrimarySendText}>Send Photo to Ada</Text>
                    <Icon name="arrow-right" size={14} color={colors.white} />
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}

        <View
          style={[
            styles.inputBar,
            { paddingBottom: keyboardVisible ? 10 : Math.max(insets.bottom, 12) },
          ]}
        >
          <Pressable style={styles.toolBtn} onPress={openImagePickerOptions} disabled={sending} accessibilityLabel="Take or choose photo">
            <Icon name="camera" size={18} color={colors.teal} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder={attachedImage ? "Add an optional question or note…" : "Ask Ada anything…"}
            placeholderTextColor={colors.mutedLight}
            value={draft}
            onChangeText={(val) => {
              if (sendOnEnter && val.endsWith('\n')) {
                const cleaned = val.replace(/\n+$/, '');
                if (cleaned.trim() || attachedImage) {
                  handleSend(cleaned);
                }
                return;
              }
              setDraft(val);
            }}
            multiline
            submitBehavior={sendOnEnter ? 'submit' : 'newline'}
            returnKeyType={sendOnEnter ? 'send' : 'default'}
            enablesReturnKeyAutomatically={true}
            editable={!sending}
            onSubmitEditing={() => {
              if (sendOnEnter) {
                handleSend();
              }
            }}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === 'Enter' && !(e.nativeEvent as any).shiftKey && sendOnEnter) {
                handleSend();
              }
            }}
            blurOnSubmit={false}
            onFocus={() => {
              setTimeout(() => {
                listRef.current?.scrollToEnd({ animated: true });
              }, 150);
            }}
          />
          <Pressable style={styles.micBtn} onPress={() => checkAiConsent(() => setVoiceOpen(true))} disabled={sending} accessibilityLabel="Voice mode">
            <Icon name="mic" size={16} color={colors.charcoal} />
          </Pressable>
          <Pressable
            style={[
              styles.sendBtn,
              (!draft.trim() && !attachedImage) && styles.sendBtnDisabled,
              (Boolean(draft.trim()) || Boolean(attachedImage)) && styles.sendBtnActive,
            ]}
            onPress={() => handleSend()}
            disabled={sending || (!draft.trim() && !attachedImage)}
            accessibilityLabel="Send message"
          >
            {sending ? <ActivityIndicator size="small" color={colors.white} /> : <Icon name="arrow-right" size={15} color={colors.white} />}
          </Pressable>
        </View>
      </Animated.View>

      {/* Android Fallback Picker Modal */}
      <Modal visible={imagePickerModalOpen} transparent animationType="fade" onRequestClose={() => setImagePickerModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setImagePickerModalOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Snap & Solve Homework</Text>
            <Pressable style={styles.modalOption} onPress={() => handlePickImage(true)}>
              <Icon name="camera" size={18} color={colors.teal} />
              <Text style={styles.modalOptionText}>Take a Photo (Camera)</Text>
            </Pressable>
            <Pressable style={styles.modalOption} onPress={() => handlePickImage(false)}>
              <Icon name="image" size={18} color={colors.teal} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </Pressable>
            <Pressable style={styles.modalCancel} onPress={() => setImagePickerModalOpen(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

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

      {/* Third-Party AI Data Privacy & Parental Consent Modal */}
      <Modal
        visible={aiConsentModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAiConsentModalOpen(false)}
      >
        <View style={styles.consentOverlay}>
          <View style={styles.consentCard}>
            <View style={styles.consentIconBg}>
              <Icon name="sparkle" size={24} color={colors.amberDark} />
            </View>

            <Text style={styles.consentHeader}>AI Learning & Data Privacy</Text>
            <Text style={styles.consentSubtitle}>
              SmartKid Tutor uses artificial intelligence to power your child's personalized learning sessions with Ada.
            </Text>

            <View style={styles.consentPointsBox}>
              <View style={styles.consentRowItem}>
                <View style={styles.consentDot} />
                <Text style={styles.consentPointText}>
                  <Text style={styles.consentPointBold}>Data Transmitted: </Text>
                  Academic questions, curriculum topics, grade level, and voice recordings (when using Voice Mode) are sent to generate answers.
                </Text>
              </View>

              <View style={styles.consentRowItem}>
                <View style={styles.consentDot} />
                <Text style={styles.consentPointText}>
                  <Text style={styles.consentPointBold}>Third-Party AI Service: </Text>
                  Data is securely processed by <Text style={styles.consentPointBold}>OpenAI, L.L.C.</Text> via encrypted connections.
                </Text>
              </View>

              <View style={styles.consentRowItem}>
                <View style={styles.consentDot} />
                <Text style={styles.consentPointText}>
                  <Text style={styles.consentPointBold}>Child Privacy Protection: </Text>
                  Under NDPR and COPPA standards, child data is never sold, never used for advertising, and is not used to train third-party AI models.
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.policyLinkRow}
              onPress={() => Linking.openURL('https://smartkidtutor.ng/privacy-policy')}
            >
              <Text style={styles.policyLinkText}>Read Privacy Policy & NDPR Terms ↗</Text>
            </Pressable>

            <Button
              label="I Agree & Continue"
              variant="amber"
              onPress={handleAcceptAiConsent}
              style={{ marginTop: 14 }}
            />

            <Pressable
              style={styles.consentDeclineBtn}
              onPress={() => {
                setAiConsentModalOpen(false);
                setPendingAction(null);
              }}
            >
              <Text style={styles.consentDeclineText}>Not Now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  emptyWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontFamily: type.display, fontSize: 19, color: colors.charcoal },
  headerSub: { fontFamily: type.bodyMedium, fontSize: 11.5, color: colors.mutedLight, marginTop: 2 },

  childRow: { flexGrow: 0, marginBottom: 10 },
  childChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  childChipSelected: { backgroundColor: colors.teal, borderColor: colors.teal },
  childChipText: { fontFamily: type.bodyBold, fontSize: 12, color: colors.teal },
  childChipTextSelected: { color: colors.white },

  messages: { paddingHorizontal: 20, paddingBottom: 16, flexGrow: 1 },

  memoryChip: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(217,119,6,0.08)', borderRadius: radii.md,
    paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14,
  },
  memoryChipText: { flex: 1, fontFamily: type.body, fontSize: 12, lineHeight: 17, color: colors.amberDark },

  thinkingContainer: {
    paddingVertical: 6,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  thinkingBubble: {
    backgroundColor: 'rgba(26,95,122,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(26,95,122,0.15)',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '85%',
  },
  thinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinkingTitle: {
    fontFamily: type.bodyBold,
    fontSize: 12.5,
    color: colors.teal,
  },
  thinkingSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  thinkingSub: {
    flexShrink: 1,
    fontFamily: type.body,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 15,
  },

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

  imageWrap: { marginBottom: 8, borderRadius: 10, overflow: 'hidden' },
  bubbleImage: { width: 200, height: 140, borderRadius: 8, backgroundColor: '#E5E7EB' },

  previewCard: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    ...shadow.soft,
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewImageContainer: {
    position: 'relative',
    width: 62,
    height: 62,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    borderWidth: 1.5,
    borderColor: colors.amber,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(26,95,122,0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.pill,
    marginBottom: 3,
  },
  previewTagText: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    color: colors.teal,
  },
  previewCardTitle: {
    fontFamily: type.displaySemi,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  previewCardSub: {
    fontFamily: type.body,
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
    lineHeight: 15,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  previewChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewChangeText: {
    fontFamily: type.bodyBold,
    fontSize: 12,
    color: colors.charcoal,
  },
  previewPrimarySendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.amber,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    ...shadow.soft,
  },
  previewPrimarySendText: {
    fontFamily: type.bodyBold,
    fontSize: 13,
    color: colors.white,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(26,95,122,0.08)', alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: colors.cream, borderRadius: radii.pill,
    paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 10 : 8, fontFamily: type.body, fontSize: 13.5, color: colors.charcoal,
  },
  micBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnActive: { opacity: 1, backgroundColor: colors.amber },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 12 },
  modalTitle: { fontFamily: type.displaySemi, fontSize: 16, color: colors.charcoal, marginBottom: 4 },
  modalOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  modalOptionText: { fontFamily: type.bodyMedium, fontSize: 14, color: colors.charcoal },
  modalCancel: { marginTop: 8, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  modalCancelText: { fontFamily: type.bodyBold, fontSize: 14, color: colors.mutedLight },
  childLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadow.soft,
  },
  childLogoutText: {
    fontFamily: type.bodyBold,
    fontSize: 12,
    color: colors.charcoal,
  },
  consentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  consentCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    ...shadow.card,
  },
  consentIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  consentHeader: {
    fontFamily: type.displaySemi,
    fontSize: 18,
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: 6,
  },
  consentSubtitle: {
    fontFamily: type.bodyMedium,
    fontSize: 12.5,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  consentPointsBox: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: 14,
    width: '100%',
    gap: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  consentRowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  consentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.amberDark,
    marginTop: 6,
  },
  consentPointText: {
    flex: 1,
    fontFamily: type.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.charcoal,
  },
  consentPointBold: {
    fontFamily: type.bodyBold,
    color: colors.charcoal,
  },
  policyLinkRow: {
    paddingVertical: 6,
    marginBottom: 6,
  },
  policyLinkText: {
    fontFamily: type.bodyBold,
    fontSize: 12,
    color: colors.teal,
    textDecorationLine: 'underline',
  },
  consentDeclineBtn: {
    marginTop: 10,
    paddingVertical: 8,
  },
  consentDeclineText: {
    fontFamily: type.bodyBold,
    fontSize: 13,
    color: colors.mutedLight,
  },
});

