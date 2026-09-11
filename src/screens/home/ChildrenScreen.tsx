import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Button } from '../../components/Button';
import { colors, radii, shadow, type } from '../../theme';
import { useAsync } from '../../utils/useAsync';
import { fetchDashboard, resetChildPassword } from '../../api/endpoints';
import { showToast } from '../../utils/toast';
import { extractErrorMessage } from '../../api/client';
import type { Child } from '../../api/types';

import { EmptyState } from '../../components/EmptyState';

const AVATAR_GRADIENTS: [string, string][] = [
  [colors.teal, colors.tealDark],
  ['#E76F51', '#D97706'],
  ['#2A9D8F', '#1A5F7A'],
  ['#8E44AD', '#3498DB'],
];

export default function ChildrenScreen({ navigation }: any) {
  const { data, loading, refreshing, refresh } = useAsync(fetchDashboard, []);
  const children = data?.children ?? [];

  const [activeCredsChild, setActiveCredsChild] = useState<Child | null>(null);
  const [resettingPin, setResettingPin] = useState(false);
  const [newPin, setNewPin] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPin = async () => {
    if (!activeCredsChild) return;
    setResettingPin(true);
    try {
      const res = await resetChildPassword(activeCredsChild.id);
      setNewPin(res.password);
      setShowPassword(true);
      showToast.success('New login PIN generated!', 'PIN Reset');
      refresh();
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Failed to Reset PIN');
    } finally {
      setResettingPin(false);
    }
  };

  const handleShareCreds = async () => {
    if (!activeCredsChild) return;
    const pin = newPin || activeCredsChild.passcode || activeCredsChild.plain_password || 'smartkid123';
    try {
      await Share.share({
        title: `SmartKID Login for ${activeCredsChild.name}`,
        message: `🌟 Hi ${activeCredsChild.name}! Here are your SmartKID Tutor login details:\n\n🎒 Username: ${activeCredsChild.username || activeCredsChild.name.toLowerCase().replace(/\s+/g, '')}\n🔑 Password / PIN: ${pin}\n\nOpen SmartKID, tap "Student Login", and start learning with Ada! 🚀`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.teal}
          />
        }
      >
        {/* Header section */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSubtitle}>SMARTKID FAMILY</Text>
            <Text style={styles.headerTitle}>Your Children</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
            onPress={() => navigation.navigate('AddChild')}
          >
            <LinearGradient
              colors={[colors.teal, colors.tealDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addBtnGradient}
            >
              <Icon name="plus" size={15} color={colors.white} />
              <Text style={styles.addBtnText}>Add Child</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Quick Summary Pill Bar */}
        {children.length > 0 && (
          <View style={styles.summaryBar}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryDot} />
              <Text style={styles.summaryText}>
                {children.length} {children.length === 1 ? 'Learner' : 'Learners'} Active
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Icon name="sparkle" size={13} color={colors.teal} />
              <Text style={styles.summaryText}>In-App & WhatsApp Synced</Text>
            </View>
          </View>
        )}

        {/* Loading Spinner to prevent UI flash */}
        {loading && !data && (
          <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={{ fontFamily: type.bodyMedium, fontSize: 13, color: colors.muted, marginTop: 12 }}>
              Loading children list…
            </Text>
          </View>
        )}

        {/* Empty state */}
        {!loading && data && children.length === 0 && (
          <EmptyState
            icon="user"
            title="No children registered yet"
            description="Add your child so they can begin personalized AI tutoring sessions with Ada."
            actionLabel="Add First Child"
            onAction={() => navigation.navigate('AddChild')}
          />
        )}

        {/* Children Card List */}
        {children.map((child, index) => {
          const gradientColors = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
          const hasSubjects = child.subjects && child.subjects.length > 0;

          return (
            <Card key={child.id} style={styles.childCard}>
              {/* Header Info */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarWrapper}>
                  <LinearGradient
                    colors={gradientColors}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>{child.name.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                  <View style={styles.onlineBadge} />
                </View>

                <View style={styles.childMetaContainer}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <View style={styles.phoneRow}>
                    {child.username ? (
                      <View style={styles.usernamePill}>
                        <Icon name="sparkle" size={11} color={colors.teal} />
                        <Text style={styles.usernameText}>@{child.username}</Text>
                      </View>
                    ) : null}
                    {child.whatsapp_number ? (
                      <View style={styles.whatsappRow}>
                        <Icon name="whatsapp" size={12} color="#25D366" />
                        <Text style={styles.phoneNumber}>{child.whatsapp_number}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <Pressable
                  style={styles.credsQuickBtn}
                  onPress={() => {
                    setNewPin(null);
                    setActiveCredsChild(child);
                  }}
                >
                  <Icon name="sparkle" size={14} color={colors.amberDark} />
                  <Text style={styles.credsQuickBtnText}>PIN / Login</Text>
                </Pressable>
              </View>

              {/* Subjects / Learning Focus */}
              <View style={styles.subjectsContainer}>
                <Text style={styles.sectionLabel}>LEARNING FOCUS</Text>
                <View style={styles.subjectRow}>
                  {hasSubjects ? (
                    child.subjects!.map((s) => (
                      <Pill key={s} label={s} tone="teal" />
                    ))
                  ) : (
                    <Pill label="Ready for first session" tone="amber" />
                  )}
                </View>
              </View>

              {/* Metrics Grid */}
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <View style={styles.statHeader}>
                    <Icon name="chat" size={14} color={colors.teal} />
                    <Text style={styles.statNum}>{child.questions_count ?? 0}</Text>
                  </View>
                  <Text style={styles.statLabel}>Questions this week</Text>
                </View>

                <View style={styles.statVerticalDivider} />

                <View style={styles.statBox}>
                  <View style={styles.statHeader}>
                    <Icon name="calendar" size={14} color={colors.amber} />
                    <Text style={styles.statNum}>{child.last_session ?? 'Never'}</Text>
                  </View>
                  <Text style={styles.statLabel}>Last session</Text>
                </View>
              </View>

              {/* Actions Footer */}
              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryChatBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => navigation.navigate('Tutor', { childId: child.id })}
                >
                  <LinearGradient
                    colors={[colors.teal, colors.tealDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chatGradient}
                  >
                    <Icon name="sparkle" size={15} color={colors.white} />
                    <Text style={styles.primaryChatText}>Chat with Ada</Text>
                    <Icon name="arrow-right" size={14} color={colors.white} />
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setNewPin(null);
                    setActiveCredsChild(child);
                  }}
                >
                  <Icon name="sparkle" size={16} color={colors.amberDark} />
                </Pressable>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Credentials & PIN Reset Modal */}
      <Modal
        visible={!!activeCredsChild}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveCredsChild(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalBadge}>
              <Icon name="sparkle" size={22} color={colors.teal} />
            </View>
            <Text style={styles.modalTitle}>{activeCredsChild?.name}'s Credentials</Text>
            <Text style={styles.modalSubtitle}>
              Use these details to log in on {activeCredsChild?.name}'s tablet or phone:
            </Text>

            <View style={styles.credentialsBox}>
              <View style={styles.credentialRow}>
                <Text style={styles.credentialLabel}>Student Username:</Text>
                <Text style={styles.credentialValue}>
                  {activeCredsChild?.username || activeCredsChild?.name.toLowerCase().replace(/\s+/g, '')}
                </Text>
              </View>
              <View style={styles.credentialDivider} />
              <View style={styles.credentialRow}>
                <Text style={styles.credentialLabel}>Password / PIN:</Text>
                <View style={styles.passwordValueRow}>
                  <Text style={styles.credentialValue}>
                    {showPassword
                      ? (newPin || activeCredsChild?.passcode || activeCredsChild?.plain_password || 'smartkid123')
                      : '••••••••'}
                  </Text>
                  <Pressable
                    hitSlop={10}
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeBtn}
                  >
                    <Icon
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={colors.teal}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {newPin && (
              <View style={styles.newPinAlert}>
                <Text style={styles.newPinAlertText}>
                  ✨ New PIN: <Text style={{ fontFamily: type.bodyBold }}>{newPin}</Text> (Share this with your child now!)
                </Text>
              </View>
            )}

            <Button
              label={resettingPin ? 'Generating…' : 'Generate New PIN'}
              onPress={handleResetPin}
              loading={resettingPin}
              variant="amber"
              style={{ width: '100%', marginBottom: 10 }}
            />

            <Button
              label="Share Details"
              onPress={handleShareCreds}
              variant="teal"
              style={{ width: '100%', marginBottom: 10 }}
            />

            <Button
              label="Close"
              onPress={() => setActiveCredsChild(null)}
              variant="outline"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    color: colors.teal,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: type.display,
    fontSize: 26,
    color: colors.charcoal,
  },
  addBtn: {
    borderRadius: radii.pill,
    overflow: 'hidden',
    ...shadow.soft,
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 15,
    gap: 6,
  },
  addBtnText: {
    fontFamily: type.displaySemi,
    fontSize: 13,
    color: colors.white,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#25D366',
  },
  summaryText: {
    fontFamily: type.bodySemi,
    fontSize: 12,
    color: colors.charcoal,
  },
  summaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
  childCard: {
    marginBottom: 18,
    borderRadius: radii.lg,
    padding: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.08)',
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  avatarText: {
    fontFamily: type.displayBlack,
    fontSize: 20,
    color: colors.white,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: colors.white,
  },
  childMetaContainer: {
    flex: 1,
    marginLeft: 14,
  },
  childName: {
    fontFamily: type.display,
    fontSize: 17.5,
    color: colors.charcoal,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  phoneNumber: {
    fontFamily: type.bodyMedium,
    fontSize: 12,
    color: colors.mutedLight,
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectsContainer: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: type.bodyBold,
    fontSize: 9.5,
    color: colors.mutedLight,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBox: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statVerticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
  statNum: {
    fontFamily: type.displaySemi,
    fontSize: 14,
    color: colors.charcoal,
  },
  statLabel: {
    fontFamily: type.bodyMedium,
    fontSize: 10.5,
    color: colors.mutedLight,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryChatBtn: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  chatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  primaryChatText: {
    fontFamily: type.displaySemi,
    fontSize: 13.5,
    color: colors.white,
  },
  secondaryBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(26, 95, 122, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginTop: 10,
  },
  emptyGradient: {
    padding: 30,
    alignItems: 'center',
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadow.soft,
  },
  emptyTitle: {
    fontFamily: type.display,
    fontSize: 18,
    color: colors.charcoal,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: type.body,
    fontSize: 13,
    color: colors.mutedLight,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.teal,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radii.pill,
    ...shadow.soft,
  },
  emptyCtaText: {
    fontFamily: type.displaySemi,
    fontSize: 13.5,
    color: colors.white,
  },
  usernamePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(26, 95, 122, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
  },
  usernameText: {
    fontFamily: type.bodyBold,
    fontSize: 11.5,
    color: colors.teal,
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  credsQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  credsQuickBtnText: {
    fontFamily: type.bodyBold,
    fontSize: 11,
    color: colors.amberDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xxl,
    padding: 26,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadow.card,
  },
  modalBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(26, 95, 122, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: type.display,
    fontSize: 22,
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontFamily: type.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 18,
  },
  credentialsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  credentialLabel: {
    fontFamily: type.bodySemi,
    fontSize: 13,
    color: colors.muted,
  },
  credentialValue: {
    fontFamily: type.bodyBold,
    fontSize: 15,
    color: colors.teal,
    letterSpacing: 0.5,
  },
  passwordValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeBtn: {
    padding: 4,
    backgroundColor: 'rgba(26, 95, 122, 0.08)',
    borderRadius: radii.sm,
  },
  credentialDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  newPinAlert: {
    width: '100%',
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  newPinAlertText: {
    fontFamily: type.bodyMedium,
    fontSize: 13,
    color: colors.amberDark,
    textAlign: 'center',
  },
});

