import React, { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { colors, radii, shadow, type } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!name || !email || !password || !confirm) {
      setError('Fill in every field to create your account.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!consent) {
      setError('Please accept the Terms & Privacy Policy to continue.');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirm,
        consent,
      });
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
        {/* Brand Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🚀 PARENT ONBOARDING</Text>
          </View>
        </View>

        <Text style={styles.title}>Create your account.</Text>
        <Text style={styles.subtitle}>
          You'll add your child and their WhatsApp number next so Ada can start teaching.
        </Text>

        {/* Glass Form Card */}
        <View style={styles.card}>
          <TextField label="Your Full Name" value={name} onChangeText={setName} placeholder="Funke Bello" />
          <TextField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="name@example.com"
          />
          <TextField label="Password" value={password} onChangeText={setPassword} isPassword autoCapitalize="none" placeholder="At least 8 characters" />
          <TextField label="Confirm Password" value={confirm} onChangeText={setConfirm} isPassword autoCapitalize="none" placeholder="Re-enter your password" />

          <Pressable style={styles.consentRow} onPress={() => setConsent((c) => !c)}>
            <View style={[styles.checkbox, consent && styles.checkboxOn]}>
              {consent && <Icon name="check" size={12} color={colors.white} />}
            </View>
            <Text style={styles.consentText}>
              I agree to the Terms of Service and Privacy Policy, including NDPR data handling.
            </Text>
          </Pressable>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Button label="Create Account" onPress={onSubmit} loading={loading} variant="amber" style={{ marginTop: 6 }} />
        </View>

        <Pressable style={styles.footer} onPress={() => navigation.replace('Login')}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerLink}>Log in</Text>
          </Text>
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
  badgeContainer: {
    marginTop: 30,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  badgeText: {
    fontFamily: type.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.amberDark,
  },
  title: { fontFamily: type.displayBlack, fontSize: 32, color: colors.charcoal, marginBottom: 6, letterSpacing: -0.5 },
  subtitle: {
    fontFamily: type.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 22,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: radii.xxl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadow.card,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 6,
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: '#FFFFFF',
  },
  checkboxOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  consentText: {
    flex: 1,
    fontFamily: type.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.muted,
  },
  error: { fontFamily: type.bodyMedium, fontSize: 13, color: colors.danger, marginBottom: 14, textAlign: 'center' },
  footer: { marginTop: 24, alignItems: 'center', paddingBottom: 30 },
  footerText: { fontFamily: type.body, fontSize: 14, color: colors.muted },
  footerLink: { fontFamily: type.bodyBold, color: colors.amberDark },
});
