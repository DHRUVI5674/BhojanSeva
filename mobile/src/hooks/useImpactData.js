import { useState, useCallback, useRef } from 'react';
import api from '../../services/api';
import { useFocusEffect } from 'expo-router';

/**
 * Hook to fetch all impact‑related data from the BhojanSeva backend.
 * Returns { stats, distributions, news, events, loading, error, refresh }.
 */
export const useImpactData = (authToken) => {
  const [stats, setStats] = useState(null);
  const [distributions, setDistributions] = useState([]);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchAll = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};
      const [statsRes, distRes, newsRes, eventsRes] = await Promise.all([
        api.get('/ngo/impact/stats', config),
        api.get('/ngo/impact/distributions', config),
        api.get('/ngo/impact/news', config),
        api.get('/ngo/impact/events', config),
      ]);
      setStats(statsRes || null);
      setDistributions(Array.isArray(distRes) ? distRes : []);
      setNews(Array.isArray(newsRes) ? newsRes : []);
      setEvents(eventsRes || { upcoming: [], past: [] });
    } catch (e) {
      console.warn('Impact data fetch error:', e.message);
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [authToken]);

  // Refresh when screen gains focus (Expo Router tabs)
  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  return { stats, distributions, news, events, loading, error, refresh: fetchAll };
};
