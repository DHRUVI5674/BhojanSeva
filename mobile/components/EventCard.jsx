import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, MapPin, Users, Check, Sparkles } from 'lucide-react-native';
import { formatDate } from '../utils/dateHelpers';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const EventCard = ({ event, alreadyRegistered = false, onRegister }) => {
  const [submitting, setSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(alreadyRegistered);

  if (!event) return null;
  const { title, description, date, location, imageUrl, capacity, registrationsCount } = event;

  const handleRegisterPress = async () => {
    if (isRegistered || submitting || !onRegister) return;
    try {
      setSubmitting(true);
      await onRegister();
      setIsRegistered(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Sparkles size={24} color={COLORS.primary} />
          <Text style={styles.placeholderText}>COMMUNITY DRIVE</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Calendar size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.metaText}>{formatDate(date)}</Text>
          </View>

          {location ? (
            <View style={styles.metaRow}>
              <MapPin size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.metaText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}

          {capacity ? (
            <View style={styles.metaRow}>
              <Users size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.capacityText}>
                {registrationsCount || 0} / {capacity} spots filled
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.registerBtn,
            isRegistered ? styles.registeredBtn : null,
            submitting ? styles.submittingBtn : null,
          ]}
          onPress={handleRegisterPress}
          disabled={isRegistered || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : isRegistered ? (
            <>
              <Check size={16} color="#15803D" style={{ marginRight: 6 }} />
              <Text style={styles.registeredBtnText}>Registered</Text>
            </>
          ) : (
            <Text style={styles.registerBtnText}>Join / Register</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventCard;

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
    height: 140,
    backgroundColor: COLORS.surfaceAlt,
  },
  imagePlaceholder: {
    width: '100%',
    height: 70,
    backgroundColor: COLORS.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  metaContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  capacityText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  registeredBtn: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  registeredBtnText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '700',
  },
  submittingBtn: {
    opacity: 0.8,
  },
});
