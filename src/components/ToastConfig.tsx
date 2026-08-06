import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Toast, { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { Icon, IconName } from './Icon';
import { colors, radii, shadow, type } from '../theme';

interface CustomToastProps {
  type: 'error' | 'success' | 'info' | 'warning';
  title?: string;
  message?: string;
  onHide?: () => void;
}

const toastTypeConfig: Record<
  CustomToastProps['type'],
  {
    icon: IconName;
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    titleColor: string;
    messageColor: string;
    defaultTitle: string;
  }
> = {
  error: {
    icon: 'alert-circle',
    bg: '#FEF2F2',
    border: '#FCA5A5',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    titleColor: '#991B1B',
    messageColor: '#7F1D1D',
    defaultTitle: 'Error',
  },
  success: {
    icon: 'check-circle',
    bg: '#F0FDF4',
    border: '#86EFAC',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    titleColor: '#166534',
    messageColor: '#14532D',
    defaultTitle: 'Success',
  },
  warning: {
    icon: 'alert-triangle',
    bg: '#FFFBEB',
    border: '#FCD34D',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    titleColor: '#92400E',
    messageColor: '#78350F',
    defaultTitle: 'Warning',
  },
  info: {
    icon: 'info',
    bg: '#F0F9FF',
    border: '#7DD3FC',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
    titleColor: '#075985',
    messageColor: '#0C4A6E',
    defaultTitle: 'Notification',
  },
};

const CustomToastCard = ({
  type,
  text1,
  text2,
  onPress,
}: ToastConfigParams<any> & { type: CustomToastProps['type'] }) => {
  const cfg = toastTypeConfig[type];
  const title = text1 || cfg.defaultTitle;
  const message = text2;

  return (
    <Pressable style={[styles.container, { backgroundColor: cfg.bg, borderColor: cfg.border }]} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: cfg.iconBg }]}>
        <Icon name={cfg.icon} size={20} color={cfg.iconColor} />
      </View>
      <View style={styles.textContainer}>
        {!!title && <Text style={[styles.title, { color: cfg.titleColor }]}>{title}</Text>}
        {!!message && <Text style={[styles.message, { color: cfg.messageColor }]}>{message}</Text>}
      </View>
      <Pressable onPress={() => Toast.hide()} style={styles.closeBtn} hitSlop={8}>
        <Icon name="x" size={14} color={cfg.titleColor} />
      </Pressable>
    </Pressable>
  );
};

export const customToastConfig: ToastConfig = {
  error: (props) => <CustomToastCard {...props} type="error" />,
  success: (props) => <CustomToastCard {...props} type="success" />,
  warning: (props) => <CustomToastCard {...props} type="warning" />,
  info: (props) => <CustomToastCard {...props} type="info" />,
};

const styles = StyleSheet.create({
  container: {
    width: '92%',
    minHeight: 56,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: type.bodyBold,
    fontSize: 14,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  message: {
    fontFamily: type.bodyMedium,
    fontSize: 12.5,
    lineHeight: 17,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 8,
    opacity: 0.7,
  },
});
