import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import appStorage from '../../utils/storage';
import Biometrics from '../../utils/biometrics';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Application from 'expo-application';
import * as Google from 'expo-auth-session/providers/google';
import { exchangeCodeAsync, makeRedirectUri } from 'expo-auth-session';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { colors, radii, shadow, type } from '../../theme';
import { BIOMETRICS_ENABLED_KEY, useAuth } from '../../context/AuthContext';
import { extractErrorMessage, getToken } from '../../api/client';
import { showToast } from '../../utils/toast';

// Safely complete auth session without throwing on incompatible runtimes
try {
  WebBrowser.maybeCompleteAuthSession();
} catch {}

export default function LoginScreen({ navigation }: any) {
  const { login, loginWithBiometrics, loginWithSocial } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricType, setBiometricType] = useState('Face ID / Touch ID');
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const processedCodeRef = React.useRef<string | null>(null);

  // ── Google OAuth via expo-auth-session ──────────────────────────────────
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    shouldAutoExchangeCode: false,
  });

  // Decode JWT payload for id_token without external dependencies
  const decodeJwt = (jwt: string) => {
    try {
      const parts = jwt.split('.');
      if (parts.length < 2) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let str = '';
      for (let i = 0; i < padded.length; i += 4) {
        const enc1 = chars.indexOf(padded.charAt(i));
        const enc2 = chars.indexOf(padded.charAt(i + 1));
        const enc3 = chars.indexOf(padded.charAt(i + 2));
        const enc4 = chars.indexOf(padded.charAt(i + 3));
        const chr1 = (enc1 << 2) | (enc2 >> 4);
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const chr3 = ((enc3 & 3) << 6) | enc4;
        str += String.fromCharCode(chr1);
        if (enc3 !== 64 && chr2 !== 0) str += String.fromCharCode(chr2);
        if (enc4 !== 64 && chr3 !== 0) str += String.fromCharCode(chr3);
      }
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const handleGoogleSuccess = async (res: any) => {
    const code = res.params?.code;
    if (code && processedCodeRef.current === code) {
      return;
    }
    if (code) {
      processedCodeRef.current = code;
    }

    try {
      setSocialLoading('google');
      let accessToken = res.authentication?.accessToken ?? res.params?.access_token;
      let idToken = res.authentication?.idToken ?? res.params?.id_token;

      // Exchange authorization code for tokens if not yet provided directly
      if (!accessToken && !idToken && code) {
        const clientId =
          Platform.select({
            ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
            android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
            default: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
          }) || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

        const redirectUri =
          googleRequest?.redirectUri ||
          makeRedirectUri({
            native: `${Application.applicationId}:/oauthredirect`,
          });

        const tokenResult = await exchangeCodeAsync(
          {
            clientId,
            code,
            redirectUri,
            extraParams: {
              code_verifier: googleRequest?.codeVerifier || '',
            },
          },
          Google.discovery
        );
        accessToken = tokenResult.accessToken;
        idToken = tokenResult.idToken;
      }

      let userEmail: string | undefined;
      let userName: string | undefined;
      let providerId: string | undefined;

      if (idToken) {
        const decoded = decodeJwt(idToken);
        if (decoded?.email) {
          userEmail = decoded.email;
          userName = decoded.name || decoded.given_name;
          providerId = decoded.sub;
        }
      }

      if ((!userEmail || !providerId) && accessToken) {
        try {
          const profileRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            userEmail = userEmail || profile.email;
            userName = userName || profile.name;
            providerId = providerId || profile.id;
          }
        } catch {}
      }

      if (!userEmail || !providerId) {
        throw new Error('Could not retrieve your Google account details. Please try again.');
      }

      await loginWithSocial({
        provider: 'google',
        email: userEmail,
        name: userName || (userEmail ? userEmail.split('@')[0] : 'Google User'),
        provider_id: providerId,
      });
      showToast.success('Signed in with Google!', 'Welcome');
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Google Sign-In Failed');
    } finally {
      setSocialLoading(null);
    }
  };

  // Handle Google response when browser redirects back
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleSuccess(googleResponse);
    } else if (googleResponse) {
      setSocialLoading(null);
    }
  }, [googleResponse]);

  const onGoogleLogin = async () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID && !process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) {
      showToast.info('Google Sign-In is not configured yet. Add GOOGLE client IDs to .env', 'Setup Needed');
      return;
    }
    setSocialLoading('google');
    try {
      const res = await promptGoogleAsync();
      if (res?.type === 'success') {
        await handleGoogleSuccess(res);
      } else {
        setSocialLoading(null);
      }
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Google Sign-In Failed');
      setSocialLoading(null);
    }
  };

  const onAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      showToast.info('Apple ID Sign-In is only available on iPhone and iPad.', 'Apple Login');
      return;
    }
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      showToast.info('Apple Sign-In is not supported on this device or environment.', 'Apple Login');
      return;
    }
    setSocialLoading('apple');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // Apple only gives email on first sign-in; cache it or use identityToken sub as ID
      const email = credential.email ?? `${credential.user}@privaterelay.appleid.com`;
      const name = credential.fullName
        ? `${credential.fullName.givenName ?? ''} ${credential.fullName.familyName ?? ''}`.trim()
        : undefined;
      await loginWithSocial({
        provider: 'apple',
        email,
        name,
        provider_id: credential.user,
      });
      showToast.success('Signed in with Apple!', 'Welcome');
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED' || e?.code === 'ERR_CANCELED' || e?.code === '1001') {
        // User cancelled the Apple Sign-In sheet
        return;
      }
      const rawMsg = extractErrorMessage(e);
      if (rawMsg.includes('RequestUnknownException') || e?.code === 'ERR_REQUEST_UNKNOWN') {
        showToast.error(
          'Please ensure an Apple ID is signed in under Settings on your device/simulator.',
          'Apple Sign-In Required'
        );
      } else {
        showToast.error(rawMsg, 'Apple Sign-In Failed');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const enabled = await appStorage.getItem(BIOMETRICS_ENABLED_KEY);
        const token = await getToken();
        const hasHardware = await Biometrics.hasHardwareAsync();
        const isEnrolled = await Biometrics.isEnrolledAsync();

        if (enabled === 'true' && token && hasHardware && isEnrolled) {
          setHasBiometrics(true);
          const types = await Biometrics.supportedAuthenticationTypesAsync();
          // Type 2 is FACIAL_RECOGNITION, Type 1 is FINGERPRINT
          if (types.includes(2)) {
            setBiometricType('Face ID');
          } else if (types.includes(1)) {
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

          <View style={styles.orDividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsRow}>
            {/* Google Button */}
            <Pressable
              style={({ pressed }) => [
                styles.socialBtn,
                pressed && { backgroundColor: '#F3F4F6', transform: [{ scale: 0.97 }] },
                socialLoading === 'google' && { opacity: 0.7 },
              ]}
              onPress={onGoogleLogin}
              disabled={!!socialLoading || loading}
            >
              {socialLoading === 'google' ? (
                <Ionicons name="sync" size={18} color="#EA4335" />
              ) : (
                <Ionicons name="logo-google" size={18} color="#EA4335" />
              )}
              <Text style={styles.socialBtnText}>
                {socialLoading === 'google' ? 'Signing in…' : 'Google'}
              </Text>
            </Pressable>

            {/* Apple Button */}
            <Pressable
              style={({ pressed }) => [
                styles.socialBtn,
                styles.appleBtn,
                pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] },
                socialLoading === 'apple' && { opacity: 0.7 },
              ]}
              onPress={onAppleLogin}
              disabled={!!socialLoading || loading}
            >
              {socialLoading === 'apple' ? (
                <Ionicons name="sync" size={20} color="#FFFFFF" />
              ) : (
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.appleBtnText}>
                {socialLoading === 'apple' ? 'Signing in…' : 'Apple ID'}
              </Text>
            </Pressable>
          </View>

          {hasBiometrics && (
            <View style={styles.biometricSection}>
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
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  orText: {
    fontFamily: type.body,
    fontSize: 12,
    color: colors.mutedLight,
    letterSpacing: 0.3,
    textTransform: 'lowercase',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  socialBtnText: {
    fontFamily: type.bodyMedium,
    fontSize: 13,
    color: colors.charcoal,
  },
  appleBtn: {
    backgroundColor: 'rgba(17,17,17,0.85)',
    borderColor: 'transparent',
  },
  appleBtnText: {
    fontFamily: type.bodyMedium,
    fontSize: 13,
    color: '#FFFFFF',
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
