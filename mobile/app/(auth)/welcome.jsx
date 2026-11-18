import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HeartHandshake, Truck, ShieldCheck, Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { APP_INFO } from '../../constants/config';
import Button from '../../components/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Hero Logo */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/bhojanseva-logo.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
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
    paddingVertical: SPACING.lg,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0F3E22',
    borderWidth: 2,
    borderColor: '#22C55E',
    ...SHADOWS.md,
    marginBottom: SPACING.md,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F3E22',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  featuresSection: {
    marginVertical: SPACING.md,
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
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
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  actionsSection: {
    marginTop: SPACING.md,
  },
  loginButton: {
    marginBottom: SPACING.sm,
  },
});
