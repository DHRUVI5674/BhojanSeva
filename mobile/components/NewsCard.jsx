import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, ChevronDown, ChevronUp, Newspaper } from 'lucide-react-native';
import { formatDate } from '../utils/dateHelpers';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const NewsCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  if (!item) return null;
  const { title, body, imageUrl, createdAt, isDemo } = item;

  const shouldTruncate = body && body.length > 130;
  const displayText = expanded || !shouldTruncate ? body : `${body.slice(0, 125)}...`;

  return (
    <View style={styles.card}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : null}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.tag}>
            <Newspaper size={11} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.tagText}>{isDemo ? 'DEMO STORY' : 'COMMUNITY NEWS'}</Text>
          </View>
          <View style={styles.dateRow}>
            <Calendar size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
            <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{displayText}</Text>

        {shouldTruncate && (
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => setExpanded(!expanded)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.expandText}>{expanded ? 'Show Less' : 'Read More'}</Text>
            {expanded ? (
              <ChevronUp size={14} color={COLORS.primary} />
            ) : (
              <ChevronDown size={14} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default NewsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.surfaceAlt,
  },
  content: {
    padding: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 4,
    lineHeight: 22,
  },
  body: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: 2,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 4,
  },
});
