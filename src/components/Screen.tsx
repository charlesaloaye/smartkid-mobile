import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  background?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  style?: ViewStyle;
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  background = colors.cream,
  statusBarStyle = 'dark-content',
  style,
}: Props) {
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={[padded && styles.padded, style]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, padded && styles.padded, style]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  padded: { paddingHorizontal: 22 },
});
