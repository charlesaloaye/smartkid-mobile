import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, type } from '../theme';
import { Icon, IconName } from './Icon';

type Tone = 'amber' | 'sage' | 'coral' | 'light' | 'teal';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  amber: { bg: 'rgba(217,119,6,0.12)', fg: colors.amberDark },
  sage: { bg: 'rgba(107,142,127,0.16)', fg: '#2E614C' },
  coral: { bg: 'rgba(231,111,81,0.14)', fg: '#b8441f' },
  light: { bg: 'rgba(255,255,255,0.18)', fg: colors.white },
  teal: { bg: 'rgba(26,95,122,0.1)', fg: colors.teal },
};

export function Pill({
  label,
  tone = 'amber',
  icon,
}: {
  label: string;
  tone?: Tone;
  icon?: IconName;
}) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      {icon && (
        <View style={styles.iconWrap}>
          <Icon name={icon} size={13} color={t.fg} />
        </View>
      )}
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radii.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    marginRight: 5,
  },
  text: {
    fontFamily: type.bodyBold,
    fontSize: 11,
  },
});

