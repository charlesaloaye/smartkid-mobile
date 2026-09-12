import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, radii, type } from '../../theme';
import { showToast } from '../../utils/toast';
import { extractErrorMessage } from '../../api/client';
import { useAsync } from '../../utils/useAsync';
import {
  cancelSubscription,
  checkoutSubscription,
  fetchSubscription,
  startTrial,
  verifySubscriptionPayment,
} from '../../api/endpoints';
import type { PlanKey } from '../../api/types';

// Safely require expo-web-browser to avoid crashing if native module is missing in current iOS build
let WebBrowser: typeof import('expo-web-browser') | null = null;
try {
  WebBrowser = require('expo-web-browser');
} catch (e) {
  console.warn('ExpoWebBrowser native module is missing in native build:', e);
}

const STARTER_FEATURES = [
  '1 Child account',
  'Unlimited WhatsApp tutoring',
  'Math & Science access',
  '3-Day Free Trial included',
];

const FAMILY_FEATURES = [
  'Up to 3 Children accounts',
  'Unlimited WhatsApp + App + Web',
  'Detailed diagnostic parent analytics',
  'All NERDC Primary & Secondary subjects',
  'Priority AI response speed',
];

const SCHOOL_FEATURES = [
  'Bulk student onboarding',
  'Teacher dashboard & class analytics',
  'Custom curriculum sync',
  'Dedicated account support',
];

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG')}`;
}

function daysLeft(dateStr: string | null): number {
  if (!dateStr) return 0;
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PremiumScreen({ navigation }: any) {
  const { data, loading, reload } = useAsync(fetchSubscription, []);
  const [busy, setBusy] = useState<'trial' | PlanKey | 'cancel' | null>(null);

  const subscription = data?.subscription;
  const plans = data?.plans;

  const handleStartTrial = async () => {
    setBusy('trial');
    try {
      await startTrial();
      showToast.success("Your 3-day free trial has been activated!", "Trial Started");
      await reload();
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Could Not Start Trial');
    } finally {
      setBusy(null);
    }
  };

  const handleCheckout = async (plan: PlanKey) => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Subscription Managed Online',
        'SmartKid Tutor subscriptions are managed via our web portal. If your family has an existing subscription, it is automatically active on this device.'
      );
      return;
    }
    setBusy(plan);
    try {
      const redirectUrl = Linking.createURL('payment-callback');
      const { authorization_url } = await checkoutSubscription(plan, redirectUrl);

      if (WebBrowser && typeof WebBrowser.openAuthSessionAsync === 'function') {
        const result = await WebBrowser.openAuthSessionAsync(authorization_url, redirectUrl);

        if (result.type === 'success' && result.url) {
          const parsed = Linking.parse(result.url);
          const reference = (parsed.queryParams?.reference || parsed.queryParams?.trxref) as string | undefined;

          if (reference) {
            const verifyRes = await verifySubscriptionPayment(reference);
            if (verifyRes.status === 'success') {
              showToast.success('Your plan is now active. Welcome aboard!', 'Payment Successful');
              await reload();
            } else {
              showToast.error('This payment was not completed. No charge was made.', 'Payment Not Confirmed');
            }
          } else {
            showToast.info('We could not confirm the payment automatically. Pull to refresh in a moment.', 'Checkout Closed');
          }
        } else {
          showToast.info('Checkout was closed before completing payment.', 'Checkout Cancelled');
        }
      } else {
        await Linking.openURL(authorization_url);
      }
    } catch (e) {
      showToast.error(extractErrorMessage(e), 'Checkout Failed');
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel subscription',
      'You will keep access until the end of your current billing period. Continue?',
      [
        { text: 'Keep Plan', style: 'cancel' },
        {
          text: 'Cancel Plan',
          style: 'destructive',
          onPress: async () => {
            setBusy('cancel');
            try {
              const res = await cancelSubscription();
              showToast.success(res.message, 'Subscription Updated');
              await reload();
            } catch (e) {
              showToast.error(extractErrorMessage(e), 'Could Not Cancel');
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  };

  if (loading || !subscription || !plans) {
    return (
      <View style={[styles.content, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.amber} size="large" />
      </View>
    );
  }

  const { plan, has_active_access, status, trial_ends_at, current_period_ends_at, has_used_trial, cancel_at_period_end } =
    subscription;

  let statusTitle = 'Free Tier Account';
  let statusSubtitle = 'Start your 3-day free trial to unlock Ada.';
  if (status === 'trialing' && has_active_access) {
    statusTitle = `Free Trial · ${daysLeft(trial_ends_at)}d left`;
    statusSubtitle = `Ends ${formatDate(trial_ends_at)}`;
  } else if (status === 'active' && has_active_access) {
    statusTitle = plan === 'family' ? 'Family Plan · Active' : 'Starter Plan · Active';
    statusSubtitle = cancel_at_period_end
      ? `Ends ${formatDate(current_period_ends_at)} (won't renew)`
      : `Renews ${formatDate(current_period_ends_at)}`;
  } else if (has_used_trial || status === 'past_due' || status === 'canceled') {
    statusTitle = status === 'past_due' ? 'Payment Failed' : 'No Active Plan';
    statusSubtitle = Platform.OS === 'ios'
      ? 'Manage your subscription on your parent web account.'
      : 'Choose a plan below to bring Ada back online.';
  }

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.close} onPress={() => navigation.goBack()} hitSlop={10}>
        <Icon name="x" size={16} color={colors.charcoal} />
      </Pressable>

      <Text style={styles.title}>
        {Platform.OS === 'ios' ? 'Subscription & Account Status' : 'Upgrade SmartKid Tutor'}
      </Text>
      <Text style={styles.subtitle}>
        {Platform.OS === 'ios'
          ? 'SmartKid Tutor multi-platform family access and learning overview.'
          : "Choose the best plan for your family's learning journey."}
      </Text>

      <Card style={styles.statusCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>{statusTitle}</Text>
          <Text style={styles.statusSubtitle}>{statusSubtitle}</Text>
        </View>
        {has_active_access && (
          <Pressable onPress={handleCancel} disabled={busy === 'cancel' || cancel_at_period_end} hitSlop={8}>
            {busy === 'cancel' ? (
              <ActivityIndicator color={colors.danger} size="small" />
            ) : (
              <Text style={[styles.cancelLink, cancel_at_period_end && { opacity: 0.4 }]}>
                {cancel_at_period_end ? 'Cancelling' : 'Cancel'}
              </Text>
            )}
          </Pressable>
        )}
      </Card>

      {/* Starter Plan */}
      <View style={[styles.planCard, plan === 'starter' && has_active_access && styles.planSelected]}>
        <View style={[styles.tag, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D', borderWidth: 1 }]}>
          <Text style={[styles.tagText, { color: colors.amberDark }]}>3-Day Trial</Text>
        </View>
        <Text style={styles.planName}>Starter</Text>
        <Text style={styles.planPrice}>{formatNaira(plans.starter.amount)}<Text style={styles.planPeriod}> /month</Text></Text>
        <Text style={styles.planDesc}>Perfect for a single child just getting started.</Text>

        {STARTER_FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Icon name="check" size={13} color={colors.amber} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}

        {plan === 'starter' && has_active_access ? (
          <View style={styles.currentPlanBadge}>
            <Icon name="check" size={13} color="#059669" />
            <Text style={styles.currentPlanText}>Current Plan</Text>
          </View>
        ) : !has_used_trial ? (
          <Button label="Start 3-Day Free Trial" onPress={handleStartTrial} loading={busy === 'trial'} variant="amber" style={{ marginTop: 12 }} />
        ) : Platform.OS === 'ios' ? (
          <View style={styles.webManagedBadge}>
            <Icon name="info" size={13} color={colors.muted} />
            <Text style={styles.webManagedText}>Managed Online</Text>
          </View>
        ) : (
          <Button label="Subscribe to Starter" onPress={() => handleCheckout('starter')} loading={busy === 'starter'} variant="amber" style={{ marginTop: 12 }} />
        )}
      </View>

      {/* Family Plan */}
      <View style={[styles.planCard, styles.planHighlight, plan === 'family' && has_active_access && styles.planSelected]}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>Most Popular</Text>
        </View>
        <Text style={styles.planName}>Family Plan</Text>
        <Text style={styles.planPrice}>{formatNaira(plans.family.amount)}<Text style={styles.planPeriod}> /month</Text></Text>
        <Text style={styles.planDesc}>Ideal for families wanting multi-child tutoring.</Text>

        {FAMILY_FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Icon name="check" size={13} color={colors.amber} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}

        {plan === 'family' && has_active_access ? (
          <View style={styles.currentPlanBadge}>
            <Icon name="check" size={13} color="#059669" />
            <Text style={styles.currentPlanText}>Current Plan</Text>
          </View>
        ) : Platform.OS === 'ios' ? (
          <View style={styles.webManagedBadge}>
            <Icon name="info" size={13} color={colors.muted} />
            <Text style={styles.webManagedText}>Managed Online</Text>
          </View>
        ) : (
          <Button label="Get Family Plan" onPress={() => handleCheckout('family')} loading={busy === 'family'} variant="amber" style={{ marginTop: 12 }} />
        )}
      </View>

      {/* School Partner */}
      <View style={[styles.planCard, { opacity: 0.75 }]}>
        <View style={[styles.tag, { backgroundColor: '#F3F4F6' }]}>
          <Text style={[styles.tagText, { color: colors.muted }]}>Coming soon</Text>
        </View>
        <Text style={styles.planName}>School Partner</Text>
        <Text style={styles.planPrice}>₦79,999<Text style={styles.planPeriod}> /school term</Text></Text>
        <Text style={styles.planDesc}>Tailored for primary & secondary schools.</Text>

        {SCHOOL_FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Icon name="check" size={13} color={colors.mutedLight} />
            <Text style={[styles.featureText, { color: colors.muted }]}>{f}</Text>
          </View>
        ))}

        <Button
          label="Coming Soon"
          onPress={() => {}}
          disabled={true}
          variant="ghost"
          style={{ marginTop: 12 }}
        />
      </View>

      {Platform.OS === 'ios' ? (
        <View style={styles.iosInfoCard}>
          <Icon name="shield" size={14} color={colors.teal} />
          <Text style={styles.iosInfoText}>
            Multi-Platform Sync: Subscriptions activated on smartkidtutor.ng automatically unlock access across all iOS and Android devices signed into this parent account.
          </Text>
        </View>
      ) : (
        <View style={styles.trustRow}>
          <Icon name="shield" size={13} color={colors.mutedLight} />
          <Text style={styles.trustText}>Payments secured by Paystack — card, USSD & transfer.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 50 },
  close: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(31,41,55,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { fontFamily: type.display, fontSize: 23, color: colors.charcoal, marginBottom: 6, lineHeight: 28 },
  subtitle: { fontFamily: type.body, fontSize: 13.5, lineHeight: 20, color: colors.muted, marginBottom: 20 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 18, borderWidth: 1, borderColor: 'rgba(26, 95, 122, 0.08)',
  },
  statusTitle: { fontFamily: type.bodySemi, fontSize: 14, color: colors.charcoal },
  statusSubtitle: { fontFamily: type.bodyMedium, fontSize: 11.5, color: colors.mutedLight, marginTop: 2 },
  cancelLink: { fontFamily: type.bodyBold, fontSize: 12, color: colors.danger },
  planCard: {
    borderRadius: radii.lg, padding: 18, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.white, marginBottom: 16, position: 'relative'
  },
  planHighlight: { borderColor: colors.amber },
  planSelected: { borderWidth: 2, borderColor: colors.amberDark },
  tag: { position: 'absolute', top: -11, right: 16, backgroundColor: colors.amber, borderRadius: radii.pill, paddingVertical: 3, paddingHorizontal: 10 },
  tagText: { fontFamily: type.bodyBold, fontSize: 9.5, color: colors.white, textTransform: 'uppercase' },
  planName: { fontFamily: type.displaySemi, fontSize: 16, color: colors.charcoal, marginBottom: 2 },
  planPrice: { fontFamily: type.display, fontSize: 26, color: colors.amberDark, marginBottom: 4 },
  planPeriod: { fontFamily: type.bodyMedium, fontSize: 12, color: colors.mutedLight },
  planDesc: { fontFamily: type.bodyMedium, fontSize: 12, color: colors.muted, marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureText: { fontFamily: type.bodyMedium, fontSize: 12.5, color: colors.charcoal },
  currentPlanBadge: {
    marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: radii.xl, paddingVertical: 14,
  },
  currentPlanText: { fontFamily: type.bodyBold, fontSize: 12.5, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5 },
  webManagedBadge: {
    marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(31, 41, 55, 0.05)', borderWidth: 1, borderColor: 'rgba(31, 41, 55, 0.1)',
    borderRadius: radii.xl, paddingVertical: 14,
  },
  webManagedText: { fontFamily: type.bodyBold, fontSize: 12.5, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  iosInfoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(26, 95, 122, 0.06)', borderRadius: radii.md,
    padding: 14, marginTop: 10, borderWidth: 1, borderColor: 'rgba(26, 95, 122, 0.12)'
  },
  iosInfoText: { fontFamily: type.bodyMedium, fontSize: 11.5, color: colors.teal, flexShrink: 1, lineHeight: 16 },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'center', marginTop: 12 },
  trustText: { fontFamily: type.bodyMedium, fontSize: 10.5, color: colors.mutedLight, flexShrink: 1, textAlign: 'center' },
});
