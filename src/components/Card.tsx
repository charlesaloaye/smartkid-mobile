import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, shadow } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow.soft,
  },
});
