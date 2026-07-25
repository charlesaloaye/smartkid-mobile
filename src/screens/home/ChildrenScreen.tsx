import React from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { colors, radii, shadow, type } from '../../theme';
import { useAsync } from '../../utils/useAsync';
import { fetchDashboard } from '../../api/endpoints';

const AVATAR_GRADIENTS: [string, string][] = [
  [colors.teal, colors.tealDark],
  ['#E76F51', '#D97706'],
  ['#2A9D8F', '#1A5F7A'],
  ['#8E44AD', '#3498DB'],
];

export default function ChildrenScreen({ navigation }: any) {
  const { data, loading, refreshing, refresh } = useAsync(fetchDashboard, []);
  const children = data?.children ?? [];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.teal}
          />
        }
      >
        {/* Header section */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSubtitle}>SMARTKID FAMILY</Text>
            <Text style={styles.headerTitle}>Your Children</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
            onPress={() => navigation.navigate('AddChild')}
          >
            <LinearGradient
              colors={[colors.teal, colors.tealDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addBtnGradient}
            >
              <Icon name="plus" size={15} color={colors.white} />
              <Text style={styles.addBtnText}>Add Child</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Quick Summary Pill Bar */}
        {children.length > 0 && (
          <View style={styles.summaryBar}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryDot} />
              <Text style={styles.summaryText}>
                {children.length} {children.length === 1 ? 'Learner' : 'Learners'} Active
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Icon name="whatsapp" size={13} color={colors.sage} />
              <Text style={styles.summaryText}>WhatsApp Synced</Text>
            </View>
          </View>
        )}

        {/* Empty state */}
        {!loading && children.length === 0 && (
          <Card style={styles.emptyCard}>
            <LinearGradient
              colors={['rgba(26, 95, 122, 0.08)', 'rgba(217, 119, 6, 0.06)']}
              style={styles.emptyGradient}
            >
              <View style={styles.emptyIconBg}>
                <Icon name="user" size={32} color={colors.teal} />
              </View>
              <Text style={styles.emptyTitle}>No children registered yet</Text>
              <Text style={styles.emptyBody}>
                Connect your child's WhatsApp number so Ada can begin personalized AI tutoring sessions.
              </Text>
              <Pressable
                style={styles.emptyCta}
                onPress={() => navigation.navigate('AddChild')}
              >
                <Text style={styles.emptyCtaText}>Add First Child</Text>
                <Icon name="arrow-right" size={15} color={colors.white} />
              </Pressable>
            </LinearGradient>
          </Card>
        )}

        {/* Children Card List */}
        {children.map((child, index) => {
          const gradientColors = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
          const hasSubjects = child.subjects && child.subjects.length > 0;

          return (
            <Card key={child.id} style={styles.childCard}>
              {/* Header Info */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarWrapper}>
                  <LinearGradient
                    colors={gradientColors}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>{child.name.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                  <View style={styles.onlineBadge} />
                </View>

                <View style={styles.childMetaContainer}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <View style={styles.phoneRow}>
                    <Icon name="whatsapp" size={13} color="#25D366" />
                    <Text style={styles.phoneNumber}>{child.whatsapp_number}</Text>
                  </View>
                </View>

                <Pressable
                  style={styles.moreBtn}
                  onPress={() => navigation.navigate('Tutor', { childId: child.id })}
                >
                  <Icon name="chevron-right" size={18} color={colors.mutedLight} />
                </Pressable>
              </View>

              {/* Subjects / Learning Focus */}
              <View style={styles.subjectsContainer}>
                <Text style={styles.sectionLabel}>LEARNING FOCUS</Text>
                <View style={styles.subjectRow}>
                  {hasSubjects ? (
                    child.subjects!.map((s) => (
                      <Pill key={s} label={s} tone="teal" />
                    ))
                  ) : (
                    <Pill label="Ready for first session" tone="amber" />
                  )}
                </View>
              </View>

              {/* Metrics Grid */}
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <View style={styles.statHeader}>
                    <Icon name="chat" size={14} color={colors.teal} />
                    <Text style={styles.statNum}>{child.questions_count ?? 0}</Text>
                  </View>
                  <Text style={styles.statLabel}>Questions this week</Text>
                </View>

                <View style={styles.statVerticalDivider} />

                <View style={styles.statBox}>
                  <View style={styles.statHeader}>
                    <Icon name="calendar" size={14} color={colors.amber} />
                    <Text style={styles.statNum}>{child.last_session ?? 'Never'}</Text>
                  </View>
                  <Text style={styles.statLabel}>Last session</Text>
                </View>
              </View>

              {/* Actions Footer */}
              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryChatBtn,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => navigation.navigate('Tutor', { childId: child.id })}
                >
                  <LinearGradient
                    colors={[colors.teal, colors.tealDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chatGradient}
                  >
                    <Icon name="sparkle" size={15} color={colors.white} />
                    <Text style={styles.primaryChatText}>Chat with Ada</Text>
                    <Icon name="arrow-right" size={14} color={colors.white} />
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => navigation.navigate('Activity')}
                >
                  <Icon name="chart" size={16} color={colors.teal} />
                </Pressable>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontFamily: type.bodyBold,
    fontSize: 10.5,
    color: colors.teal,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: type.display,
    fontSize: 26,
    color: colors.charcoal,
  },
  addBtn: {
    borderRadius: radii.pill,
    overflow: 'hidden',
    ...shadow.soft,
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 15,
    gap: 6,
  },
  addBtnText: {
    fontFamily: type.displaySemi,
    fontSize: 13,
    color: colors.white,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#25D366',
  },
  summaryText: {
    fontFamily: type.bodySemi,
    fontSize: 12,
    color: colors.charcoal,
  },
  summaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
  childCard: {
    marginBottom: 18,
    borderRadius: radii.lg,
    padding: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(26, 95, 122, 0.08)',
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  avatarText: {
    fontFamily: type.displayBlack,
    fontSize: 20,
    color: colors.white,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: colors.white,
  },
  childMetaContainer: {
    flex: 1,
    marginLeft: 14,
  },
  childName: {
    fontFamily: type.display,
    fontSize: 17.5,
    color: colors.charcoal,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  phoneNumber: {
    fontFamily: type.bodyMedium,
    fontSize: 12,
    color: colors.mutedLight,
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectsContainer: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: type.bodyBold,
    fontSize: 9.5,
    color: colors.mutedLight,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBox: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statVerticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
  statNum: {
    fontFamily: type.displaySemi,
    fontSize: 14,
    color: colors.charcoal,
  },
  statLabel: {
    fontFamily: type.bodyMedium,
    fontSize: 10.5,
    color: colors.mutedLight,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryChatBtn: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  chatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  primaryChatText: {
    fontFamily: type.displaySemi,
    fontSize: 13.5,
    color: colors.white,
  },
  secondaryBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(26, 95, 122, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginTop: 10,
  },
  emptyGradient: {
    padding: 30,
    alignItems: 'center',
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadow.soft,
  },
  emptyTitle: {
    fontFamily: type.display,
    fontSize: 18,
    color: colors.charcoal,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: type.body,
    fontSize: 13,
    color: colors.mutedLight,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.teal,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radii.pill,
    ...shadow.soft,
  },
  emptyCtaText: {
    fontFamily: type.displaySemi,
    fontSize: 13.5,
    color: colors.white,
  },
});
