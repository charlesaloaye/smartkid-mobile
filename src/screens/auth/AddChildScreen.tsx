import React, { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { colors, radii, shadow, type } from '../../theme';
import { createChild } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';

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
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('Primary 5');
  const [subjects, setSubjects] = useState<string[]>(['Mathematics']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSubject = (s: string) => {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const onSubmit = async () => {
    setError('');
    if (!name || !whatsapp) {
      setError("Enter your child's name and WhatsApp number to continue.");
      return;
    }
    setLoading(true);
    try {
      await createChild({
        name: name.trim(),
        whatsapp_number: whatsapp.trim(),
        age: age ? Number(age) : undefined,
        grade,
        subjects,
      });
      navigation.replace('MainTabs');
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
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
          Ada teaches your child directly on WhatsApp — enter the WhatsApp number she'll message.
        </Text>

        {/* Main Light Glass Form Card */}
        <View style={styles.card}>
          <TextField label="Child's Full Name" value={name} onChangeText={setName} placeholder="Aisha Bello" />
          <TextField
            label="Child's WhatsApp Number"
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="+234 803 555 0148"
            keyboardType="phone-pad"
          />
          <TextField label="Age (optional)" value={age} onChangeText={setAge} placeholder="10" keyboardType="number-pad" />

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

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Button label="Create Child Profile" onPress={onSubmit} loading={loading} variant="amber" style={{ marginTop: 22 }} />
        </View>

        <Pressable style={styles.skip} onPress={() => navigation.replace('MainTabs')}>
          <Text style={styles.skipText}>I'll add my child later</Text>
        </Pressable>
      </Screen>
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
});
