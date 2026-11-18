import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

/**
 * FoodImageCard – displays a food item image with title and quantity.
 * Props:
 *   title (string) – displayed prominent name.
 *   image (string) – remote URL for the food picture.
 *   quantity (number) – amount available.
 *   unit (string) – unit of the quantity (e.g., servings, pieces).
 *   subtitle (string) – optional secondary text (e.g., delivery time).
 */
export default function FoodImageCard({ title, image, quantity, unit, subtitle }) {
  return (
    <View style={styles.card} accessible accessibilityRole="imagebutton">
      {image ? (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      ) : null}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {quantity != null && unit ? (
          <Text style={styles.quantity}>{`${quantity} ${unit}`}</Text>
        ) : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    ...SHADOWS.sm,
    marginRight: SPACING.sm,
  },
  image: {
    width: '100%',
    height: 120,
  },
  info: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxsm,
  },
  quantity: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxsm,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});