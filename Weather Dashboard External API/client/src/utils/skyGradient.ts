/**
 * Dynamic environmental sky reactivity based on Stitch.md:
 * Canvas Primary (Day/Clear): #0E1B2E to #1E3A5F
 * Canvas Primary (Night/Clear): #08090C to #0F141C
 * Golden Dawn: #1C1917 -> #78350F -> #D97706
 * Twilight Azure: #090E17 -> #172554 -> #1E3A8A
 * Overcast Zinc: #18181B -> #27272A -> #3F3F46
 * Thunder Charcoal: #0B0F19 -> #111827 -> #1E1B4B
 */
export function getSkyGradient(
  hour: number,
  conditionCode: number,
  isOvercast = false
): {
  gradient: string;
  phaseName: string;
  celestialBody: 'sun' | 'moon';
  sunElevationPercent: number; // 0 (horizon/night) to 100 (zenith)
} {
  // Check severe/storm condition first
  if (conditionCode >= 95) {
    return {
      gradient: 'linear-gradient(180deg, #0B0F19 0%, #111827 50%, #1E1B4B 100%)',
      phaseName: 'Thunder Charcoal',
      celestialBody: 'moon',
      sunElevationPercent: 10,
    };
  }

  // Check dense overcast / rain
  if (isOvercast || conditionCode === 3 || conditionCode === 45 || conditionCode === 48 || conditionCode >= 63) {
    return {
      gradient: 'linear-gradient(180deg, #18181B 0%, #27272A 60%, #3F3F46 100%)',
      phaseName: 'Overcast Zinc',
      celestialBody: hour >= 6 && hour <= 18 ? 'sun' : 'moon',
      sunElevationPercent: 30,
    };
  }

  // Diurnal cycle
  if (hour >= 5 && hour < 7) {
    // Golden Dawn
    return {
      gradient: 'linear-gradient(180deg, #1C1917 0%, #451A03 40%, #B45309 80%, #F59E0B 100%)',
      phaseName: 'Golden Dawn',
      celestialBody: 'sun',
      sunElevationPercent: 20,
    };
  } else if (hour >= 7 && hour < 10) {
    // Morning Crisp
    return {
      gradient: 'linear-gradient(180deg, #0C2138 0%, #1E3A5F 55%, #0284C7 100%)',
      phaseName: 'Morning Azure',
      celestialBody: 'sun',
      sunElevationPercent: 60,
    };
  } else if (hour >= 10 && hour < 16) {
    // Crisp Noon / Pure Daylight
    return {
      gradient: 'linear-gradient(180deg, #0E1B2E 0%, #1E3A5F 50%, #2563EB 100%)',
      phaseName: 'Crisp Noon',
      celestialBody: 'sun',
      sunElevationPercent: 95,
    };
  } else if (hour >= 16 && hour < 18) {
    // Golden Hour Dusk
    return {
      gradient: 'linear-gradient(180deg, #172554 0%, #431407 50%, #C2410C 85%, #F97316 100%)',
      phaseName: 'Golden Hour Dusk',
      celestialBody: 'sun',
      sunElevationPercent: 25,
    };
  } else if (hour >= 18 && hour < 20) {
    // Twilight Azure
    return {
      gradient: 'linear-gradient(180deg, #090E17 0%, #172554 50%, #1E3A8A 90%, #312E81 100%)',
      phaseName: 'Twilight Azure',
      celestialBody: 'moon',
      sunElevationPercent: 10,
    };
  } else {
    // Deep Starry Midnight
    return {
      gradient: 'linear-gradient(180deg, #08090C 0%, #0F141C 60%, #141B26 100%)',
      phaseName: 'Deep Starry Midnight',
      celestialBody: 'moon',
      sunElevationPercent: 0,
    };
  }
}
