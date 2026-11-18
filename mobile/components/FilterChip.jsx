import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

/**
 * FilterChip – selectable chip used for filtering lists.
 * Props:
 *   label (string) – chip label.
 *   selected (boolean) – visual state.
 *   onPress (function) – callback when tapped.
 */
export default function FilterChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: SPACING.xxsm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  selected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  textSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});
