import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, MapPin, Users, Utensils } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function DonationCard({ donation, onPress, style }) {
  const router = useRouter();

  if (!donation) return null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/donation/${donation._id}`);
    }
  };

  const getStatusInfo = (status) => {
    return COLORS.status[status] || { text: COLORS.textSecondary, bg: '#F3F4F6', label: status };
  };

  const formatExpiry = (expiryDate) => {
    if (!expiryDate) return '';
    const diffMs = new Date(expiryDate) - new Date();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMs < 0) return 'Expired';
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `Expires in ${diffMins}m`;
    }
    if (diffHours < 24) return `Expires in ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Expires in ${diffDays}d`;
  };

  const statusInfo = getStatusInfo(donation.status);
  const expiryLabel = formatExpiry(donation.expiryTime);
  const isExpiringSoon = expiryLabel.includes('m') || (expiryLabel.includes('h') && parseInt(expiryLabel) < 4);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.88}
    >
      {donation.images && donation.images.length > 0 ? (
        <Image
          source={{ uri: donation.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.content}>
        {/* Top meta tags */}
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Utensils size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.categoryText}>
              {donation.category?.replace('_', ' ')?.toUpperCase() || 'FOOD'}
            </Text>
          </View>

          <View style={styles.badgeGroup}>
            {/* Vegetarian indicator */}
            <View
              style={[
                styles.vegBadge,
                { borderColor: donation.isVegetarian ? '#16A34A' : '#DC2626' },
              ]}
            >
              <View
                style={[
                  styles.vegDot,
                  { backgroundColor: donation.isVegetarian ? '#16A34A' : '#DC2626' },
                ]}
              />
            </View>

            {/* Status pill */}
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusText, { color: statusInfo.text }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Title & Donor */}
        <Text style={styles.title} numberOfLines={2}>
          {donation.title}
        </Text>

        {donation.donor?.organizationName || donation.donor?.name ? (
          <Text style={styles.donorName} numberOfLines={1}>
            By: {donation.donor?.organizationName || donation.donor?.name}
          </Text>
        ) : null}

        {/* Details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.quantityNumber}>
              {donation.quantity} {donation.unit}
            </Text>
          </View>

          <View style={styles.dotSeparator} />

          <View style={styles.detailItem}>
            <Users size={14} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.detailText}>Serves ~{donation.peopleServed}</Text>
          </View>
        </View>

        {/* Expiry and Location footer */}
        <View style={styles.footerRow}>
          <View style={styles.footerItem}>
            <Clock
              size={13}
              color={isExpiringSoon ? COLORS.danger : COLORS.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.footerText,
                isExpiringSoon && { color: COLORS.danger, fontWeight: '700' },
              ]}
            >
              {expiryLabel}
            </Text>
          </View>

          <View style={styles.footerItem}>
            <MapPin size={13} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
            <Text style={styles.footerText} numberOfLines={1}>
              {donation.pickupAddress}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs + 2,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vegBadge: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    marginRight: 6,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 2,
  },
  donorName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
