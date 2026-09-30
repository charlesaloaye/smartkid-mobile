import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, type } from '../theme';
import { OtaStatus } from '../hooks/useOtaUpdate';
import { Icon } from './Icon';

interface OtaUpdateBannerProps {
  status: OtaStatus;
  errorMessage?: string;
  onUpdate: () => void;
  onDismiss: () => void;
}

const BANNER_HEIGHT = 64;

export function OtaUpdateBanner({
  status,
  errorMessage,
  onUpdate,
  onDismiss,
}: OtaUpdateBannerProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-BANNER_HEIGHT - 20)).current;

  const visible = status === 'available' || status === 'downloading' || status === 'ready' || status === 'error';

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? insets.top + spacing.sm : -(BANNER_HEIGHT + 20),
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [visible, insets.top]);


  const isDownloading = status === 'downloading' || status === 'ready';
  const isError = status === 'error';

  const bgColor = isError ? '#FEF2F2' : '#E0F2FE';
  const borderColor = isError ? '#FCA5A5' : '#7DD3FC';
  const iconColor = isError ? '#DC2626' : colors.teal;
  const titleColor = isError ? '#991B1B' : colors.tealDark;
  const messageColor = isError ? '#7F1D1D' : colors.teal;

  const title = isError
    ? 'Update failed'
    : status === 'ready'
    ? 'Restarting…'
    : isDownloading
    ? 'Downloading update…'
    : '🚀 Update available!';

  const subtitle = isError
    ? (errorMessage ?? 'Something went wrong. Tap to retry.')
    : status === 'ready'
    ? 'Applying update now.'
    : isDownloading
    ? 'Please wait a moment.'
    : 'Tap to install the latest SmartKid update.';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ translateY: slideAnim }] },
      ]}
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      <Pressable
        style={[styles.banner, { backgroundColor: bgColor, borderColor }]}
        onPress={isError ? onUpdate : status === 'available' ? onUpdate : undefined}
        android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      >
        {/* Left icon */}
        <View style={[styles.iconWrap, { backgroundColor: isError ? '#FEE2E2' : '#BAE6FD' }]}>
          {isDownloading ? (
            <ActivityIndicator size={18} color={iconColor} />
          ) : (
            <Icon
              name={isError ? 'alert-circle' : 'download'}
              size={20}
              color={iconColor}
            />
          )}
        </View>

        {/* Text */}
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: messageColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {/* CTA / Dismiss */}
        {status === 'available' && (
          <View style={styles.actions}>
            <Pressable
              style={[styles.ctaBtn, { backgroundColor: colors.teal }]}
              onPress={onUpdate}
              hitSlop={6}
            >
              <Text style={styles.ctaText}>Update</Text>
            </Pressable>
            <Pressable onPress={onDismiss} style={styles.closeBtn} hitSlop={10}>
              <Icon name="x" size={14} color={titleColor} />
            </Pressable>
          </View>
        )}

        {status === 'error' && (
          <Pressable onPress={onDismiss} style={styles.closeBtn} hitSlop={10}>
            <Icon name="x" size={14} color={titleColor} />
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    elevation: 20,
  },
  banner: {
    height: BANNER_HEIGHT,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontFamily: type.bodyBold,
    fontSize: 13.5,
    letterSpacing: -0.2,
    marginBottom: 1,
  },
  subtitle: {
    fontFamily: type.bodyMedium,
    fontSize: 11.5,
    lineHeight: 15,
    opacity: 0.85,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  ctaBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  ctaText: {
    fontFamily: type.bodySemi,
    fontSize: 12.5,
    color: '#fff',
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 4,
    opacity: 0.7,
  },
});
