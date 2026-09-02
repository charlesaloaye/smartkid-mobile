import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { showToast } from '../../utils/toast';
// Safely complete auth session without throwing on incompatible runtimes
try {
  WebBrowser.maybeCompleteAuthSession();
} catch {}

export default function RegisterScreen({ navigation }: any) {
  const { register, loginWithSocial } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const processedCodeRef = React.useRef<string | null>(null);

  // ── Google OAuth via expo-auth-session ──────────────────────────────────
  const redirectUri = makeRedirectUri({
    native: Platform.select({
      ios: 'com.googleusercontent.apps.87739056632-7bb9jtr7u0ff6bm49tt6as340litfvms:/oauthredirect',
      android: `${Application.applicationId || 'ng.smartkidtutor.app'}:/oauthredirect`,
      default: 'smartkidtutor:/oauthredirect',
    }),
  });

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
    shouldAutoExchangeCode: false,
  });

  // Decode JWT payload for id_token without external dependencies
  const decodeJwt = (jwt: string) => {
    try {
      const parts = jwt.split('.');
      if (parts.length < 2) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let str = '';
      let i = 0;
      while (i < padded.length) {
        const enc1 = b64.indexOf(padded.charAt(i++));
        const enc2 = b64.indexOf(padded.charAt(i++));
        const enc3 = b64.indexOf(padded.charAt(i++));
        const enc4 = b64.indexOf(padded.charAt(i++));
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

        const tokenRedirectUri = googleRequest?.redirectUri || redirectUri;

        const tokenResult = await exchangeCodeAsync(
          {
            clientId,
            code,
            redirectUri: tokenRedirectUri,
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
      showToast.success('Account created with Google!', 'Welcome');
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Google Sign-Up Failed');
    } finally {
      setSocialLoading(null);
    }
  };

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleSuccess(googleResponse);
    } else if (googleResponse) {
      setSocialLoading(null);
    }
  }, [googleResponse]);

  const onGoogleSignUp = async () => {
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
      showToast.error(extractErrorMessage(e), 'Google Sign-Up Failed');
      setSocialLoading(null);
    }
  };

  const onAppleSignUp = async () => {
    if (Platform.OS !== 'ios') {
      showToast.info('Apple ID Sign-In is only available on iOS devices.', 'Apple Sign-Up');
      return;
    }
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      showToast.info('Apple Sign-In is not supported on this device or environment.', 'Apple Sign-Up');
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
      const appleEmail = credential.email ?? `${credential.user}@privaterelay.appleid.com`;
      const appleName = credential.fullName
        ? `${credential.fullName.givenName ?? ''} ${credential.fullName.familyName ?? ''}`.trim()
        : undefined;
      await loginWithSocial({
        provider: 'apple',
        email: appleEmail,
        name: appleName,
        provider_id: credential.user,
      });
      showToast.success('Account created with Apple!', 'Welcome');
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
        showToast.error(rawMsg, 'Apple Sign-Up Failed');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const onSubmit = async () => {
    if (!name || !email || !password || !confirm) {
      showToast.error('Fill in every field to create your account.', 'Missing Information');
      return;
    }
    if (password !== confirm) {
      showToast.error('Your passwords do not match.', 'Password Mismatch');
      return;
    }
    if (password.length < 8) {
      showToast.error('Password must be at least 8 characters long.', 'Password Too Short');
      return;
    }
    if (!consent) {
      showToast.info('Please accept the Terms & Privacy Policy to continue.', 'Terms Required');
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
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast.error(msg, 'Registration Failed');
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
            <Text style={styles.badgeText}>🚀 PARENT ONBOARDING</Text>
          </View>
        </View>

        <Text style={styles.title}>Create your account.</Text>
        <Text style={styles.subtitle}>
          You'll add your child and their WhatsApp number next so Ada can start teaching.
        </Text>

        {/* Glass Form Card */}
        <View style={styles.card}>
          <TextField label="Your Full Name" value={name} onChangeText={setName} placeholder="Charles Aloaye" />
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

          <Button label="Create Account" onPress={onSubmit} loading={loading} variant="amber" style={{ marginTop: 6 }} />

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
              onPress={onGoogleSignUp}
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
              onPress={onAppleSignUp}
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
  footer: { marginTop: 24, alignItems: 'center', paddingBottom: 30 },
  footerText: { fontFamily: type.body, fontSize: 14, color: colors.muted },
  footerLink: { fontFamily: type.bodyBold, color: colors.amberDark },
});
