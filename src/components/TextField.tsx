import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, Pressable } from 'react-native';
import { colors, radii, type } from '../theme';
import { Icon } from './Icon';

type Props = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export function TextField({ label, error, isPassword, style, autoCapitalize, autoCorrect, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!isPassword);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.fieldRow,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#94A3B8"
          secureTextEntry={hidden}
          autoCapitalize={autoCapitalize ?? (isPassword ? 'none' : undefined)}
          autoCorrect={autoCorrect ?? (isPassword ? false : undefined)}
          spellCheck={isPassword ? false : rest.spellCheck}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {isPassword && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} style={styles.eyeBtn}>
            <Icon name={hidden ? 'eye' : 'eye-off'} size={18} color={focused ? colors.teal : colors.textMuted} />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontFamily: type.bodyBold,
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.charcoal,
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  fieldFocused: {
    borderColor: colors.teal,
    backgroundColor: '#FFFFFF',
  },
  fieldError: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: type.bodyMedium,
    fontSize: 15,
    color: colors.charcoal,
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    fontFamily: type.bodyMedium,
    fontSize: 12,
    color: colors.danger,
    marginTop: 6,
  },
});
