import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { colors, radii, shadow, type } from '../../theme';
import { useAsync } from '../../utils/useAsync';
import { fetchActivities } from '../../api/endpoints';
import { EmptyState } from '../../components/EmptyState';

type FilterType = 'all' | 'conversation' | 'milestone';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function ActivityScreen({ navigation }: any) {
  const { data, loading, refreshing, refresh } = useAsync(fetchActivities, []);
  const [filter, setFilter] = useState<FilterType>('all');

  const activities = data ?? [];
  const filteredList = activities.filter((item) => {
    if (filter === 'conversation') return item.type === 'conversation';
    if (filter === 'milestone') return item.type !== 'conversation';
    return true;
  });

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
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>
            Real-time updates from Ada tutoring sessions
          </Text>
        </View>

        {/* Filter Segment */}
        <View style={styles.segmentContainer}>
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'conversation', label: 'Chats' },
              { key: 'milestone', label: 'Milestones' },
            ] as const
          ).map((tab) => {
            const active = filter === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.segmentBtn,
                  active && styles.segmentBtnActive,
                ]}
                onPress={() => setFilter(tab.key)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Loading Spinner to prevent UI flash */}
        {loading && !data && (
          <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={{ fontFamily: type.bodyMedium, fontSize: 13, color: colors.muted, marginTop: 12 }}>
              Loading activity feed…
            </Text>
          </View>
        )}

        {/* Empty state */}
        {!loading && data && filteredList.length === 0 && (
          <EmptyState
            icon="chart"
            title="No activity recorded"
            description="Once tutoring sessions start on WhatsApp, questions and AI responses will appear here in real time."
          />
        )}

        {/* Activity Feed List */}
        {filteredList.map((item) => {
          const isConv = item.type === 'conversation';
          const isAi = isConv && item.sender === 'ai';
          const isChild = isConv && item.sender === 'child';

          const title =
            item.message ??
            item.description ??
            `${item.child_name ?? 'Child'} session update`;

          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.itemPressable,
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => {
                if (item.child_id) {
                  navigation?.navigate('Tutor', { childId: item.child_id });
                }
              }}
            >
              <Card style={styles.activityCard}>
                {/* Top Item Header */}
                <View style={styles.cardTop}>
                  <View style={styles.avatarWrap}>
                    {isAi ? (
                      <View style={styles.aiAvatar}>
                        <Icon name="sparkle" size={15} color={colors.amberDark} />
                      </View>
                    ) : isChild ? (
                      <View style={styles.childAvatar}>
                        <Text style={styles.avatarInitial}>
                          {(item.child_name ?? 'C').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.systemAvatar}>
                        <Icon name="bell" size={15} color={colors.sage} />
                      </View>
                    )}

                    <View style={styles.headerMeta}>
                      <View style={styles.nameRow}>
                        <Text style={styles.senderName}>
                          {isAi
                            ? 'Ada AI'
                            : isChild
                            ? item.child_name
                            : 'System Milestone'}
                        </Text>
                        {isAi && item.child_name && (
                          <Text style={styles.toRecipient}> to {item.child_name}</Text>
                        )}
                      </View>
                      <Text style={styles.timeAgo}>{timeAgo(item.created_at)}</Text>
                    </View>
                  </View>
                </View>

                {/* Body Content */}
                <View style={styles.quoteBox}>
                  <Text style={styles.messageText}>{title}</Text>
                </View>

                {/* Footer Tag */}
                {item.subject && (
                  <View style={styles.cardFooter}>
                    <View style={styles.subjectPill}>
                      <Text style={styles.subjectText}>{item.subject}</Text>
                    </View>
                  </View>
                )}
              </Card>
            </Pressable>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: type.display,
    fontSize: 24,
    color: colors.charcoal,
  },
  subtitle: {
    fontFamily: type.body,
    fontSize: 13,
    color: colors.mutedLight,
    marginTop: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: radii.pill,
    padding: 3,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  segmentBtnActive: {
    backgroundColor: colors.white,
    ...shadow.soft,
  },
  segmentText: {
    fontFamily: type.bodyMedium,
    fontSize: 12.5,
    color: colors.mutedLight,
  },
  segmentTextActive: {
    fontFamily: type.bodyBold,
    fontSize: 12.5,
    color: colors.charcoal,
  },
  itemPressable: {
    marginBottom: 12,
  },
  activityCard: {
    borderRadius: radii.lg,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...shadow.soft,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  avatarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(107, 142, 127, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: type.displaySemi,
    fontSize: 15,
    color: colors.white,
  },
  headerMeta: {
    marginLeft: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {
    fontFamily: type.displaySemi,
    fontSize: 14.5,
    color: colors.charcoal,
  },
  toRecipient: {
    fontFamily: type.bodyMedium,
    fontSize: 13,
    color: colors.mutedLight,
  },
  timeAgo: {
    fontFamily: type.bodyMedium,
    fontSize: 11.5,
    color: colors.mutedLight,
  },
  quoteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: 12,
    marginTop: 2,
  },
  messageText: {
    fontFamily: type.body,
    fontSize: 13.5,
    lineHeight: 19.5,
    color: colors.charcoal,
  },
  cardFooter: {
    flexDirection: 'row',
    marginTop: 10,
  },
  subjectPill: {
    backgroundColor: 'rgba(26, 95, 122, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  subjectText: {
    fontFamily: type.bodySemi,
    fontSize: 11,
    color: colors.teal,
  },
  emptyCard: {
    borderRadius: radii.lg,
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.white,
    marginTop: 10,
  },
  emptyIconBg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(26, 95, 122, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: type.display,
    fontSize: 17,
    color: colors.charcoal,
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: type.body,
    fontSize: 13,
    color: colors.mutedLight,
    textAlign: 'center',
    lineHeight: 18.5,
  },
});
