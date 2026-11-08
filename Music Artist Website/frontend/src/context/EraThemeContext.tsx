import React, { createContext, useContext, useState, useEffect } from 'react';

export type EraKey = 'nocturne' | 'solar' | 'echo';

interface EraDetails {
  key: EraKey;
  title: string;
  year: string;
  type: string;
  catalog: string;
  accent: string;
  secondary: string;
  bg: string;
  surface: string;
  description: string;
}

export const ERA_DEFINITIONS: Record<EraKey, EraDetails> = {
  nocturne: {
    key: 'nocturne',
    title: 'NOCTURNE IN CHROME',
    year: '2026',
    type: 'LP',
    catalog: 'CAT-026LP',
    accent: '#FF3366',
    secondary: '#00F0FF',
    bg: '#07080A',
    surface: '#101216',
    description: 'Analog synthesis recorded live to 2-inch tape between Berlin and Tokyo. Laser crimson & oscilloscope cyan.'
  },
  solar: {
    key: 'solar',
    title: 'SOLAR FLARE',
    year: '2024',
    type: 'LP',
    catalog: 'CAT-019LP',
    accent: '#FF6B00',
    secondary: '#FFD000',
    bg: '#090705',
    surface: '#14100C',
    description: 'Solar-charged modular oscillations captured in the Mojave Desert. Amber VU meters & solar heat.'
  },
  echo: {
    key: 'echo',
    title: 'ECHO CHAMBER',
    year: '2022',
    type: 'EP',
    catalog: 'CAT-011EP',
    accent: '#A855F7',
    secondary: '#3B82F6',
    bg: '#08060E',
    surface: '#120F1D',
    description: 'Cold War radar dome acoustic decays and magnetic tape loops. Synthesizer ultraviolet & cold reverb.'
  }
};

interface EraThemeContextType {
  currentEra: EraKey;
  eraDetails: EraDetails;
  setEra: (era: EraKey) => void;
  toggleNextEra: () => void;
}

const EraThemeContext = createContext<EraThemeContextType | undefined>(undefined);

export const EraThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEra, setCurrentEra] = useState<EraKey>('nocturne');

  useEffect(() => {
    document.documentElement.setAttribute('data-era', currentEra);
    const details = ERA_DEFINITIONS[currentEra];
    document.documentElement.style.setProperty('--era-accent', details.accent);
    document.documentElement.style.setProperty('--era-secondary', details.secondary);
    document.documentElement.style.setProperty('--era-bg', details.bg);
    document.documentElement.style.setProperty('--era-surface', details.surface);
  }, [currentEra]);

  const toggleNextEra = () => {
    const keys: EraKey[] = ['nocturne', 'solar', 'echo'];
    const nextIndex = (keys.indexOf(currentEra) + 1) % keys.length;
    setCurrentEra(keys[nextIndex]);
  };

  return (
    <EraThemeContext.Provider
      value={{
        currentEra,
        eraDetails: ERA_DEFINITIONS[currentEra],
        setEra: setCurrentEra,
        toggleNextEra
      }}
    >
      {children}
    </EraThemeContext.Provider>
  );
};

export const useEraTheme = () => {
  const context = useContext(EraThemeContext);
  if (!context) {
    throw new Error('useEraTheme must be used within an EraThemeProvider');
  }
  return context;
};

