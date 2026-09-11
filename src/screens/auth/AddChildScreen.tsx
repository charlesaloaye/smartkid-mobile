import React, { useState } from 'react';
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { colors, radii, shadow, type } from '../../theme';
import { createChild } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { showToast } from '../../utils/toast';

const GRADES = [
  'Nursery', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3',
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'English Studies', 'Basic Science', 'Social Studies',
  'Agricultural Science', 'Civic Education',
];

export default function AddChildScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('Primary 5');
  const [subjects, setSubjects] = useState<string[]>(['Mathematics']);
  const [loading, setLoading] = useState(false);

  // Success modal state for showing generated credentials
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    username: string;
    password?: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(true);

  const toggleSubject = (s: string) => {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const onSubmit = async () => {
    if (!name.trim()) {
      showToast.error("Please enter your child's full name to continue.", 'Missing Name');
      return;
    }
    setLoading(true);
    try {
      const res = await createChild({
        name: name.trim(),
        whatsapp_number: whatsapp.trim() ? whatsapp.trim() : undefined,
        username: customUsername.trim() ? customUsername.trim() : undefined,
        password: customPassword.trim() ? customPassword.trim() : undefined,
        age: age ? Number(age) : undefined,
        grade,
        subjects,
      });

      showToast.success(`${name.trim()}'s profile created!`, 'Child Added');

      // Show credentials modal so parent can copy/share
      setCreatedCredentials({
        name: res.name,
        username: res.username || name.trim().toLowerCase().replace(/\s+/g, ''),
        password: res.plain_password || customPassword.trim() || 'smartkid123',
      });
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Failed to Create Profile');
    } finally {
      setLoading(false);
    }
  };

  const shareCredentials = async () => {
    if (!createdCredentials) return;
    try {
      await Share.share({
        title: `SmartKID Login for ${createdCredentials.name}`,
        message: `🌟 Hi ${createdCredentials.name}! Here are your SmartKID Tutor login details:\n\n🎒 Username: ${createdCredentials.username}\n🔑 Password / PIN: ${createdCredentials.password}\n\nOpen the SmartKID app, choose "Student Login", and start learning with Ada! 🚀`,
      });
    } catch {
      // ignore
    }
  };

  const handleFinish = () => {
    setCreatedCredentials(null);
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.root}>
      {/* Faded Background Image */}
      <ImageBackground
        source={require('../../../assets/auth_bg.jpg')}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.18 }}
        resizeMode="cover"
      />

      <Screen scroll background="transparent" statusBarStyle="dark-content">
        {/* Brand Eyebrow */}
        <Text style={styles.eyebrow}>✨ STEP 2 OF 2 • CHILD PROFILE</Text>
        <Text style={styles.title}>Who is Ada teaching?</Text>
        <Text style={styles.subtitle}>
          Create your child's profile. They can log in on their tablet or phone using their own student credentials!
        </Text>

        {/* Main Light Glass Form Card */}
        <View style={styles.card}>
          <TextField
            label="Child's Full Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Adanna Okeke"
          />

          <TextField
            label="Child's WhatsApp Number (Optional)"
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="+234 803 555 0148"
            keyboardType="phone-pad"
          />
          <Text style={styles.fieldHelper}>
            Optional: only required if your child learns via WhatsApp chat.
          </Text>

          <TextField
            label="Age (optional)"
            value={age}
            onChangeText={setAge}
            placeholder="10"
            keyboardType="number-pad"
          />

          <Text style={styles.fieldLabel}>Class / Grade</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ gap: 8 }}>
            {GRADES.map((g) => (
              <Pressable
                key={g}
                onPress={() => setGrade(g)}
                style={[styles.chip, grade === g && styles.chipSelected]}
              >
                <Text style={[styles.chipText, grade === g && styles.chipTextSelected]}>{g}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Subjects to Start With</Text>
          <View style={styles.subjectWrap}>
            {SUBJECT_OPTIONS.map((s) => {
              const selected = subjects.includes(s);
              return (
                <Pressable
                  key={s}
                  onPress={() => toggleSubject(s)}
                  style={[styles.subjectChip, selected && styles.subjectChipSelected]}
                >
                  <Text style={[styles.subjectChipText, selected && styles.subjectChipTextSelected]}>{s}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label="Create Child Profile"
            onPress={onSubmit}
            loading={loading}
            variant="amber"
            style={{ marginTop: 22 }}
          />
        </View>

        <Pressable style={styles.skip} onPress={() => navigation.replace('MainTabs')}>
          <Text style={styles.skipText}>I'll add my child later</Text>
        </Pressable>
      </Screen>

      {/* Success Modal Showing Credentials */}
      <Modal
        visible={!!createdCredentials}
        transparent
        animationType="fade"
        onRequestClose={handleFinish}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalBadge}>
              <Icon name="sparkle" size={20} color={colors.teal} />
            </View>
            <Text style={styles.modalTitle}>Child Profile Ready! 🎉</Text>
            <Text style={styles.modalSubtitle}>
              Give these login details to {createdCredentials?.name} so they can log in to SmartKID:
            </Text>

            <View style={styles.credentialsBox}>
              <View style={styles.credentialRow}>
                <Text style={styles.credentialLabel}>Student Username:</Text>
                <Text style={styles.credentialValue}>{createdCredentials?.username}</Text>
              </View>
              <View style={styles.credentialDivider} />
              <View style={styles.credentialRow}>
                <Text style={styles.credentialLabel}>Password / PIN:</Text>
                <View style={styles.passwordValueRow}>
                  <Text style={styles.credentialValue}>
                    {showPassword ? (createdCredentials?.password || '••••••••') : '••••••••'}
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

            <Text style={styles.credentialNote}>
              💡 You can view or reset these credentials anytime from your Parent Dashboard.
            </Text>

            <Button
              label="Share Details with Child"
              onPress={shareCredentials}
              variant="teal"
              style={{ width: '100%', marginBottom: 10 }}
            />

            <Button
              label="Go to Dashboard"
              onPress={handleFinish}
              variant="outline"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FBF7EE',
  },
  eyebrow: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.amberDark,
    marginTop: 24,
    marginBottom: 6,
  },
  title: { fontFamily: type.displayBlack, fontSize: 30, color: colors.charcoal, marginBottom: 6, letterSpacing: -0.5 },
  subtitle: {
    fontFamily: type.body,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.muted,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: radii.xxl,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadow.card,
  },
  fieldLabel: {
    fontFamily: type.bodyBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.charcoal,
    marginBottom: 10,
    marginTop: 8,
  },
  fieldHelper: {
    fontFamily: type.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  chipRow: { marginBottom: 18 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  chipSelected: { backgroundColor: colors.amber, borderColor: colors.amber },
  chipText: { fontFamily: type.bodyBold, fontSize: 13, color: colors.charcoal },
  chipTextSelected: { color: colors.white },
  subjectWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  subjectChip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  subjectChipSelected: { backgroundColor: colors.teal, borderColor: colors.teal },
  subjectChipText: { fontFamily: type.bodySemi, fontSize: 12.5, color: colors.teal },
  subjectChipTextSelected: { color: colors.white },
  error: { fontFamily: type.bodyMedium, fontSize: 13, color: colors.danger, marginTop: 14, textAlign: 'center' },
  skip: { alignSelf: 'center', paddingVertical: 20, paddingBottom: 36 },
  skipText: { fontFamily: type.bodySemi, fontSize: 13.5, color: colors.textDim },
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
  credentialNote: {
    fontFamily: type.body,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 20,
  },
});

