export const COLORS = {
  // Brand colors
  primary: '#166534', // Deep green
  primaryLight: '#22C55E', // Vibrant secondary green
  primarySoft: '#DCFCE7', // Light green tint
  primaryHover: '#14532D',

  // Backgrounds
  background: '#F8FAF5', // Warm off-white
  surface: '#FFFFFF', // Clean white
  surfaceAlt: '#F1F5E9',

  // Typography
  textPrimary: '#17251B', // Deep forest/charcoal
  textSecondary: '#647067', // Muted slate green
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderGreen: '#BBF7D0',

  // Status & Accents
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  info: '#2563EB',
  infoBg: '#DBEAFE',
  purple: '#7C3AED',
  purpleBg: '#EDE9FE',

  // Status mapping
  status: {
    AVAILABLE: { text: '#15803D', bg: '#DCFCE7', label: 'Available' },
    REQUESTED: { text: '#B45309', bg: '#FEF3C7', label: 'Requested' },
    ACCEPTED: { text: '#1D4ED8', bg: '#DBEAFE', label: 'Accepted' },
    ASSIGNED: { text: '#6D28D9', bg: '#EDE9FE', label: 'Assigned' },
    PICKED_UP: { text: '#0E7490', bg: '#CFFAFE', label: 'In Transit' },
    DELIVERED: { text: '#047857', bg: '#D1FAE5', label: 'Delivered' },
    CANCELLED: { text: '#B91C1C', bg: '#FEE2E2', label: 'Cancelled' },
    EXPIRED: { text: '#4B5563', bg: '#F3F4F6', label: 'Expired' },
    REJECTED: { text: '#B91C1C', bg: '#FEE2E2', label: 'Declined' },
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
