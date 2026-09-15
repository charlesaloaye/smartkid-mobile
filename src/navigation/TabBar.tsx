import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from '../components/Icon';
import { colors, type } from '../theme';

const TAB_META: Record<string, { icon: IconName; label: string }> = {
  Home: { icon: 'home', label: 'Home' },
  Children: { icon: 'grid', label: 'Children' },
  Tutor: { icon: 'mic', label: 'Tutor' },
  Activity: { icon: 'chart', label: 'Activity' },
  Profile: { icon: 'user', label: 'Profile' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (keyboardVisible) {
    return null;
  }
  return (
    <SafeAreaView edges={['bottom']} style={styles.wrap}>
      <View style={styles.bar}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const meta = TAB_META[route.name] ?? { icon: 'home' as IconName, label: route.name };
          const isCenter = route.name === 'Tutor';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <Pressable key={route.key} onPress={onPress} style={styles.item} hitSlop={8}>
                <View style={styles.centerButton}>
                  <Icon name="mic" size={20} color={colors.white} />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item} hitSlop={8}>
              <Icon name={meta.icon} size={20} color={focused ? colors.teal : colors.mutedLight} />
              <Text style={[styles.label, { color: focused ? colors.teal : colors.mutedLight }]}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 6,
  },
  item: { alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 56 },
  label: { fontFamily: type.bodyBold, fontSize: 9.5 },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    shadowColor: colors.amber,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
