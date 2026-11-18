import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  CheckCheck,
  HeartHandshake,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react-native';
import { notificationService } from '../../services/notificationService';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import Header from '../../components/Header';
import EmptyState from '../../components/EmptyState';

export default function NotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res?.notifications || []);
      setUnreadCount(res?.unreadCount || 0);
    } catch (err) {
      console.warn('[Notifications] Failed to load:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all as read:', err.message);
    }
  };

  const handleNotificationPress = async (item) => {
    try {
      if (!item.isRead) {
        await notificationService.markAsRead(item._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      if (item.relatedDonation?._id) {
        router.push(`/donation/${item.relatedDonation._id}`);
      }
    } catch (e) {}
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'REQUEST_RECEIVED':
        return <HeartHandshake size={20} color={COLORS.warning} />;
      case 'REQUEST_ACCEPTED':
        return <CheckCircle2 size={20} color={COLORS.success} />;
      case 'TASK_ASSIGNED':
      case 'PICKED_UP':
        return <Truck size={20} color={COLORS.purple} />;
      case 'DELIVERED':
        return <CheckCircle2 size={20} color={COLORS.primary} />;
      default:
        return <Bell size={20} color={COLORS.info} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Notifications"
        subtitle="Stay updated on requests and delivery progress"
        showNotifications={false}
        rightAction={
          unreadCount > 0 && (
            <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
              <CheckCheck size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          )
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              title="All caught up!"
              description="You will receive alerts here when requests are created, accepted, or delivered."
              icon={Bell}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>{getIconForType(item.type)}</View>

              <View style={styles.contentContainer}>
                <View style={styles.topRow}>
                  <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.message}>{item.message}</Text>

                <View style={styles.timeRow}>
                  <Clock size={11} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                  <Text style={styles.timeText}>
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  unreadCard: {
    backgroundColor: '#FAFDF9',
    borderColor: COLORS.borderGreen,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
