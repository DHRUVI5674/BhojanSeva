import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Button from './Button';

export default function RequestCard({
  request,
  isDonor = false,
  onAccept,
  onReject,
  onCancel,
  style,
}) {
  if (!request) return null;

  const donation = request.donation || {};
  const statusInfo = COLORS.status[request.status] || {
    text: COLORS.textSecondary,
    bg: '#F3F4F6',
    label: request.status,
  };

  return (
    <View style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={styles.foodTitle} numberOfLines={1}>
            {donation.title || 'Food Donation'}
          </Text>
          <Text style={styles.requestedBy} numberOfLines={1}>
            {isDonor
              ? `Requested by: ${request.recipient?.organizationName || request.recipient?.name || 'NGO'}`
              : `Donated by: ${donation.donor?.organizationName || donation.donor?.name || 'Donor'}`}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[styles.statusText, { color: statusInfo.text }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Meta Row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Requested Qty</Text>
          <Text style={styles.metaValue}>
            {request.requestedQuantity} {donation.unit || 'servings'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>People to Feed</Text>
          <Text style={styles.metaValue}>{request.peopleToFeed} people</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Date</Text>
          <Text style={styles.metaValue}>
            {new Date(request.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>

      {/* Delivery Address */}
      {request.deliveryAddress ? (
        <View style={styles.addressRow}>
          <MapPin size={13} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.addressText} numberOfLines={1}>
            {request.deliveryAddress}
          </Text>
        </View>
      ) : null}

      {/* Volunteer in charge */}
      {request.assignedVolunteer ? (
        <View style={styles.volunteerRow}>
          <Text style={styles.volunteerLabel}>Assigned Volunteer: </Text>
          <Text style={styles.volunteerName}>
            {request.assignedVolunteer.name} ({request.assignedVolunteer.phone})
          </Text>
        </View>
      ) : null}

      {/* Donor Actions (Accept / Reject) */}
      {isDonor && request.status === 'PENDING' && (
        <View style={styles.actionRow}>
          <Button
            title="Decline"
            variant="outline"
            size="sm"
            style={{ flex: 1, marginRight: SPACING.sm, borderColor: COLORS.danger }}
            textStyle={{ color: COLORS.danger }}
            onPress={() => onReject && onReject(request._id)}
          />
          <Button
            title="Accept Request"
            variant="primary"
            size="sm"
            style={{ flex: 1.5 }}
            onPress={() => onAccept && onAccept(request._id)}
          />
        </View>
      )}

      {/* Recipient Actions (Cancel if pending) */}
      {!isDonor && request.status === 'PENDING' && onCancel && (
        <View style={styles.actionRow}>
          <Button
            title="Cancel Request"
            variant="outline"
            size="sm"
            style={{ flex: 1, borderColor: COLORS.danger }}
            textStyle={{ color: COLORS.danger }}
            onPress={() => onCancel(request._id)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
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
  requestedBy: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  volunteerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#FAF5FF',
    padding: 6,
    borderRadius: RADIUS.xs,
  },
  volunteerLabel: {
    fontSize: 11,
    color: COLORS.purple,
    fontWeight: '600',
  },
  volunteerName: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
