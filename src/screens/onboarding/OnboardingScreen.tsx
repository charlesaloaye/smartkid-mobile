import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Button } from '../../components/Button';
import { colors, type } from '../../theme';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Slide = {
  key: string;
  image: ImageSourcePropType;
  accent: string;
  eyebrow: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    key: 'meet-ada',
    image: require('../../../assets/onboarding/slide-1-meet-ada.png'),
    accent: colors.amberDark,
    eyebrow: 'Meet your tutor',
    title: 'Meet Ada.',
    body: 'An AI tutor built on the official NERDC curriculum — ready to teach every subject, every class, the way it feels at home.',
  },
  {
    key: 'remembers',
    image: require('../../../assets/onboarding/slide-2-remembers.png'),
    accent: colors.teal,
    eyebrow: 'Personalised, always',
    title: 'She remembers everything.',
    body: 'Ada tracks strengths, gaps, and progress across every conversation — so your child never starts back at zero.',
  },
  {
    key: 'whatsapp',
    image: require('../../../assets/onboarding/slide-3-whatsapp.png'),
    accent: '#3f5c50',
    eyebrow: 'Where the learning happens',
    title: 'Right inside WhatsApp.',
    body: 'No new app for your child to learn. They chat and talk with Ada on WhatsApp — you watch the progress here.',
  },
  {
    key: 'parent',
    image: require('../../../assets/onboarding/slide-4-parent.png'),
    accent: '#b8441f',
    eyebrow: 'You stay in the loop',
    title: 'A report card, every week.',
    body: 'See what they studied, where they’re thriving, and where Ada suggests extra practice — all from this app.',
  },
];

function Backdrop({ accent }: { accent: string }) {
  return (
    <Svg width={SCREEN_W} height={SCREEN_H} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="34%" r="55%">
          <Stop offset="0%" stopColor={accent} stopOpacity={0.22} />
          <Stop offset="60%" stopColor={accent} stopOpacity={0.07} />
          <Stop offset="100%" stopColor={accent} stopOpacity={0} />
        </RadialGradient>
        <Pattern id="motif" width={64} height={64} patternUnits="userSpaceOnUse">
          <Circle cx={0} cy={0} r={19} fill="none" stroke={colors.charcoal} strokeOpacity={0.05} strokeWidth={1} />
          <Circle cx={64} cy={0} r={19} fill="none" stroke={colors.charcoal} strokeOpacity={0.05} strokeWidth={1} />
          <Circle cx={0} cy={64} r={19} fill="none" stroke={colors.charcoal} strokeOpacity={0.05} strokeWidth={1} />
          <Circle cx={64} cy={64} r={19} fill="none" stroke={colors.charcoal} strokeOpacity={0.05} strokeWidth={1} />
          <Circle cx={32} cy={32} r={2} fill={colors.charcoal} fillOpacity={0.05} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={colors.cream} />
      <Rect width="100%" height="100%" fill="url(#motif)" />
      <Rect width="100%" height="100%" fill="url(#glow)" />
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
            outputRange: [0.75, 1, 0.75],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [16, 0, 16],
            extrapolate: 'clamp',
          });

          return (
            <SafeAreaView style={[styles.slide, { width: SCREEN_W }]} edges={['top', 'bottom']}>
              <Backdrop accent={item.accent} />
              <Pressable
                style={styles.skip}
                onPress={() => completeOnboarding('Register')}
                hitSlop={12}
                accessibilityRole="button"
              >
                <Text style={styles.skipText}>{isLast ? '' : 'Skip'}</Text>
              </Pressable>

              <View style={styles.centerArea}>
                <Animated.View
                  style={[
                    styles.imageWrap,
                    { shadowColor: item.accent },
                    { transform: [{ scale }, { translateY }], opacity },
                  ]}
                >
                  <Image source={item.image} style={styles.image} resizeMode="cover" />
                </Animated.View>

                <Animated.View style={{ opacity, transform: [{ translateY }] }}>
                  <Text style={[styles.eyebrow, { color: item.accent }]}>{item.eyebrow}</Text>
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
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * SCREEN_W, i * SCREEN_W, (i + 1) * SCREEN_W];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [7, 22, 7],
              extrapolate: 'clamp',
            });
            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    backgroundColor: dotColor.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['rgba(31,41,55,0.15)', colors.amber],
                    }) as unknown as string,
                  },
                ]}
              />
            );
          })}
        </View>

        <Button label={isLast ? 'Get started' : 'Continue'} onPress={goNext} variant="amber" />

        {isLast && (
          <Pressable style={styles.loginLink} onPress={() => completeOnboarding('Login')}>
            <Text style={styles.loginLinkText}>I already have an account</Text>
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  slide: { flex: 1, paddingHorizontal: 28 },
  skip: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 20,
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
    paddingBottom: 40,
  },
  imageWrap: {
    width: 248,
    height: 248,
    borderRadius: 32,
    marginBottom: 28,
    overflow: 'hidden',
    backgroundColor: colors.sand,
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  eyebrow: {
    fontFamily: type.bodyBold,
    fontSize: 11.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.amberDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: type.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: 14,
  },
  body: {
    fontFamily: type.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 300,
    alignSelf: 'center',
  },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginBottom: 20,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  loginLink: {
    alignSelf: 'center',
    paddingVertical: 16,
  },
  loginLinkText: {
    fontFamily: type.bodySemi,
    fontSize: 13,
    color: colors.teal,
  },
});
