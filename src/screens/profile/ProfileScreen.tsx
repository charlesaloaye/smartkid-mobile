import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, IconName } from '../../components/Icon';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { colors, radii, shadow, type } from '../../theme';
import * as LocalAuthentication from 'expo-local-authentication';
import { BIOMETRICS_ENABLED_KEY, useAuth } from '../../context/AuthContext';
import { useAsync } from '../../utils/useAsync';
import { showToast } from '../../utils/toast';
import {
  fetchChildren,
  fetchDashboard,
  updateUserPassword,
  updateUserProfile,
} from '../../api/endpoints';
import { EmptyState } from '../../components/EmptyState';

const SEND_ON_ENTER_KEY = '@send_on_enter';
const WHATSAPP_ALERTS_KEY = '@whatsapp_alerts';
const SOUND_EFFECTS_KEY = '@sound_effects';

const CHILD_AVATAR_COLORS: [string, string][] = [
  ['#1A5F7A', '#144F66'],
  ['#D97706', '#B86305'],
  ['#E76F51', '#C85236'],
  ['#6B8E7F', '#4A6D5E'],
  ['#8B5CF6', '#6D28D9'],
];

function SettingRow({
  icon,
  iconBgColor,
  iconColor,
  label,
  subtitle,
  onPress,
  tone,
  badge,
}: {
  icon: IconName;
  iconBgColor?: string;
  iconColor?: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  tone?: 'danger';
  badge?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        pressed && { backgroundColor: 'rgba(26, 95, 122, 0.04)' },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.rowIconBg,
          {
            backgroundColor:
              iconBgColor ||
              (tone === 'danger'
                ? 'rgba(220, 38, 38, 0.1)'
                : 'rgba(26, 95, 122, 0.08)'),
          },
        ]}
      >
        <Icon
          name={icon}
          size={17}
          color={iconColor || (tone === 'danger' ? colors.danger : colors.teal)}
        />
      </View>

      <View style={styles.rowTextContainer}>
        <Text style={[styles.rowLabel, tone === 'danger' && { color: colors.danger }]}>
          {label}
        </Text>
        {subtitle && <Text style={styles.rowSubLabel}>{subtitle}</Text>}
      </View>

      {badge ? (
        <View style={styles.rowBadge}>
          <Text style={styles.rowBadgeText}>{badge}</Text>
        </View>
      ) : null}

      {tone !== 'danger' && (
        <Icon name="chevron-right" size={16} color={colors.mutedLight} />
      )}
    </Pressable>
  );
}

function SwitchRow({
  icon,
  iconBgColor,
  iconColor,
  label,
  subtitle,
  value,
  onValueChange,
}: {
  icon: IconName;
  iconBgColor?: string;
  iconColor?: string;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View
        style={[
          styles.rowIconBg,
          { backgroundColor: iconBgColor || 'rgba(26, 95, 122, 0.08)' },
        ]}
      >
        <Icon name={icon} size={17} color={iconColor || colors.teal} />
      </View>
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle && <Text style={styles.rowSubLabel}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#CBD5E1', true: colors.teal }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, updateUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sendOnEnter, setSendOnEnter] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [showNdprModal, setShowNdprModal] = useState(false);

  // Edit Profile Modal States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Change Password Modal States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const { data: dashboard, refreshing, refresh } = useAsync(fetchDashboard, []);
  const { data: childrenList, refresh: refreshChildren } = useAsync(fetchChildren, []);

  useEffect(() => {
    AsyncStorage.getItem(SEND_ON_ENTER_KEY).then((val) => {
      if (val !== null) setSendOnEnter(val === 'true');
    });
    AsyncStorage.getItem(WHATSAPP_ALERTS_KEY).then((val) => {
      if (val !== null) setWhatsappAlerts(val === 'true');
    });
    AsyncStorage.getItem(SOUND_EFFECTS_KEY).then((val) => {
      if (val !== null) setSoundEffects(val === 'true');
    });
    AsyncStorage.getItem(BIOMETRICS_ENABLED_KEY).then((val) => {
      if (val !== null) setBiometricsEnabled(val === 'true');
    });
  }, []);

  const toggleBiometrics = async (val: boolean) => {
    if (val) {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
          showToast.warning(
            'Face ID or Touch ID / Fingerprint is not supported or configured on this device.',
            'Biometrics Not Available'
          );
          return;
        }

        const res = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric login',
          fallbackLabel: 'Use Password',
        });

        if (res.success) {
          setBiometricsEnabled(true);
          await AsyncStorage.setItem(BIOMETRICS_ENABLED_KEY, 'true');
          showToast.success('You can now log in securely using Face ID / Touch ID.', 'Biometrics Enabled');
        }
      } catch (err: any) {
        showToast.error(err?.message || 'Could not enable biometric login.', 'Biometric Error');
      }
    } else {
      setBiometricsEnabled(false);
      await AsyncStorage.setItem(BIOMETRICS_ENABLED_KEY, 'false');
    }
  };

  const toggleSendOnEnter = async (val: boolean) => {
    setSendOnEnter(val);
    await AsyncStorage.setItem(SEND_ON_ENTER_KEY, val ? 'true' : 'false');
  };

  const toggleWhatsappAlerts = async (val: boolean) => {
    setWhatsappAlerts(val);
    await AsyncStorage.setItem(WHATSAPP_ALERTS_KEY, val ? 'true' : 'false');
  };

  const toggleSoundEffects = async (val: boolean) => {
    setSoundEffects(val);
    await AsyncStorage.setItem(SOUND_EFFECTS_KEY, val ? 'true' : 'false');
  };

  const handleRefresh = () => {
    refresh();
    refreshChildren();
  };

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await logout();
        },
      },
    ]);
  };

  const openEditProfile = () => {
    setEditName(user?.name ?? '');
    setEditEmail(user?.email ?? '');
    setProfileError(null);
    setShowEditProfileModal(true);
  };

  const openChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setPasswordError(null);
    setShowChangePasswordModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      setProfileError('Please enter a valid email address.');
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const res = await updateUserProfile({
        name: editName.trim(),
        email: editEmail.trim(),
      });
      if (res?.user) {
        updateUser(res.user);
      }
      setShowEditProfileModal(false);
      showToast.success('Your profile details have been updated successfully.', 'Profile Updated');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        'Could not update profile. Please try again.';
      setProfileError(msg);
      showToast.error(msg, 'Update Failed');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword) {
      const msg = 'Please enter your current password.';
      setPasswordError(msg);
      showToast.error(msg, 'Missing Password');
      return;
    }
    if (newPassword.length < 8) {
      const msg = 'New password must be at least 8 characters long.';
      setPasswordError(msg);
      showToast.error(msg, 'Password Too Short');
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = 'New passwords do not match.';
      setPasswordError(msg);
      showToast.error(msg, 'Password Mismatch');
      return;
    }

    setIsSavingPassword(true);
    setPasswordError(null);
    try {
      await updateUserPassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast.success('Your password has been changed successfully.', 'Password Changed');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.current_password?.[0] ||
        'Could not update password. Please check your current password and try again.';
      setPasswordError(msg);
      showToast.error(msg, 'Password Update Failed');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const childrenCount = dashboard?.total_children ?? childrenList?.length ?? 0;
  const questionsCount = dashboard?.total_questions ?? 0;
  const streakDays = dashboard?.learning_streak ?? 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.teal}
          />
        }
      >
        {/* Header Title Row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSubtitle}>ACCOUNT & SETTINGS</Text>
            <Text style={styles.headerTitle}>Parent Profile</Text>
          </View>
          <Pill label="Parent Account" tone="teal" />
        </View>

        {/* Hero Profile Gradient Card */}
        <View style={styles.heroCardContainer}>
          <LinearGradient
            colors={['#0F2F3E', '#1A5F7A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Avatar & User Details */}
            <View style={styles.heroTopRow}>
              <View style={styles.avatarBorderRing}>
                <LinearGradient
                  colors={['#F2A93B', '#D97706']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : ''}
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.heroInfo}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.heroName}>{user?.name || ''}</Text>
                  {!!(user?.email_verified_at || user?.id_verified_at) && (
                    <View style={styles.verifiedBadge}>
                      <Icon name="check" size={10} color={colors.white} />
                    </View>
                  )}
                </View>
                <Text style={styles.heroEmail}>{user?.email || ''}</Text>
                <View style={styles.planPill}>
                  <Icon name="shield" size={11} color={colors.amberLight} />
                  <Text style={styles.planPillText}>
                    {(user?.email_verified_at || user?.id_verified_at) ? 'Verified Parent' : 'Parent Account'} • NDPR Protected
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Metrics Stats Bar */}
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{childrenCount}</Text>
                <Text style={styles.heroStatLabel}>Children</Text>
              </View>

              <View style={styles.heroStatDivider} />

              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>🔥 {streakDays}d</Text>
                <Text style={styles.heroStatLabel}>Streak</Text>
              </View>

              <View style={styles.heroStatDivider} />

              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{questionsCount}</Text>
                <Text style={styles.heroStatLabel}>Questions</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Premium Banner */}
        <Pressable
          style={({ pressed }) => [
            styles.premiumPressable,
            pressed && { opacity: 0.94, transform: [{ scale: 0.99 }] },
          ]}
          onPress={() => navigation.navigate('Premium')}
        >
          <LinearGradient
            colors={['#D97706', '#E76F51']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumBanner}
          >
            <View style={styles.premiumIconBg}>
              <Icon name="sparkle" size={22} color={colors.amberDark} />
            </View>

            <View style={styles.premiumTextContainer}>
              <View style={styles.premiumTagRow}>
                <Text style={styles.premiumTitle}>SmartKid Pro Plan</Text>
                <View style={styles.miniProBadge}>
                  <Text style={styles.miniProText}>POPULAR</Text>
                </View>
              </View>
              <Text style={styles.premiumBody}>
                Unlimited AI tutoring, instant homework help & voice learning.
              </Text>
            </View>

            <View style={styles.premiumArrowBg}>
              <Icon name="arrow-right" size={16} color={colors.amberDark} />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Children Managed Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>REGISTERED CHILDREN ({childrenList?.length ?? 0})</Text>
          <Pressable
            onPress={() =>
              showToast.info(
                'To register a new child, add their WhatsApp number in your parent dashboard at smartkidtutor.ng.',
                'Add Child Profile'
              )
            }
          >
            <Text style={styles.sectionHeaderAction}>+ Add Child</Text>
          </Pressable>
        </View>

        {childrenList && childrenList.length > 0 ? (
          <View style={styles.childrenGrid}>
            {childrenList.map((child, index) => {
              const gradColors = CHILD_AVATAR_COLORS[index % CHILD_AVATAR_COLORS.length];
              return (
                <Card key={child.id} style={styles.childCard}>
                  <View style={styles.childRow}>
                    <LinearGradient colors={gradColors} style={styles.childAvatar}>
                      <Text style={styles.childAvatarText}>
                        {child.name.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>

                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childDetail}>
                        {child.grade ? `${child.grade} • ` : ''}
                        {child.whatsapp_number}
                      </Text>
                    </View>

                    <Pill
                      label={child.questions_count ? `${child.questions_count} Qs` : 'Active'}
                      tone="amber"
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <EmptyState
            compact
            icon="user"
            title="No Children Added Yet"
            description="Link your child's WhatsApp number to start receiving daily learning reports."
            actionLabel="Add a child"
            onAction={() => navigation.navigate('AddChild')}
          />
        )}

        {/* Settings Group: Chat & App Preferences */}
        <Text style={styles.sectionLabel}>APP & CHAT PREFERENCES</Text>
        <Card style={styles.groupCard}>
          <SwitchRow
            icon="chat"
            iconBgColor="rgba(26, 95, 122, 0.1)"
            iconColor={colors.teal}
            label="Send message with Enter"
            subtitle="Press Enter on keyboard to send tutor messages"
            value={sendOnEnter}
            onValueChange={toggleSendOnEnter}
          />
          {/* <View style={styles.rowDivider} />
          <SwitchRow
            icon="bell"
            iconBgColor="rgba(217, 119, 6, 0.1)"
            iconColor={colors.amber}
            label="WhatsApp Session Alerts"
            subtitle="Get real-time alerts when your child studies"
            value={whatsappAlerts}
            onValueChange={toggleWhatsappAlerts}
          />
          <View style={styles.rowDivider} />
          <SwitchRow
            icon="mic"
            iconBgColor="rgba(107, 142, 127, 0.12)"
            iconColor={colors.sage}
            label="Voice Tutor Sound Effects"
            subtitle="Play audio chimes during Ada voice interactions"
            value={soundEffects}
            onValueChange={toggleSoundEffects}
          /> */}
        </Card>

        {/* Settings Group: Security & Privacy */}
        <Text style={styles.sectionLabel}>SECURITY & DATA PROTECTION</Text>
        <Card style={styles.groupCard}>
          <SwitchRow
            icon="sparkle"
            iconBgColor="rgba(26, 95, 122, 0.1)"
            iconColor={colors.teal}
            label="Face ID / Touch ID Login"
            subtitle="Unlock SmartKid with biometric security"
            value={biometricsEnabled}
            onValueChange={toggleBiometrics}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="user"
            label="Edit Parent Profile"
            subtitle="Update name & primary contact email"
            onPress={openEditProfile}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="lock"
            label="Security & Passwords"
            subtitle="Manage & update your account password"
            onPress={openChangePassword}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="shield"
            iconBgColor="rgba(16, 185, 129, 0.1)"
            iconColor="#10B981"
            label="NDPR & Data Protection Policy"
            subtitle="Learn how we protect children's data in Nigeria"
            badge="NDPR Safe"
            onPress={() => setShowNdprModal(true)}
          />
        </Card>

        {/* Settings Group: Support & Resources */}
        <Text style={styles.sectionLabel}>SUPPORT & HELP</Text>
        <Card style={styles.groupCard}>
          <SettingRow
            icon="whatsapp"
            iconBgColor="rgba(37, 211, 102, 0.12)"
            iconColor="#25D366"
            label="Contact WhatsApp Support"
            subtitle="Chat directly with our support team"
            onPress={() =>
              showToast.info(
                'Reach our parent support team on WhatsApp or email us anytime at hello@smartkidtutor.ng',
                'Support Helpline'
              )
            }
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="card"
            label="Billing & Subscription History"
            subtitle="View invoices and plan details"
            onPress={() => navigation.navigate('Premium')}
          />
        </Card>


        {/* ─── Phase Roadmap (hidden) ────────────────────────────── */}
        {/* <View style={styles.roadmapHeader}>
          <Text style={styles.roadmapEyebrow}>PRODUCT ROADMAP</Text>
          <Text style={styles.roadmapTitle}>What's Coming to SmartKid</Text>
          <Text style={styles.roadmapSubtitle}>
            We're building the most complete learning platform for Nigerian children. Here's what's next.
          </Text>
        </View> */}

        {/* Logout Button */}

        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { backgroundColor: 'rgba(220, 38, 38, 0.14)' },
          ]}
          onPress={confirmLogout}
          disabled={loggingOut}
        >
          <Icon name="logout" size={17} color={colors.danger} />
          <Text style={styles.logoutText}>
            {loggingOut ? 'Logging out of SmartKid…' : 'Log out of Account'}
          </Text>
        </Pressable>

        {/* App Info Footer */}
        <View style={styles.footerContainer}>
          <Image
            source={require('../../../assets/logo-horizontal.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerBrand}>Socratic AI Learning Companion</Text>
          <Text style={styles.footerVersion}>Version 1.2.0 • Phase 1 Release</Text>
          <Text style={styles.footerCopyright}>© 2026 smartkidtutor.ng. All rights reserved.</Text>
        </View>
      </ScrollView>

      {/* Keyboard-Aware Edit Profile Modal */}
      <Modal
        visible={showEditProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContent}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalScrollContainer}
              >
                {/* Header with Icon & Close Button */}
                <View style={styles.modalTopHeader}>
                  <LinearGradient
                    colors={['#1A5F7A', '#144F66']}
                    style={styles.modalBadgeGradient}
                  >
                    <Icon name="user" size={20} color={colors.white} />
                  </LinearGradient>
                  <Pressable
                    style={styles.modalCloseIconBtn}
                    onPress={() => setShowEditProfileModal(false)}
                    disabled={isSavingProfile}
                  >
                    <Icon name="x" size={18} color={colors.muted} />
                  </Pressable>
                </View>

                <Text style={styles.modalTitleText}>Edit Parent Profile</Text>
                <Text style={styles.modalSubtitleText}>
                  Update your primary account details below.
                </Text>

                {profileError && (
                  <View style={styles.errorBanner}>
                    <Icon name="shield" size={14} color={colors.danger} />
                    <Text style={styles.errorBannerText}>{profileError}</Text>
                  </View>
                )}

                {/* Input 1: Name */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>FULL NAME</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="user" size={18} color={colors.teal} />
                    <TextInput
                      style={styles.inputControl}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Charles Aloaye"
                      placeholderTextColor={colors.mutedLight}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Input 2: Email */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="chat" size={18} color={colors.teal} />
                    <TextInput
                      style={styles.inputControl}
                      value={editEmail}
                      onChangeText={setEditEmail}
                      placeholder="Enter primary email"
                      placeholderTextColor={colors.mutedLight}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.modalActionRow}>
                  <Pressable
                    style={styles.cancelActionBtn}
                    onPress={() => setShowEditProfileModal(false)}
                    disabled={isSavingProfile}
                  >
                    <Text style={styles.cancelActionText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    style={styles.submitActionBtn}
                    onPress={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    <LinearGradient
                      colors={[colors.teal, colors.tealDark]}
                      style={styles.submitGradient}
                    >
                      {isSavingProfile ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Text style={styles.submitActionText}>Save Changes</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Keyboard-Aware Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContent}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalScrollContainer}
              >
                {/* Header with Icon & Close Button */}
                <View style={styles.modalTopHeader}>
                  <LinearGradient
                    colors={['#D97706', '#B86305']}
                    style={styles.modalBadgeGradient}
                  >
                    <Icon name="lock" size={20} color={colors.white} />
                  </LinearGradient>
                  <Pressable
                    style={styles.modalCloseIconBtn}
                    onPress={() => setShowChangePasswordModal(false)}
                    disabled={isSavingPassword}
                  >
                    <Icon name="x" size={18} color={colors.muted} />
                  </Pressable>
                </View>

                <Text style={styles.modalTitleText}>Security & Passwords</Text>
                <Text style={styles.modalSubtitleText}>
                  Enter your current password to set a new password.
                </Text>

                {passwordError && (
                  <View style={styles.errorBanner}>
                    <Icon name="shield" size={14} color={colors.danger} />
                    <Text style={styles.errorBannerText}>{passwordError}</Text>
                  </View>
                )}

                {/* Current Password */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>CURRENT PASSWORD</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="lock" size={18} color={colors.amber} />
                    <TextInput
                      style={styles.inputControl}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Enter current password"
                      placeholderTextColor={colors.mutedLight}
                      secureTextEntry={!showCurrentPass}
                    />
                    <Pressable onPress={() => setShowCurrentPass(!showCurrentPass)}>
                      <Icon
                        name={showCurrentPass ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.mutedLight}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>NEW PASSWORD</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="lock" size={18} color={colors.amber} />
                    <TextInput
                      style={styles.inputControl}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="At least 8 characters"
                      placeholderTextColor={colors.mutedLight}
                      secureTextEntry={!showNewPass}
                    />
                    <Pressable onPress={() => setShowNewPass(!showNewPass)}>
                      <Icon
                        name={showNewPass ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.mutedLight}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Confirm New Password */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>CONFIRM NEW PASSWORD</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="lock" size={18} color={colors.amber} />
                    <TextInput
                      style={styles.inputControl}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter new password"
                      placeholderTextColor={colors.mutedLight}
                      secureTextEntry={!showConfirmPass}
                    />
                    <Pressable onPress={() => setShowConfirmPass(!showConfirmPass)}>
                      <Icon
                        name={showConfirmPass ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.mutedLight}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.modalActionRow}>
                  <Pressable
                    style={styles.cancelActionBtn}
                    onPress={() => setShowChangePasswordModal(false)}
                    disabled={isSavingPassword}
                  >
                    <Text style={styles.cancelActionText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    style={styles.submitActionBtn}
                    onPress={handleSavePassword}
                    disabled={isSavingPassword}
                  >
                    <LinearGradient
                      colors={['#D97706', '#B86305']}
                      style={styles.submitGradient}
                    >
                      {isSavingPassword ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Text style={styles.submitActionText}>Update Password</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* NDPR Compliance Modal */}
      <Modal
        visible={showNdprModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNdprModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTopHeader}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.modalBadgeGradient}
              >
                <Icon name="shield" size={20} color={colors.white} />
              </LinearGradient>
              <Pressable
                style={styles.modalCloseIconBtn}
                onPress={() => setShowNdprModal(false)}
              >
                <Icon name="x" size={18} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={styles.modalTitleText}>NDPR Protection Guarantee</Text>
            <Text style={styles.modalSubtitleText}>
              SmartKid Tutor complies with Nigeria Data Protection Regulation (NDPR).
            </Text>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalBulletRow}>
                <Icon name="check" size={14} color="#10B981" />
                <Text style={styles.modalBulletText}>
                  Child conversation logs are encrypted and never shared.
                </Text>
              </View>
              <View style={styles.modalBulletRow}>
                <Icon name="check" size={14} color="#10B981" />
                <Text style={styles.modalBulletText}>
                  Parents hold 100% ownership and can request data deletion.
                </Text>
              </View>
              <View style={styles.modalBulletRow}>
                <Icon name="check" size={14} color="#10B981" />
                <Text style={styles.modalBulletText}>
                  AI models operate strictly within child-safe Socratic guidelines.
                </Text>
              </View>
              <Text style={styles.modalContact}>
                DPO Contact: dpo@smartkidtutor.ng
              </Text>
            </ScrollView>

            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setShowNdprModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close Statement</Text>
            </Pressable>
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
  heroCardContainer: {
    borderRadius: radii.xxl,
    overflow: 'hidden',
    marginBottom: 18,
    ...shadow.card,
  },
  heroGradient: {
    padding: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarBorderRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: type.displayBlack,
    fontSize: 26,
    color: colors.white,
  },
  heroInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroName: {
    fontFamily: type.display,
    fontSize: 19,
    color: colors.white,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmail: {
    fontFamily: type.bodyMedium,
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.78)',
    marginTop: 2,
  },
  planPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  planPillText: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    color: colors.amberLight,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatValue: {
    fontFamily: type.displaySemi,
    fontSize: 16,
    color: colors.white,
  },
  heroStatLabel: {
    fontFamily: type.bodyMedium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 1,
  },
  heroStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  premiumPressable: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: 22,
    ...shadow.glowAmber,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  premiumIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumTitle: {
    fontFamily: type.displaySemi,
    fontSize: 15.5,
    color: colors.white,
  },
  miniProBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniProText: {
    fontFamily: type.bodyBold,
    fontSize: 9,
    color: colors.white,
    letterSpacing: 0.5,
  },
  premiumBody: {
    fontFamily: type.body,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 3,
    lineHeight: 15,
  },
  premiumArrowBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 4,
  },
  sectionLabel: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: colors.mutedLight,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionHeaderAction: {
    fontFamily: type.bodyBold,
    fontSize: 12,
    color: colors.teal,
  },
  childrenGrid: {
    gap: 8,
    marginBottom: 22,
  },
  childCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.08)',
    ...shadow.soft,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarText: {
    fontFamily: type.displaySemi,
    fontSize: 16,
    color: colors.white,
  },
  childInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontFamily: type.bodySemi,
    fontSize: 14.5,
    color: colors.charcoal,
  },
  childDetail: {
    fontFamily: type.bodyMedium,
    fontSize: 11.5,
    color: colors.mutedLight,
    marginTop: 1,
  },
  emptyChildrenCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.08)',
    marginBottom: 22,
  },
  emptyChildrenTitle: {
    fontFamily: type.bodyBold,
    fontSize: 14,
    color: colors.charcoal,
    marginTop: 8,
  },
  emptyChildrenSub: {
    fontFamily: type.body,
    fontSize: 12,
    color: colors.mutedLight,
    textAlign: 'center',
    marginTop: 4,
  },
  groupCard: {
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.08)',
    marginBottom: 22,
    ...shadow.soft,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  rowIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  rowLabel: {
    fontFamily: type.bodySemi,
    fontSize: 14,
    color: colors.charcoal,
  },
  rowSubLabel: {
    fontFamily: type.bodyMedium,
    fontSize: 11.5,
    color: colors.mutedLight,
    marginTop: 2,
  },
  rowBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    marginRight: 6,
  },
  rowBadgeText: {
    fontFamily: type.bodyBold,
    fontSize: 10,
    color: '#059669',
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 48,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    paddingVertical: 14,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.18)',
    marginTop: 4,
    marginBottom: 20,
  },
  logoutText: {
    fontFamily: type.displaySemi,
    fontSize: 14.5,
    color: colors.danger,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  footerLogo: {
    width: 170,
    height: 44,
    marginBottom: 4,
    opacity: 0.9,
  },
  footerBrand: {
    fontFamily: type.bodySemi,
    fontSize: 11.5,
    color: colors.teal,
  },
  footerVersion: {
    fontFamily: type.bodyMedium,
    fontSize: 10.5,
    color: colors.mutedLight,
  },
  footerCopyright: {
    fontFamily: type.body,
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.35)',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 15, 30, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadow.card,
  },
  modalScrollContainer: {
    flexGrow: 0,
  },
  modalTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalBadgeGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  modalCloseIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleText: {
    fontFamily: type.display,
    fontSize: 20,
    color: colors.charcoal,
    letterSpacing: -0.3,
  },
  modalSubtitleText: {
    fontFamily: type.bodyMedium,
    fontSize: 12.5,
    color: colors.mutedLight,
    marginTop: 3,
    marginBottom: 16,
  },
  fieldWrapper: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: colors.mutedLight,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  inputControl: {
    flex: 1,
    fontFamily: type.bodyMedium,
    fontSize: 14,
    color: colors.charcoal,
    padding: 0,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.18)',
  },
  errorBannerText: {
    flex: 1,
    fontFamily: type.bodyMedium,
    fontSize: 12,
    color: colors.danger,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelActionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radii.lg,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionText: {
    fontFamily: type.bodyBold,
    fontSize: 14,
    color: colors.muted,
  },
  submitActionBtn: {
    flex: 1.4,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadow.soft,
  },
  submitGradient: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitActionText: {
    fontFamily: type.bodyBold,
    fontSize: 14,
    color: colors.white,
  },
  modalScroll: {
    maxHeight: 200,
    marginBottom: 16,
  },
  modalBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  modalBulletText: {
    flex: 1,
    fontFamily: type.bodyMedium,
    fontSize: 12.5,
    color: colors.charcoal,
    lineHeight: 17,
  },
  modalContact: {
    fontFamily: type.bodyBold,
    fontSize: 12,
    color: colors.teal,
    marginTop: 10,
  },
  modalCloseBtn: {
    backgroundColor: colors.teal,
    paddingVertical: 13,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontFamily: type.bodyBold,
    fontSize: 14,
    color: colors.white,
  },

  // ─── Phase Roadmap Styles ───────────────────────────────────────
  roadmapHeader: {
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  roadmapEyebrow: {
    fontFamily: type.bodyBold,
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: colors.teal,
    marginBottom: 4,
  },
  roadmapTitle: {
    fontFamily: type.display,
    fontSize: 20,
    color: colors.charcoal,
    marginBottom: 6,
  },
  roadmapSubtitle: {
    fontFamily: type.body,
    fontSize: 12.5,
    color: colors.muted,
    lineHeight: 18,
  },
  roadmapPhaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  roadmapPhaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roadmapPhaseLabel: {
    fontFamily: type.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  roadmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  laterBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    flexShrink: 0,
  },
  laterText: {
    fontFamily: type.bodyBold,
    fontSize: 9,
    color: '#5B21B6',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
