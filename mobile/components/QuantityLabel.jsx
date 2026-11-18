import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

/**
 * QuantityLabel – displays a label/value pair or a quantity/unit pair.
 * Props:
 *   label (string) – field name (used when quantity/unit not provided).
 *   value (string) – field value (used when quantity/unit not provided).
 *   quantity (number) – optional numeric quantity.
 *   unit (string) – optional unit for the quantity.
 */
export default function QuantityLabel({ label, value, quantity, unit }) {
  // If quantity and unit are supplied, render them.
  if (quantity != null && unit) {
    return (
      <View style={styles.container} accessible accessibilityRole="text">
        <Text style={styles.label}>Quantity:</Text>
        <Text style={styles.value}>{`${quantity} ${unit}`}</Text>
      </View>
    );
  }

  // Fallback to generic label/value display.
  return (
    <View style={styles.container} accessible accessibilityRole="text">
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.xxsm,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginRight: SPACING.xxsm,
  },
  value: {
    fontSize: 13,
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
});