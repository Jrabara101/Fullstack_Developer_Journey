import { useState, useEffect, useCallback } from 'react';
import { WeatherLocation } from '../types/weather';

const DEFAULT_LOCATION: WeatherLocation = {
  id: 'loc-ny',
  name: 'Lower Manhattan',
  label: 'New York, USA',
  lat: 40.7128,
  lon: -74.006,
  country: 'United States',
  admin1: 'New York',
  timezone: 'America/New_York',
  is_favorite: true,
  custom_label: 'Downtown Office',
};

export function useGeolocation() {
  const [activeLocation, setActiveLocation] = useState<WeatherLocation>(() => {
    try {
      const stored = localStorage.getItem('aetheris_last_active_location');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // Ignore
    }
    return DEFAULT_LOCATION;
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setDetectionError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    setDetectionError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode via backend API
          const res = await fetch(`/api/locations/reverse?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data: WeatherLocation = await res.json();
            setActiveLocation(data);
          } else {
            setActiveLocation({
              id: `geo-${Date.now()}`,
              name: 'Current Coordinates',
              label: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
              lat: Number(latitude.toFixed(4)),
              lon: Number(longitude.toFixed(4)),
              country: '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
              is_favorite: false,
            });
          }
        } catch (err: any) {
          console.warn('Geocoding error:', err);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setDetectionError('Permission denied. Using default location.');
        setIsDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  return {
    activeLocation,
    setActiveLocation,
    detectLocation,
    isDetecting,
    detectionError,
  };
}
