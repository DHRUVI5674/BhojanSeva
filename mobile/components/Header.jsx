import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bell } from 'lucide-react-native';



import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function Header({
  title,
  subtitle,
  showBack = false,
  showNotifications = true,
  unreadCount = 0,
  rightAction,
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'donor':
        return { label: 'Donor', bg: '#DCFCE7', text: '#15803D' };
      case 'recipient':
        return { label: 'Recipient NGO', bg: '#DBEAFE', text: '#1D4ED8' };
      case 'volunteer':
        return { label: 'Volunteer', bg: '#EDE9FE', text: '#6D28D9' };
      case 'admin':
        return { label: 'Admin', bg: '#FEF3C7', text: '#B45309' };
      default:
        return null;
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>

      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleWrapper}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title || (user ? `Hello, ${user.name?.split(' ')[0]}` : 'BhojanSeva')}
            </Text>
            {badge && (
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
              </View>
            )}
          </View>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : user?.organizationName ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {user.organizationName}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {rightAction}

        {showNotifications && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/notifications')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Bell size={22} color={COLORS.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  titleWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    marginLeft: SPACING.xs,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  unreadBadgeText: {
    color: COLORS.surface,
    fontSize: 9,
    fontWeight: '700',
  },
});
