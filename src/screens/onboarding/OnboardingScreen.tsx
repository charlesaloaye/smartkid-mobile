import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Button } from '../../components/Button';
import { Icon, IconName } from '../../components/Icon';
import { colors, type } from '../../theme';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Adaptive size based on screen dimensions for optimal display on small & large devices
const IMAGE_SIZE = Math.min(SCREEN_W * 0.72, SCREEN_H * 0.35, 290);

type Slide = {
  key: string;
  image: ImageSourcePropType;
  badgeIcon: IconName;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  accent: string;
  glowColor: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    key: 'meet-ada',
    image: require('../../../assets/onboarding/slide-1-meet-ada.jpg'),
    badgeIcon: 'sparkle',
    badgeText: 'MEET YOUR AI TUTOR',
    badgeBg: 'rgba(26, 95, 122, 0.10)',
    badgeColor: colors.tealDark,
    accent: colors.teal,
    glowColor: '#1A5F7A',
    title: 'Personalized Learning\nfor Every Child',
    body: 'Meet Ada — your child’s 24/7 personal AI teacher, aligned with the NERDC curriculum to make learning clear, engaging, and patient.',
  },
  {
    key: 'interactive-learning',
    image: require('../../../assets/onboarding/slide-2-interactive.jpg'),
    badgeIcon: 'book-open',
    badgeText: 'STEP-BY-STEP GUIDANCE',
    badgeBg: 'rgba(2, 132, 199, 0.10)',
    badgeColor: '#0284C7',
    accent: '#0284C7',
    glowColor: '#0284C7',
    title: 'Explains Simply.\nAdapts to Their Pace.',
    body: 'From solving homework doubts to mastering tough subjects, Ada breaks down complex lessons into easy, digestible steps.',
  },
  {
    key: 'track-progress',
    image: require('../../../assets/onboarding/slide-3-progress.jpg'),
    badgeIcon: 'trending-up',
    badgeText: 'REAL PROGRESS & INSIGHTS',
    badgeBg: 'rgba(217, 119, 6, 0.10)',
    badgeColor: colors.amberDark,
    accent: colors.amber,
    glowColor: '#D97706',
    title: 'Guiding Minds.\nBuilding Futures.',
    body: 'Stay connected with weekly progress report cards, learning milestone alerts, and personalized practice plans for lasting confidence.',
  },
];

function Backdrop({ glowColor }: { glowColor: string }) {
  return (
    <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="bg-glow" cx="50%" cy="30%" r="60%">
          <Stop offset="0%" stopColor={glowColor} stopOpacity={0.16} />
          <Stop offset="55%" stopColor={glowColor} stopOpacity={0.05} />
          <Stop offset="100%" stopColor={glowColor} stopOpacity={0} />
        </RadialGradient>
        <Pattern id="grid-dots" width={48} height={48} patternUnits="userSpaceOnUse">
          <Circle cx={24} cy={24} r={1.5} fill={colors.charcoal} fillOpacity={0.04} />
          <Circle cx={0} cy={0} r={1} fill={colors.charcoal} fillOpacity={0.03} />
          <Circle cx={48} cy={0} r={1} fill={colors.charcoal} fillOpacity={0.03} />
          <Circle cx={0} cy={48} r={1} fill={colors.charcoal} fillOpacity={0.03} />
          <Circle cx={48} cy={48} r={1} fill={colors.charcoal} fillOpacity={0.03} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={colors.cream} />
      <Rect width="100%" height="100%" fill="url(#grid-dots)" />
      <Rect width="100%" height="100%" fill="url(#bg-glow)" />
    </Svg>
  );
}

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = index === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      completeOnboarding('Register');
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <View style={styles.root}>
      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setIndex(i);
        }}
        scrollEventThrottle={16}
        renderItem={({ item, index: i }) => {
          const inputRange = [(i - 1) * SCREEN_W, i * SCREEN_W, (i + 1) * SCREEN_W];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.82, 1, 0.82],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [18, 0, 18],
            extrapolate: 'clamp',
          });

          return (
            <SafeAreaView style={[styles.slide, { width: SCREEN_W }]} edges={['top', 'bottom']}>
              <Backdrop glowColor={item.glowColor} />

              <View style={styles.topBar}>
                <View style={styles.brandRow}>
                  <View style={styles.brandDot} />
                  <Text style={styles.brandText}>SmartKid</Text>
                </View>
                {!isLast && (
                  <Pressable
                    style={styles.skipBtn}
                    onPress={() => completeOnboarding('Register')}
                    hitSlop={12}
                    accessibilityRole="button"
                  >
                    <Text style={styles.skipText}>Skip</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.centerArea}>
                <Animated.View
                  style={[
                    styles.imageCardContainer,
                    {
                      shadowColor: item.glowColor,
                      transform: [{ scale }, { translateY }],
                      opacity,
                    },
                  ]}
                >
                  <View style={styles.imageCardBorder}>
                    <Image source={item.image} style={styles.image} resizeMode="cover" />
                  </View>
                </Animated.View>

                <Animated.View style={[styles.textBlock, { opacity, transform: [{ translateY }] }]}>
                  <View style={[styles.badge, { backgroundColor: item.badgeBg }]}>
                    <Icon name={item.badgeIcon} size={13} color={item.badgeColor} />
                    <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badgeText}</Text>
                  </View>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.body}>{item.body}</Text>
                </Animated.View>
              </View>
            </SafeAreaView>
          );
        }}
      />

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => {
            const inputRange = [(i - 1) * SCREEN_W, i * SCREEN_W, (i + 1) * SCREEN_W];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 26, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={slide.key}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: i === index ? slide.accent : 'rgba(15, 23, 42, 0.2)',
                  },
                ]}
              />
            );
          })}
        </View>

        <Button
          label={isLast ? 'Get Started' : 'Continue'}
          onPress={goNext}
          variant={isLast ? 'amber' : 'teal'}
        />

        <Pressable
          style={styles.loginLink}
          onPress={() => completeOnboarding('Login')}
          hitSlop={8}
        >
          <Text style={styles.loginPrompt}>
            Already have an account? <Text style={styles.loginLinkText}>Log In</Text>
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 44,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.teal,
  },
  brandText: {
    fontFamily: type.displaySemi,
    fontSize: 15,
    color: colors.charcoal,
    letterSpacing: 0.2,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
  },
  skipText: {
    fontFamily: type.bodySemi,
    fontSize: 13,
    color: colors.muted,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  imageCardContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 30,
    marginBottom: 24,
    backgroundColor: colors.sand,
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  imageCardBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'center',
  },
  badgeText: {
    fontFamily: type.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: type.display,
    fontSize: SCREEN_H < 700 ? 23 : 26,
    lineHeight: SCREEN_H < 700 ? 29 : 33,
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: type.body,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 320,
    alignSelf: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginBottom: 18,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  loginLink: {
    alignSelf: 'center',
    paddingVertical: 14,
  },
  loginPrompt: {
    fontFamily: type.body,
    fontSize: 13.5,
    color: colors.muted,
  },
  loginLinkText: {
    fontFamily: type.bodyBold,
    color: colors.teal,
  },
});
