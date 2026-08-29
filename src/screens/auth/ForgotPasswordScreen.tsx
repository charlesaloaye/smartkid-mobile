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
import { colors, radii, shadow, type } from '../../theme';
import { forgotPassword } from '../../api/endpoints';
import { extractErrorMessage } from '../../api/client';
import { showToast } from '../../utils/toast';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) {
      showToast.error('Please enter your email address.', 'Email Required');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      showToast.success('Check your inbox for the reset code.', 'Email Sent!');
      navigation.navigate('ResetPassword', { email: email.trim() });
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Request Failed');
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
            <Text style={styles.badgeText}>🔒 PASSWORD RESET</Text>
          </View>
        </View>

        <Text style={styles.title}>{'Forgot your\npassword?'}</Text>
        <Text style={styles.subtitle}>
          No worries! Enter the email linked to your account and we'll send you a reset code.
        </Text>

        <View style={styles.card}>
          <View style={styles.iconBubble}>
            <Icon name="envelope" size={28} color={colors.teal} />
          </View>

          <TextField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="name@example.com"
          />

          <Button
            label="Send Reset Code"
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
            Back to <Text style={styles.footerLink}>Sign In</Text>
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: radii.xxl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadow.card,
  },
  iconBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(26, 95, 122, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
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
