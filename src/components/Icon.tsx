import React from 'react';
import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName =
  | 'home' | 'grid' | 'chat' | 'mic' | 'chart' | 'user' | 'flame'
  | 'lock' | 'check' | 'chevron-right' | 'chevron-left' | 'star'
  | 'shield' | 'x' | 'bell' | 'sparkle' | 'phone-end' | 'card'
  | 'calendar' | 'arrow-right' | 'whatsapp' | 'logout' | 'plus'
  | 'eye' | 'eye-off';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 20, color = '#1F2937' }: Props) {
  switch (name) {
    case 'home':
      return <Feather name="home" size={size} color={color} />;
    case 'grid':
      return <Feather name="grid" size={size} color={color} />;
    case 'chat':
      return <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />;
    case 'mic':
      return <Feather name="mic" size={size} color={color} />;
    case 'chart':
      return <Feather name="bar-chart-2" size={size} color={color} />;
    case 'user':
      return <Feather name="user" size={size} color={color} />;
    case 'flame':
      return <Ionicons name="flame" size={size} color={color} />;
    case 'lock':
      return <Feather name="lock" size={size} color={color} />;
    case 'check':
      return <Feather name="check" size={size} color={color} />;
    case 'chevron-right':
      return <Feather name="chevron-right" size={size} color={color} />;
    case 'chevron-left':
      return <Feather name="chevron-left" size={size} color={color} />;
    case 'star':
      return <Ionicons name="star" size={size} color={color} />;
    case 'shield':
      return <Feather name="shield" size={size} color={color} />;
    case 'x':
      return <Feather name="x" size={size} color={color} />;
    case 'bell':
      return <Feather name="bell" size={size} color={color} />;
    case 'sparkle':
      return <Ionicons name="sparkles-outline" size={size} color={color} />;
    case 'phone-end':
      return <MaterialCommunityIcons name="phone-hangup" size={size} color={color} />;
    case 'card':
      return <Feather name="credit-card" size={size} color={color} />;
    case 'calendar':
      return <Feather name="calendar" size={size} color={color} />;
    case 'arrow-right':
      return <Feather name="arrow-right" size={size} color={color} />;
    case 'whatsapp':
      return <Ionicons name="logo-whatsapp" size={size} color={color} />;
    case 'logout':
      return <Feather name="log-out" size={size} color={color} />;
    case 'plus':
      return <Feather name="plus" size={size} color={color} />;
    case 'eye':
      return <Feather name="eye" size={size} color={color} />;
    case 'eye-off':
      return <Feather name="eye-off" size={size} color={color} />;
    default:
      return null;
  }
}
