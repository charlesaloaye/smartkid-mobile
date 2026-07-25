import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, type } from '../theme';

type Tone = 'amber' | 'sage' | 'coral' | 'light' | 'teal';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  amber: { bg: 'rgba(217,119,6,0.12)', fg: colors.amberDark },
  sage: { bg: 'rgba(107,142,127,0.16)', fg: '#3f5c50' },
  coral: { bg: 'rgba(231,111,81,0.14)', fg: '#b8441f' },
  light: { bg: 'rgba(255,255,255,0.18)', fg: colors.white },
  teal: { bg: 'rgba(26,95,122,0.1)', fg: colors.teal },
};

export function Pill({ label, tone = 'amber' }: { label: string; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 11,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: type.bodyBold,
    fontSize: 11,
  },
});
