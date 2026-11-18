import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Users, Utensils, CheckCircle2, Clock } from 'lucide-react-native';
import { formatDate } from '../utils/dateHelpers';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const DistributionCard = ({ item }) => {
  if (!item) return null;
  const { food, quantityKg, recipient, createdAt, status, location, mealsServed, peopleServed } = item;

  const isCompleted = status === 'completed';
  const isPending = status === 'pending';

  return (
    <View style={styles.card}>
      {/* Top Banner / Image */}
      <View style={styles.imageContainer}>
        {food?.imageUrl ? (
          <Image source={{ uri: food.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Utensils size={28} color={COLORS.primary} />
          </View>
        )}
        <View style={[styles.badge, isCompleted ? styles.completedBadge : isPending ? styles.pendingBadge : styles.canceledBadge]}>
          {isCompleted ? (
            <CheckCircle2 size={12} color="#15803D" style={{ marginRight: 4 }} />
          ) : (
            <Clock size={12} color="#B45309" style={{ marginRight: 4 }} />
          )}
          <Text style={[styles.badgeText, isCompleted ? styles.completedBadgeText : isPending ? styles.pendingBadgeText : styles.canceledBadgeText]}>
            {status ? status.toUpperCase() : 'COMPLETED'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {food?.name || food?.title || 'Community Food Pack'}
        </Text>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricVal}>{quantityKg || 0} kg</Text>
            <Text style={styles.metricLbl}>Food Delivered</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricVal}>{peopleServed || mealsServed || (quantityKg ? quantityKg * 2 : 0)}</Text>
            <Text style={styles.metricLbl}>People Fed</Text>
          </View>
        </View>

        {recipient ? (
          <View style={styles.infoRow}>
            <Users size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.infoText} numberOfLines={1}>
              For: {recipient}
            </Text>
          </View>
        ) : null}

        {location ? (
          <View style={styles.infoRow}>
            <MapPin size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.infoText} numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <Calendar size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
        </View>
      </View>
    </View>
  );
};

export default DistributionCard;

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: COLORS.surfaceAlt,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
  },
  completedBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  pendingBadgeText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '700',
  },
  canceledBadge: {
    backgroundColor: '#FEE2E2',
  },
  canceledBadgeText: {
    color: '#B91C1C',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  metricLbl: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
