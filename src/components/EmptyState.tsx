import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, IconName } from './Icon';
import { Card } from './Card';
import { colors, radii, type } from '../theme';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <Card style={[styles.card, compact ? styles.compactCard : undefined]}>
      <View style={[styles.iconBg, compact ? styles.compactIconBg : undefined]}>
        <Icon name={icon} size={compact ? 20 : 26} color={colors.teal} />
      </View>
      <Text style={[styles.title, compact ? styles.compactTitle : undefined]}>{title}</Text>
      <Text style={[styles.description, compact ? styles.compactDescription : undefined]}>
        {description}
      </Text>
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionGroup}>
          {actionLabel && onAction && (
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={onAction}
            >
              <LinearGradient
                colors={[colors.teal, colors.tealDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>{actionLabel}</Text>
                <Icon name="arrow-right" size={14} color={colors.white} />
              </LinearGradient>
            </Pressable>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onSecondaryAction}
            >
              <Text style={styles.secondaryBtnText}>{secondaryActionLabel}</Text>
            </Pressable>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 22,
    marginVertical: 8,
  },
  compactCard: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(26, 95, 122, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  compactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 10,
  },
  title: {
    fontFamily: type.displaySemi,
    fontSize: 15.5,
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: 6,
  },
  compactTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    fontFamily: type.body,
    fontSize: 12.5,
    lineHeight: 18.5,
    color: colors.mutedLight,
    textAlign: 'center',
    maxWidth: 290,
    marginBottom: 18,
  },
  compactDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  actionGroup: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  primaryBtn: {
    borderRadius: radii.md,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 210,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  primaryBtnText: {
    fontFamily: type.displaySemi,
    fontSize: 13,
    color: colors.white,
  },
  secondaryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  secondaryBtnText: {
    fontFamily: type.bodySemi,
    fontSize: 12.5,
    color: colors.teal,
  },
});
