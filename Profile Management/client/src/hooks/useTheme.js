import { useState, useEffect } from 'react';

export function useTheme(initialTheme = 'dark', initialDensity = 'cozy') {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('atelier_theme') || initialTheme;
  });

  const [density, setDensity] = useState(() => {
    return localStorage.getItem('atelier_density') || initialDensity;
  });

  const [isSunsetActive, setIsSunsetActive] = useState(false);

  useEffect(() => {
    function applyTheme() {
      const root = document.documentElement;
      let effectiveTheme = theme;

      if (theme === 'system') {
        const hour = new Date().getHours();
        // Sunset automation: dark after 7 PM (19:00) or before 6:30 AM
        const isNight = hour >= 19 || hour < 7;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        effectiveTheme = (isNight || systemPrefersDark) ? 'dark' : 'light';
        setIsSunsetActive(isNight);
      } else {
        setIsSunsetActive(false);
      }

      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    applyTheme();
    localStorage.setItem('atelier_theme', theme);

    // Listen for system theme change if on system mode
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('density-compact', 'density-cozy', 'density-spacious');
    root.classList.add(`density-${density}`);
    localStorage.setItem('atelier_density', density);
  }, [density]);

  return {
    theme,
    setTheme,
    density,
    setDensity,
    isSunsetActive
  };
}
