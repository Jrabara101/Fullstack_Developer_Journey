import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { WeatherPayload, WeatherLocation } from '../types/weather';

const SNAPSHOT_KEY_PREFIX = 'aetheris_weather_snapshot_';

export function useWeather(location: WeatherLocation | null) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedSnapshotTime, setCachedSnapshotTime] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const query = useQuery<WeatherPayload>({
    queryKey: ['weather', location?.lat, location?.lon, location?.name],
    queryFn: async () => {
      if (!location) throw new Error('No location provided');

      // Check network status
      if (!navigator.onLine) {
        const stored = localStorage.getItem(`${SNAPSHOT_KEY_PREFIX}${location.lat.toFixed(2)}_${location.lon.toFixed(2)}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setCachedSnapshotTime(parsed.fetchedAt);
          return parsed;
        }
      }

      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lon: location.lon.toString(),
        name: location.name,
        country: location.country || '',
      });

      const response = await fetch(`/api/weather?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Weather fetch error: HTTP ${response.status}`);
      }

      const data: WeatherPayload = await response.json();

      // Save offline emergency snapshot
      try {
        localStorage.setItem(
          `${SNAPSHOT_KEY_PREFIX}${location.lat.toFixed(2)}_${location.lon.toFixed(2)}`,
          JSON.stringify(data)
        );
        localStorage.setItem('aetheris_last_active_location', JSON.stringify(location));
        setCachedSnapshotTime(null);
      } catch (e) {
        console.warn('Storage quota exceeded for weather snapshot', e);
      }

      return data;
    },
    enabled: !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time as specified
    gcTime: 30 * 60 * 1000, // 30 minutes cache retention
    retry: 1,
  });

  return {
    ...query,
    isOffline,
    cachedSnapshotTime,
  };
}
