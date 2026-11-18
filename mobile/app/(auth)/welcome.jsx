import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { UtensilsCrossed, HeartHandshake, Truck, ShieldCheck } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { APP_INFO } from '../../constants/config';
import Button from '../../components/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Hero Logo */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <UtensilsCrossed size={52} color={COLORS.surface} />
          </View>
          <Text style={styles.title}>{APP_INFO.name}</Text>
          <Text style={styles.tagline}>{APP_INFO.tagline}</Text>
        </View>

        {/* Value Propositions */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#DCFCE7' }]}>
              <HeartHandshake size={24} color={COLORS.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Surplus to Smiles</Text>
              <Text style={styles.featureSubtitle}>
                Restaurants, caterers & individuals donate excess edible food to registered NGOs.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#EDE9FE' }]}>
              <Truck size={24} color={COLORS.purple} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Volunteer Delivery</Text>
              <Text style={styles.featureSubtitle}>
                Dedicated volunteers pick up hot meals and ensure timely doorstep delivery.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#DBEAFE' }]}>
              <ShieldCheck size={24} color={COLORS.info} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Safety & Transparency</Text>
              <Text style={styles.featureSubtitle}>
                Verified donors, real-time status tracking, and strict food hygiene timestamps.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title="Log In"
            variant="primary"
            size="lg"
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          />
          <Button
            title="Create New Account"
            variant="outline"
            size="lg"
            onPress={() => router.push('/(auth)/register')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  featuresSection: {
    marginVertical: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm + 4,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  featureSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  actionsSection: {
    marginTop: SPACING.md,
  },
  loginButton: {
    marginBottom: SPACING.sm,
  },
});
