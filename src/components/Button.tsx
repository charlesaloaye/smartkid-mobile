import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, radii, shadow, type } from '../theme';

type Variant = 'amber' | 'teal' | 'outline' | 'outline-light' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'amber', disabled, loading, style }: Props) {
  const isOutline = variant === 'outline' || variant === 'outline-light';
  const bg =
    variant === 'amber' ? colors.amber : variant === 'teal' ? colors.teal : 'transparent';
  const borderColor = variant === 'outline' ? colors.teal : variant === 'outline-light' ? 'rgba(255,255,255,0.25)' : 'transparent';
  const textColor =
    variant === 'outline' ? colors.teal : colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor, borderWidth: isOutline ? 1.5 : 0 },
        variant === 'amber' && shadow.glowAmber,
        variant === 'teal' && shadow.glowTeal,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.teal : colors.white} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: type.displaySemi,
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
