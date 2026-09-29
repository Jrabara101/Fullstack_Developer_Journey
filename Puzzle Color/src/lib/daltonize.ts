import { PatternTexture } from '../types/color';

// Returns CSS background styles for tactile pattern overlays
export function getPatternStyle(texture?: PatternTexture, isEnabled: boolean = true): React.CSSProperties {
  if (!isEnabled || !texture) {
    return {};
  }

  switch (texture) {
    case 'dots':
      // Yellow: Polka dots pattern
      return {
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.45) 18%, transparent 22%)',
        backgroundSize: '10px 10px',
      };

    case 'diagonal_stripes':
      // Cyan: 45 degree diagonal hatching
      return {
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.3) 0, rgba(255, 255, 255, 0.3) 2px, transparent 0, transparent 8px)',
      };

    case 'waves':
      // Magenta: Sine wavy ripples
      return {
        backgroundImage:
          'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.35) 20%, transparent 25%), radial-gradient(ellipse at 100% 100%, rgba(255, 255, 255, 0.25) 20%, transparent 25%)',
        backgroundSize: '12px 12px',
      };

    case 'crosshatch':
      // Carbon: Dense diamond / grid crosshatch
      return {
        backgroundImage: `
          repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.35) 0, rgba(255, 255, 255, 0.35) 1px, transparent 0, transparent 6px),
          repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.35) 0, rgba(255, 255, 255, 0.35) 1px, transparent 0, transparent 6px)
        `,
      };

    case 'rings':
      // Titanium / White: Concentric ripple rings
      return {
        backgroundImage: 'radial-gradient(circle, transparent 30%, rgba(0, 0, 0, 0.2) 35%, transparent 40%)',
        backgroundSize: '14px 14px',
      };

    default:
      return {};
  }
}

// CSS Filter string for the selected colorblind simulation
export function getColorBlindFilterStyle(mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'): string {
  switch (mode) {
    case 'protanopia':
      return 'url(#protanopia-filter)';
    case 'deuteranopia':
      return 'url(#deuteranopia-filter)';
    case 'tritanopia':
      return 'url(#tritanopia-filter)';
    default:
      return 'none';
  }
}
