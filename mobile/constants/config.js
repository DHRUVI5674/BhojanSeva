import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getLocalHost = () => {
  // If user sets EXPO_PUBLIC_API_URL via .env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Auto-detect debugger host / expo host if running on Expo Go / dev client
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000/api`;
    }
  }

  // Fallback depending on platform
  if (Platform.OS === 'android') {
    // 192.168.1.4 is the reachable LAN IP on local Wi-Fi for physical phones
    // 10.0.2.2 is Android emulator's loopback to host
    return 'http://192.168.1.4:5000/api';
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getLocalHost();
console.log('[BhojanSeva Mobile] API Base URL configured:', API_BASE_URL);

export const APP_INFO = {
  name: 'BhojanSeva',
  tagline: 'Share Food. Spread Hope. Reduce Waste.',
  version: '1.0.0',
};
