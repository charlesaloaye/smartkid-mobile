import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { colors, radii, shadow, type } from '../../theme';
import { BIOMETRICS_ENABLED_KEY, useAuth } from '../../context/AuthContext';
import { extractErrorMessage, getToken } from '../../api/client';
import { showToast } from '../../utils/toast';

export default function LoginScreen({ navigation }: any) {
  const { login, loginWithBiometrics } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricType, setBiometricType] = useState('Face ID / Touch ID');

  useEffect(() => {
    (async () => {
      try {
        const enabled = await AsyncStorage.getItem(BIOMETRICS_ENABLED_KEY);
        const token = await getToken();
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (enabled === 'true' && token && hasHardware && isEnrolled) {
          setHasBiometrics(true);
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('Face ID');
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('Touch ID');
          }
        }
      } catch {
        // silent fallback
      }
    })();
  }, []);

  const onSubmit = async () => {
    if (!email || !password) {
      showToast.error('Enter your email and password to continue.', 'Missing Details');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      showToast.success('Logged in successfully!', 'Welcome Back');
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  const onBiometricLogin = async () => {
    setLoading(true);
    try {
      await loginWithBiometrics();
      showToast.success('Logged in with biometrics!', 'Welcome Back');
    } catch (e: any) {
      showToast.error(extractErrorMessage(e), 'Biometric Login Failed');
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
        {/* Official Brand Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo-horizontal.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Brand Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✨ SOCRATIC AI TUTOR</Text>
          </View>
        </View>

        <Text style={styles.title}>Welcome back.</Text>
        <Text style={styles.subtitle}>
          Log in to track your child's progress with Ada on WhatsApp.
        </Text>

        {/* Main Light Glass Form Card */}
        <View style={styles.card}>
          <TextField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="name@example.com"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
            placeholder="••••••••"
          />

          {/* Forgot password link */}
          <Pressable
            style={styles.forgotRow}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Button
            label="Log in to Dashboard"
            onPress={onSubmit}
            loading={loading}
            variant="amber"
            style={{ marginTop: 4 }}
          />

          {hasBiometrics && (
            <View style={styles.biometricSection}>
              <View style={styles.orDividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.biometricBtn,
                  pressed && { backgroundColor: 'rgba(26, 95, 122, 0.12)' },
                ]}
                onPress={onBiometricLogin}
                disabled={loading}
              >
                <Icon name="sparkle" size={18} color={colors.teal} />
                <Text style={styles.biometricBtnText}>Log in with {biometricType}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Footer Navigation */}
        <Pressable
          style={styles.footer}
          onPress={() => navigation.replace('Register')}
        >
          <Text style={styles.footerText}>
            New to SmartKid Tutor? <Text style={styles.footerLink}>Create an account</Text>
          </Text>
        </Pressable>

        {/* Trust Badge */}
        <View style={styles.trustRow}>
          <Icon name="check" size={14} color={colors.teal} />
          <Text style={styles.trustText}>NDPR Compliant • Child-Safe Socratic AI</Text>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FBF7EE',
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  logoImage: {
    width: 200,
    height: 52,
  },
  badgeContainer: {
    marginTop: 8,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(26, 95, 122, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.2)',
  },
  badgeText: {
    fontFamily: type.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.teal,
  },
  title: {
    fontFamily: type.displayBlack,
    fontSize: 32,
    color: colors.charcoal,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: type.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: radii.xxl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadow.card,
  },
  error: {
    fontFamily: type.bodyMedium,
    fontSize: 13,
    color: colors.danger,
    marginBottom: 14,
    textAlign: 'center',
  },
  biometricSection: {
    marginTop: 14,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  orText: {
    fontFamily: type.bodyBold,
    fontSize: 10,
    color: colors.mutedLight,
    letterSpacing: 0.8,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(26, 95, 122, 0.07)',
    paddingVertical: 12,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.2)',
  },
  biometricBtnText: {
    fontFamily: type.displaySemi,
    fontSize: 14,
    color: colors.teal,
  },
  footer: { marginTop: 24, alignItems: 'center', paddingBottom: 10 },
  footerText: { fontFamily: type.body, fontSize: 14, color: colors.muted },
  footerLink: { fontFamily: type.bodyBold, color: colors.amberDark },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 6,
    marginBottom: 4,
  },
  forgotText: {
    fontFamily: type.bodyMedium,
    fontSize: 13,
    color: colors.teal,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    marginBottom: 30,
  },
  trustText: {
    fontFamily: type.bodyMedium,
    fontSize: 11.5,
    color: colors.textDim,
    letterSpacing: 0.3,
  },
});
