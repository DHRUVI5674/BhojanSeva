import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function DefaultHomeScreen() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // On clicking Get Started, move directly to authentication (login/signup) or home dashboard
  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/(tabs)');
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/register');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#072B15" />
        <Image
          source={require('../assets/bhojanseva-logo.png')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#4ADE80" style={{ marginTop: SPACING.lg }} />
        <Text style={styles.loadingText}>Starting BhojanSeva...</Text>
      </View>
    );
  }

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#072B15" />

      {/* Whole page display of the given brand image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/bhojanseva-logo.png')}
          style={styles.fullPageImage}
          resizeMode="contain"
        />
      </View>

      {/* Bottom section with Get Started button */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.88}
        >
          <Text style={styles.getStartedButtonText}>
            {isAuthenticated ? 'Enter Dashboard' : 'Get Started'}
          </Text>
          <ArrowRight size={22} color="#072B15" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {!isAuthenticated ? (
          <View style={styles.authRow}>
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
              <Text style={styles.authLinkText}>Log In</Text>
            </TouchableOpacity>
            <Text style={styles.authDot}>•</Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.authLinkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.switchAccountBtn}
            onPress={async () => {
              await logout();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.switchAccountText}>
              Signed in as {user?.name || 'User'} ({user?.role}) • Switch Account
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#072B15',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#072B15',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingLogo: {
    width: 220,
    height: 220,
  },
  loadingText: {
    color: '#D1FAE5',
    fontSize: 15,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
  },
  fullPageImage: {
    width: '100%',
    height: '100%',
    maxHeight: 520,
  },
  bottomSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    backgroundColor: '#072B15',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 18,
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
  },
  getStartedButtonText: {
    color: '#072B15',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  authDot: {
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: SPACING.md,
    fontSize: 16,
  },
  authLinkText: {
    color: '#4ADE80',
    fontSize: 15,
    fontWeight: '700',
  },
  switchAccountBtn: {
    marginTop: SPACING.md,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  switchAccountText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
});
