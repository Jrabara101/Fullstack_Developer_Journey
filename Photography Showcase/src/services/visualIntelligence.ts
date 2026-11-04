import type { Photograph, ViewingRoomState, AspectRatioType } from '../types';

export class VisualIntelligenceEngine {
  /**
   * Humanized Focal Length & Lens Narrative Translator
   */
  public static translateFocalLength(mm: number): string {
    if (mm <= 24) return 'Expansive Architectural Perspective';
    if (mm <= 28) return 'Classic Street Documentary Lens';
    if (mm <= 40) return 'Environmental Storytelling Lens';
    if (mm <= 58) return 'Natural Human Eye Perspective';
    if (mm <= 85) return 'Intimate Portraiture & Perspective Compression';
    return 'Tactile Telephoto Isolation';
  }

  /**
   * Translates timestamp and solar angle into human editorial context
   */
  public static translateLightAndTime(timestamp: string, lightQuality: string, location: string): string {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;

    switch (lightQuality) {
      case 'Blue Hour & Nocturne':
        return `Blue Hour • ${timeStr} Local Time • ${location} • Soft Ambient Glow`;
      case 'Golden Hour':
        return `Golden Hour • ${timeStr} • Low Raking Sun • ${location}`;
      case 'Soft Overcast':
        return `Diffused Daylight • ${timeStr} • Cloud Cover Matting • ${location}`;
      case 'Harsh Midday Shadows':
        return `Direct Zenith Sun • ${timeStr} • Deep Chiaroscuro Contrast`;
      default:
        return `${lightQuality} • ${timeStr} • ${location}`;
    }
  }

  /**
   * Computes museum-grade maximum print dimensions at 300 DPI threshold
   */
  public static calculatePrintDimensions(widthPx: number, heightPx: number): {
    widthInches: number;
    heightInches: number;
    maxRecommendedSize: string;
    optimalDpiAt24x36: number;
  } {
    const widthInches = Math.round((widthPx / 300) * 10) / 10;
    const heightInches = Math.round((heightPx / 300) * 10) / 10;
    
    // Estimate DPI at standard 24x36 exhibition print
    const longerEdgePx = Math.max(widthPx, heightPx);
    const optimalDpiAt24x36 = Math.round(longerEdgePx / 36);

    let maxRecommendedSize = '16 × 24 IN';
    if (widthInches >= 30 || heightInches >= 30) {
      maxRecommendedSize = '40 × 60 IN (Museum Mural)';
    } else if (widthInches >= 20 || heightInches >= 20) {
      maxRecommendedSize = '24 × 36 IN (Archival Edition)';
    }

    return {
      widthInches,
      heightInches,
      maxRecommendedSize,
      optimalDpiAt24x36,
    };
  }

  /**
   * Computes combined aspect ratio and proportional widths for locked diptychs
   * Ensures both frames render at identical visual height without cropping
   */
  public static calculateDiptychWidths(ratioA: number, ratioB: number): {
    percentA: number;
    percentB: number;
    combinedAspect: number;
  } {
    const totalRatio = ratioA + ratioB;
    const percentA = Math.round((ratioA / totalRatio) * 1000) / 10;
    const percentB = Math.round((ratioB / totalRatio) * 1000) / 10;
    return {
      percentA,
      percentB,
      combinedAspect: totalRatio,
    };
  }

  /**
   * Calculates curated series reading time & visual essay pacing
   */
  public static calculateEssayPacing(photographs: Photograph[]): {
    plateCount: number;
    estimatedMinutes: number;
    label: string;
  } {
    const plateCount = photographs.length;
    // Pacing formula: 8 seconds per plate observation + word count reading time (180 wpm) + audio exploration
    const totalWords = photographs.reduce((acc, p) => acc + (p.fieldNote?.split(' ').length || 0), 0);
    const readingTimeSec = (totalWords / 180) * 60;
    const viewingTimeSec = plateCount * 8;
    const audioBonusSec = photographs.filter(p => p.sonicPostcard).length * 4;
    
    const totalMinutes = Math.max(2, Math.round((readingTimeSec + viewingTimeSec + audioBonusSec) / 60));
    
    return {
      plateCount,
      estimatedMinutes: totalMinutes,
      label: `${plateCount} Plates • ${totalMinutes}-Minute Visual Essay • Best viewed with sound on`,
    };
  }

  /**
   * Encodes a private viewing room state into a shareable URL hash
   */
  public static encodeViewingRoom(state: ViewingRoomState): string {
    try {
      const json = JSON.stringify(state);
      return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    } catch {
      return '';
    }
  }

  /**
   * Decodes a private viewing room state from URL hash or query
   */
  public static decodeViewingRoom(token: string): ViewingRoomState | null {
    try {
      const decoded = decodeURIComponent(escape(atob(decodeURIComponent(token))));
      const parsed = JSON.parse(decoded) as ViewingRoomState;
      if (parsed && Array.isArray(parsed.selectedIds)) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Maps aspect ratio string to numeric ratio (width / height)
   */
  public static getNumericAspectRatio(aspect: AspectRatioType): number {
    switch (aspect) {
      case '3:2': return 3 / 2;
      case '2:3': return 2 / 3;
      case '4:5': return 4 / 5;
      case '5:4': return 5 / 4;
      case '16:9': return 16 / 9;
      case '1:1': return 1 / 1;
      case '65:24': return 65 / 24;
      default: return 3 / 2;
    }
  }
}
