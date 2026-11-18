import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" backgroundColor={COLORS.surface} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="donation/create"
            options={{
              headerShown: true,
              title: 'Donate Food',
              headerTintColor: COLORS.primary,
              headerStyle: { backgroundColor: COLORS.surface },
            }}
          />
          <Stack.Screen
            name="donation/[id]"
            options={{
              headerShown: true,
              title: 'Donation Details',
              headerTintColor: COLORS.primary,
              headerStyle: { backgroundColor: COLORS.surface },
            }}
          />
          <Stack.Screen
            name="donation/edit"
            options={{
              headerShown: true,
              title: 'Edit Donation',
              headerTintColor: COLORS.primary,
              headerStyle: { backgroundColor: COLORS.surface },
            }}
          />
          <Stack.Screen
            name="task/[id]"
            options={{
              headerShown: true,
              title: 'Delivery Task',
              headerTintColor: COLORS.primary,
              headerStyle: { backgroundColor: COLORS.surface },
            }}
          />
          <Stack.Screen
            name="admin/users"
            options={{
              headerShown: true,
              title: 'User Management',
              headerTintColor: COLORS.primary,
              headerStyle: { backgroundColor: COLORS.surface },
            }}
          />
          <Stack.Screen
            name="admin/donations"
            options={{
              headerShown: true,
              title: 'All Donations',
              headerTintColor: COLORS.primary,
              headerStyle: { backgroundColor: COLORS.surface },
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
