import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(loginEmail.trim().toLowerCase(), loginPassword);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Access Helper
  const handleQuickDemo = async (role) => {
    const demoAccounts = {
      donor: {
        email: 'donor.demo@bhojanseva.org',
        password: 'Password123!',
        name: 'Radhe Banquet & Caterers',
        phone: '+91 9876543001',
        role: 'donor',
        organizationName: 'Radhe Caterers',
        address: 'SG Highway, Ahmedabad',
      },
      recipient: {
        email: 'recipient.demo@bhojanseva.org',
        password: 'Password123!',
        name: 'Sneha Child Care NGO',
        phone: '+91 9876543002',
        role: 'recipient',
        organizationName: 'Sneha Foundation',
        address: 'Paldi, Ahmedabad',
      },
      volunteer: {
        email: 'volunteer.demo@bhojanseva.org',
        password: 'Password123!',
        name: 'Rohan Sharma',
        phone: '+91 9876543003',
        role: 'volunteer',
        address: 'Navrangpura, Ahmedabad',
      },
      admin: {
        email: 'admin.demo@bhojanseva.org',
        password: 'Password123!',
        name: 'BhojanSeva Platform Admin',
        phone: '+91 9876543004',
        role: 'admin',
        address: 'Main Office, Ahmedabad',
      },
    };

    const target = demoAccounts[role];
    if (!target) return;

    try {
      setLoading(true);
      setError('');
      // Try login first
      try {
        await login(target.email, target.password);
        router.replace('/(tabs)');
      } catch (loginErr) {
        // If demo user does not exist yet, register it automatically
        await register(target);
        router.replace('/(tabs)');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue connecting and sharing food</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Inputs */}
        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            icon={Mail}
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            icon={Lock}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Log In"
            icon={LogIn}
            variant="primary"
            size="lg"
            loading={loading}
            onPress={() => handleLogin()}
          />
        </View>

        {/* Quick Demo Accounts */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>— ONE-TAP DEMO TEST ACCOUNTS —</Text>
          <View style={styles.demoGrid}>
            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: '#16A34A' }]}
              onPress={() => handleQuickDemo('donor')}
              disabled={loading}
            >
              <Text style={[styles.demoBtnText, { color: '#16A34A' }]}>🍽️ Donor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: '#2563EB' }]}
              onPress={() => handleQuickDemo('recipient')}
              disabled={loading}
            >
              <Text style={[styles.demoBtnText, { color: '#2563EB' }]}>🤝 Recipient</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: '#7C3AED' }]}
              onPress={() => handleQuickDemo('volunteer')}
              disabled={loading}
            >
              <Text style={[styles.demoBtnText, { color: '#7C3AED' }]}>🚚 Volunteer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: '#D97706' }]}
              onPress={() => handleQuickDemo('admin')}
              disabled={loading}
            >
              <Text style={[styles.demoBtnText, { color: '#D97706' }]}>🛡️ Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
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
    padding: SPACING.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING.xs,
    marginBottom: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  demoSection: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  demoBtn: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
