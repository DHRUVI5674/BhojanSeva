import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

/**
 * StatusBadge – displays a colored label for a given status.
 * Props:
 *   status (string) – status text such as 'PENDING', 'APPROVED', 'EN ROUTE', etc.
 */
export default function StatusBadge({ status }) {
  const statusInfo = COLORS.status?.[status] || {
    bg: COLORS.borderLight,
    text: COLORS.textSecondary,
  };

  return (
    <View style={[styles.badge, { backgroundColor: statusInfo.bg }] } accessible accessibilityRole="text">
      <Text style={[styles.text, { color: statusInfo.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxsm,
    borderRadius: RADIUS.full,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});