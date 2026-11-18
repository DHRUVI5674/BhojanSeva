import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Phone, Check, Truck, CheckCircle2 } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from './Button';

export default function TaskCard({
  task,
  onAccept,
  onPickup,
  onDeliver,
  style,
}) {
  if (!task) return null;

  const donation = task.donation || {};
  const statusInfo = COLORS.status[task.status] || {
    text: COLORS.textSecondary,
    bg: '#F3F4F6',
    label: task.status,
  };

  return (
    <View style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={styles.foodTitle} numberOfLines={1}>
            {donation.title || 'Food Delivery Task'}
          </Text>
          <Text style={styles.quantityText}>
            {donation.quantity} {donation.unit} (Feeds ~{donation.peopleServed})
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[styles.statusText, { color: statusInfo.text }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Route Addresses */}
      <View style={styles.routeContainer}>
        {/* Pickup Step */}
        <View style={styles.routeStep}>
          <View style={[styles.dot, { backgroundColor: COLORS.warning }]} />
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>PICKUP FROM</Text>
            <Text style={styles.stepAddress} numberOfLines={2}>
              {task.pickupAddress}
            </Text>
            {task.donorContact?.phone ? (
              <View style={styles.contactRow}>
                <Phone size={11} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.contactText}>
                  {task.donorContact.name} ({task.donorContact.phone})
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Vertical route line */}
        <View style={styles.routeLine} />

        {/* Drop Step */}
        <View style={styles.routeStep}>
          <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>DELIVER TO</Text>
            <Text style={styles.stepAddress} numberOfLines={2}>
              {task.deliveryAddress}
            </Text>
            {task.recipientContact?.phone ? (
              <View style={styles.contactRow}>
                <Phone size={11} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.contactText}>
                  {task.recipientContact.name} ({task.recipientContact.phone})
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Action Buttons based on status */}
      <View style={styles.actionContainer}>
        {task.status === 'ASSIGNED' && (
          <Button
            title="Accept Delivery Task"
            icon={Check}
            variant="primary"
            size="md"
            style={{ width: '100%' }}
            onPress={() => onAccept && onAccept(task._id)}
          />
        )}

        {task.status === 'ACCEPTED' && (
          <Button
            title="Confirm Pickup from Donor"
            icon={Truck}
            variant="primary"
            size="md"
            style={{ width: '100%' }}
            onPress={() => onPickup && onPickup(task._id)}
          />
        )}

        {task.status === 'PICKED_UP' && (
          <Button
            title="Confirm Delivery to Recipient"
            icon={CheckCircle2}
            variant="primary"
            size="md"
            style={{ width: '100%', backgroundColor: COLORS.success }}
            onPress={() => onDeliver && onDeliver(task._id)}
          />
        )}

        {task.status === 'DELIVERED' && (
          <View style={styles.completedBanner}>
            <CheckCircle2 size={16} color={COLORS.success} style={{ marginRight: 6 }} />
            <Text style={styles.completedText}>
              Delivered on{' '}
              {task.deliveredTime
                ? new Date(task.deliveredTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Complete'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  titleArea: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  quantityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
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
  routeContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
    marginRight: 10,
  },
  routeLine: {
    position: 'absolute',
    left: 12,
    top: 18,
    bottom: 24,
    width: 2,
    backgroundColor: COLORS.border,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  stepAddress: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  contactText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  actionContainer: {
    marginTop: SPACING.xs,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successBg,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
  },
});
