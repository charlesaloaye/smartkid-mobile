import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownCircle,
  ArrowRight,
  BarChart2,
  Bell,
  BookOpen,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Flame,
  Home,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Mic,
  Pause,
  PhoneOff,
  Play,
  Plus,
  Send,
  Shield,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  User,
  Volume2,
  X,
} from 'lucide-react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export type IconName =
  | 'home' | 'grid' | 'chat' | 'mic' | 'chart' | 'user' | 'flame'
  | 'lock' | 'check' | 'chevron-right' | 'chevron-left' | 'star'
  | 'shield' | 'x' | 'bell' | 'sparkle' | 'phone-end' | 'card'
  | 'calendar' | 'arrow-right' | 'whatsapp' | 'logout' | 'plus'
  | 'eye' | 'eye-off' | 'alert-circle' | 'check-circle' | 'info' | 'alert-triangle'
  | 'play' | 'pause' | 'volume' | 'envelope'
  | 'book-open' | 'trophy' | 'trending-up'
  | 'camera' | 'image' | 'trash' | 'send' | 'download';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 20, color = '#1F2937', strokeWidth = 2 }: Props) {
  switch (name) {
    case 'download':
      return <ArrowDownCircle size={size} color={color} strokeWidth={strokeWidth} />;
    case 'camera':
      return <Camera size={size} color={color} strokeWidth={strokeWidth} />;
    case 'image':
      return <ImageIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case 'trash':
      return <Trash2 size={size} color={color} strokeWidth={strokeWidth} />;
    case 'home':
      return <Home size={size} color={color} strokeWidth={strokeWidth} />;
    case 'grid':
      return <LayoutGrid size={size} color={color} strokeWidth={strokeWidth} />;
    case 'chat':
      return <MessageCircle size={size} color={color} strokeWidth={strokeWidth} />;
    case 'mic':
      return <Mic size={size} color={color} strokeWidth={strokeWidth} />;
    case 'chart':
      return <BarChart2 size={size} color={color} strokeWidth={strokeWidth} />;
    case 'user':
      return <User size={size} color={color} strokeWidth={strokeWidth} />;
    case 'flame':
      return <Flame size={size} color={color} strokeWidth={strokeWidth} />;
    case 'lock':
      return <Lock size={size} color={color} strokeWidth={strokeWidth} />;
    case 'check':
      return <Check size={size} color={color} strokeWidth={strokeWidth} />;
    case 'chevron-right':
      return <ChevronRight size={size} color={color} strokeWidth={strokeWidth} />;
    case 'chevron-left':
      return <ChevronLeft size={size} color={color} strokeWidth={strokeWidth} />;
    case 'star':
      return <Star size={size} color={color} strokeWidth={strokeWidth} />;
    case 'shield':
      return <Shield size={size} color={color} strokeWidth={strokeWidth} />;
    case 'x':
      return <X size={size} color={color} strokeWidth={strokeWidth} />;
    case 'bell':
      return <Bell size={size} color={color} strokeWidth={strokeWidth} />;
    case 'sparkle':
      return <Sparkles size={size} color={color} strokeWidth={strokeWidth} />;
    case 'phone-end':
      return <PhoneOff size={size} color={color} strokeWidth={strokeWidth} />;
    case 'card':
      return <CreditCard size={size} color={color} strokeWidth={strokeWidth} />;
    case 'calendar':
      return <Calendar size={size} color={color} strokeWidth={strokeWidth} />;
    case 'arrow-right':
      return <ArrowRight size={size} color={color} strokeWidth={strokeWidth} />;
    case 'send':
      return <Send size={size} color={color} strokeWidth={strokeWidth} />;
    case 'whatsapp':
      return <Ionicons name="logo-whatsapp" size={size} color={color} />;
    case 'logout':
      return <LogOut size={size} color={color} strokeWidth={strokeWidth} />;
    case 'plus':
      return <Plus size={size} color={color} strokeWidth={strokeWidth} />;
    case 'eye':
      return <Eye size={size} color={color} strokeWidth={strokeWidth} />;
    case 'eye-off':
      return <EyeOff size={size} color={color} strokeWidth={strokeWidth} />;
    case 'alert-circle':
      return <AlertCircle size={size} color={color} strokeWidth={strokeWidth} />;
    case 'check-circle':
      return <CheckCircle size={size} color={color} strokeWidth={strokeWidth} />;
    case 'info':
      return <Info size={size} color={color} strokeWidth={strokeWidth} />;
    case 'alert-triangle':
      return <AlertTriangle size={size} color={color} strokeWidth={strokeWidth} />;
    case 'play':
      return <Play size={size} color={color} strokeWidth={strokeWidth} />;
    case 'pause':
      return <Pause size={size} color={color} strokeWidth={strokeWidth} />;
    case 'volume':
      return <Volume2 size={size} color={color} strokeWidth={strokeWidth} />;
    case 'book-open':
      return <BookOpen size={size} color={color} strokeWidth={strokeWidth} />;
    case 'trophy':
      return <Trophy size={size} color={color} strokeWidth={strokeWidth} />;
    case 'trending-up':
      return <TrendingUp size={size} color={color} strokeWidth={strokeWidth} />;
    case 'envelope':
      return <Mail size={size} color={color} strokeWidth={strokeWidth} />;
    default:
      return null;
  }
}
