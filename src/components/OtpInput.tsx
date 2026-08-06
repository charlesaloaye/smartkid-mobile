import React, { useRef, useState, useEffect } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { colors, radii, shadow, type } from '../theme';

interface OtpInputProps {
  code: string;
  onCodeChange: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function OtpInput({
  code,
  onCodeChange,
  length = 6,
  autoFocus = true,
  disabled = false,
}: OtpInputProps) {
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);

  const codeDigits = Array.from({ length }, (_, i) => code[i] || '');

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      const timer = setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleChangeText = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');

    // Handle paste or iOS auto-fill of multi-digit code (e.g. "123456")
    if (cleaned.length > 1) {
      const fullCode = cleaned.slice(0, length);
      onCodeChange(fullCode);
      const nextIdx = Math.min(fullCode.length, length - 1);
      inputsRef.current[nextIdx]?.focus();
      return;
    }

    // Normal single digit entry
    const newDigits = [...codeDigits];
    newDigits[index] = cleaned;
    const newCodeString = newDigits.join('');
    onCodeChange(newCodeString);

    if (cleaned.length === 1 && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      // If current box is empty and index > 0, clear previous box and focus it
      if (!codeDigits[index] && index > 0) {
        const newDigits = [...codeDigits];
        newDigits[index - 1] = '';
        onCodeChange(newDigits.join(''));
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.boxesRow}>
        {Array.from({ length }).map((_, index) => {
          const digit = codeDigits[index];
          const isFocused = focusedIndex === index;
          const isFilled = digit.length > 0;

          return (
            <TextInput
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex((prev) => (prev === index ? null : prev))}
              keyboardType="number-pad"
              maxLength={6}
              textContentType={index === 0 ? 'oneTimeCode' : undefined}
              autoComplete={index === 0 ? 'sms-otp' : undefined}
              editable={!disabled}
              selectTextOnFocus
              style={[
                styles.box,
                isFilled && styles.boxFilled,
                isFocused && styles.boxFocused,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    width: '100%',
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 58,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    fontFamily: type.displaySemi,
    fontSize: 22,
    color: colors.charcoal,
    padding: 0,
  },
  boxFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.teal,
    ...shadow.soft,
  },
  boxFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.teal,
    borderWidth: 2,
    ...shadow.glowTeal,
  },
});
