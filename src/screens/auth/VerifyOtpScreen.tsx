import React, { useState, useEffect } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { OtpInput } from '../../components/OtpInput';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { colors, radii, shadow, type } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { showToast } from '../../utils/toast';
import { verifyOtpApi, resendOtpApi } from '../../api/endpoints';

export default function VerifyOtpScreen({ route, navigation }: any) {
  const { refreshUser, updateUser, logout } = useAuth();
  const email = route?.params?.email ?? '';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // ignore
    }
  };

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const onVerify = async () => {
    if (otpCode.trim().length !== 6) {
      showToast.warning('Please enter the full 6-digit verification code.', 'Incomplete Code');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpApi(otpCode.trim());
      if (res.user) {
        updateUser(res.user);
      }
      await refreshUser();
      showToast.success('Email verified successfully! Welcome aboard.', 'Verified 🎉');
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Verification Failed');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (countdown > 0 || resending) return;

    setResending(true);
    try {
      await resendOtpApi();
      showToast.success('A new 6-digit code has been sent to your email.', 'Code Sent');
      setCountdown(60);
      setOtpCode('');
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Resend Failed');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../../../assets/auth_bg.jpg')}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.18 }}
        resizeMode="cover"
      />

      <Screen scroll background="transparent" statusBarStyle="dark-content">
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✨ SMARTKID TUTOR • VERIFICATION</Text>
          </View>
        </View>

        <Text style={styles.title}>Verify your email.</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {email ? <Text style={styles.emailText}>{email}</Text> : 'your email'}. Enter it below to activate your account.
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>6-DIGIT VERIFICATION CODE</Text>
          <OtpInput
            code={otpCode}
            onCodeChange={setOtpCode}
            length={6}
            autoFocus
            disabled={loading}
          />

          <Button
            label="Verify Account"
            onPress={onVerify}
            loading={loading}
            disabled={otpCode.trim().length !== 6}
            variant="teal"
            style={{ marginTop: 16 }}
          />

          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={styles.resendText}>
                Resend code in <Text style={styles.countdownText}>{countdown}s</Text>
              </Text>
            ) : (
              <Pressable onPress={onResend} disabled={resending} hitSlop={10}>
                <Text style={styles.resendLink}>
                  {resending ? 'Sending code...' : 'Resend Verification Code'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Footer Navigation */}
        <Pressable
          style={styles.footer}
          onPress={handleLogout}
        >
          <Text style={styles.footerText}>
            Wrong email? <Text style={styles.footerLink}>Back to Login</Text>
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
  root: { flex: 1, backgroundColor: '#FBF7EE' },
  badgeContainer: { alignItems: 'flex-start', marginTop: 30, marginBottom: 14 },
  badge: {
    backgroundColor: 'rgba(26, 95, 122, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.2)',
  },
  badgeText: { fontFamily: type.bodyBold, fontSize: 10, letterSpacing: 1, color: colors.teal },
  title: { fontFamily: type.displayBlack, fontSize: 32, color: colors.charcoal, marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontFamily: type.body, fontSize: 15, color: colors.muted, lineHeight: 22, marginBottom: 24 },
  emailText: { fontFamily: type.bodyBold, color: colors.charcoal },
  formContainer: {
    marginVertical: 4,
  },
  inputLabel: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    letterSpacing: 0.9,
    color: colors.mutedLight,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  resendRow: { alignItems: 'center', marginTop: 22 },
  resendText: { fontFamily: type.bodyMedium, fontSize: 13.5, color: colors.muted },
  countdownText: { fontFamily: type.bodyBold, color: colors.charcoal },
  resendLink: { fontFamily: type.bodyBold, fontSize: 13.5, color: colors.teal, textDecorationLine: 'underline' },
  footer: { marginTop: 32, alignItems: 'center', paddingBottom: 10 },
  footerText: { fontFamily: type.body, fontSize: 14, color: colors.muted },
  footerLink: { fontFamily: type.bodyBold, color: colors.teal },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 30,
  },
  trustText: {
    fontFamily: type.bodyMedium,
    fontSize: 11.5,
    color: colors.textDim,
    letterSpacing: 0.3,
  },
});
