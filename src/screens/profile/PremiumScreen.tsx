import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { colors, radii, type } from '../../theme';

const FREE_FEATURES = ['1 subject at a time', '15 min/day tutor chat', 'Weekly progress snapshot'];
const PREMIUM_FEATURES = [
  'All subjects, all classes',
  'Unlimited chat + voice tutoring',
  'Full progress reports',
  'Priority NERDC term updates',
];

export default function PremiumScreen({ navigation }: any) {
  const [notifyMe, setNotifyMe] = useState(false);

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.close} onPress={() => navigation.goBack()} hitSlop={10}>
        <Icon name="x" size={16} color={colors.charcoal} />
      </Pressable>

      <Text style={styles.title}>Upgrade your child's learning</Text>
      <Text style={styles.subtitle}>Premium is launching soon — join the list to be first in.</Text>

      <View style={styles.planCard}>
        <Text style={styles.planName}>Free</Text>
        <Text style={styles.planPrice}>₦0<Text style={styles.planPeriod}> /month</Text></Text>
        {FREE_FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Icon name="check" size={13} color={colors.sage} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.planCard, styles.planHighlight]}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>Coming soon</Text>
        </View>
        <Text style={styles.planName}>Premium</Text>
        <Text style={styles.planPrice}>₦2,500<Text style={styles.planPeriod}> /month</Text></Text>
        {PREMIUM_FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Icon name="check" size={13} color={colors.sage} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <Button
        label={notifyMe ? "You're on the list" : 'Notify me at launch'}
        onPress={() => {
          setNotifyMe(true);
          Alert.alert("You're on the list!", "We'll let you know the moment Premium is ready.");
        }}
        variant="amber"
        disabled={notifyMe}
        style={{ marginTop: 8 }}
      />

      <View style={styles.trustRow}>
        <Icon name="shield" size={13} color={colors.mutedLight} />
        <Text style={styles.trustText}>Payments will be secured by Paystack — card, USSD & transfer.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 50 },
  close: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(31,41,55,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { fontFamily: type.display, fontSize: 23, color: colors.charcoal, marginBottom: 8, lineHeight: 28 },
  subtitle: { fontFamily: type.body, fontSize: 13.5, lineHeight: 20, color: colors.muted, marginBottom: 24 },
  planCard: {
    borderRadius: radii.lg, padding: 18, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.white, marginBottom: 14,
  },
  planHighlight: { borderColor: colors.amber, position: 'relative' },
  tag: { position: 'absolute', top: -10, right: 16, backgroundColor: colors.amber, borderRadius: radii.pill, paddingVertical: 4, paddingHorizontal: 10 },
  tagText: { fontFamily: type.bodyBold, fontSize: 9.5, color: colors.white },
  planName: { fontFamily: type.displaySemi, fontSize: 14.5, color: colors.charcoal, marginBottom: 4 },
  planPrice: { fontFamily: type.display, fontSize: 24, color: colors.charcoal, marginBottom: 12 },
  planPeriod: { fontFamily: type.bodyMedium, fontSize: 12, color: colors.mutedLight },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureText: { fontFamily: type.bodyMedium, fontSize: 12.5, color: colors.charcoal },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'center', marginTop: 16 },
  trustText: { fontFamily: type.bodyMedium, fontSize: 10.5, color: colors.mutedLight, flexShrink: 1, textAlign: 'center' },
});
