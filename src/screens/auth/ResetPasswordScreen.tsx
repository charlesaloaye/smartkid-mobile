import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { OtpInput } from '../../components/OtpInput';
import { colors, radii, shadow, type } from '../../theme';
import { resetPassword } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { showToast } from '../../utils/toast';

export default function ResetPasswordScreen({ route, navigation }: any) {
  const email: string = route?.params?.email ?? '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (otp.length < 6) {
      showToast.error('Enter the 6-digit code from your email.', 'Code Required');
      return;
    }
    if (!password || password.length < 8) {
      showToast.error('Password must be at least 8 characters.', 'Weak Password');
      return;
    }
    if (password !== passwordConfirmation) {
      showToast.error('Passwords do not match.', 'Mismatch');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email,
        token: otp,
        password,
        password_confirmation: passwordConfirmation,
      });
      showToast.success('Your password has been reset. Please log in.', 'Success!');
      navigation.navigate('Login');
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Reset Failed');
    } finally {
      setLoading(false);
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
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo-horizontal.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🔑 NEW PASSWORD</Text>
          </View>
        </View>

        <Text style={styles.title}>{'Reset your\npassword'}</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code we sent to{' '}
          <Text style={styles.emailHighlight}>{email}</Text>, then choose a new password.
        </Text>

        <View style={styles.card}>
          {/* OTP Section */}
          <Text style={styles.sectionLabel}>Reset Code</Text>
          <OtpInput code={otp} onCodeChange={setOtp} autoFocus />

          {/* Divider */}
          <View style={styles.divider} />

          {/* New password fields */}
          <TextField
            label="New Password"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
            placeholder="At least 8 characters"
          />
          <TextField
            label="Confirm New Password"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            isPassword
            autoCapitalize="none"
            placeholder="Repeat your new password"
          />

          <Button
            label="Reset Password"
            onPress={onSubmit}
            loading={loading}
            variant="amber"
            style={{ marginTop: 8 }}
          />
        </View>

        <Pressable
          style={styles.footer}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={14} color={colors.teal} />
          <Text style={styles.footerText}>
            Back to <Text style={styles.footerLink}>Forgot Password</Text>
          </Text>
        </Pressable>

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
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: type.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 24,
  },
  emailHighlight: {
    fontFamily: type.bodyBold,
    color: colors.teal,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: radii.xxl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadow.card,
  },
  sectionLabel: {
    fontFamily: type.bodySemi,
    fontSize: 13,
    color: colors.charcoal,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginVertical: 16,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 10,
  },
  footerText: {
    fontFamily: type.body,
    fontSize: 14,
    color: colors.muted,
  },
  footerLink: {
    fontFamily: type.bodyBold,
    color: colors.amberDark,
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
