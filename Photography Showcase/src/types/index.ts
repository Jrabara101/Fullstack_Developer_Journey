// Type definitions for KAIROS Photography Showcase

export type AspectRatioType = '3:2' | '2:3' | '4:5' | '5:4' | '16:9' | '1:1' | '65:24';

export type LightQuality = 
  | 'Golden Hour'
  | 'Blue Hour & Nocturne'
  | 'Soft Overcast'
  | 'Harsh Midday Shadows';

export type TonalSwatch = 
  | 'Warm Ochre'
  | 'Coastal Slate'
  | 'Silver Monochrome'
  | 'Deep Indigo'
  | 'Sage Earth';

export type GalleryTheme = 'cotton' | 'white' | 'darkroom';

export type ViewMode = 'exhibition' | 'contact-sheet' | 'cinema';

export type FrameFinish = 'unframed' | 'raw-oak' | 'matte-black';

export type PrintSize = '16x24' | '24x36' | '40x60';

export interface SonicPostcard {
  soundType: 'kyoto_rain' | 'coastal_wind' | 'forest_nocturne' | 'urban_blue_hour';
  label: string;
  durationSeconds: number;
}

export interface ExifData {
  camera: string;
  lens: string;
  focalLengthMm: number;
  aperture: string;
  shutterSpeed: string;
  iso: number;
  timestamp: string; // ISO or human string
  locationName: string;
  gpsCoordinates?: { lat: number; lng: number };
  nativeWidthPx: number;
  nativeHeightPx: number;
}

export interface PerceptualPalette {
  dominantHex: string;
  ambientMattingHex: string; // Subtly tinted for high-key vs low-key borders
  swatches: string[];
  luminance: number; // 0 to 1
  isHighKey: boolean;
  contrastRatio: number;
  matchingTonalSwatch: TonalSwatch;
}

export interface Photograph {
  id: string;
  catalogNumber: string; // e.g., "01", "04"
  filmFrameNumber: string; // e.g., "24A", "07"
  title: string;
  seriesId: string;
  seriesTitle: string;
  aspectRatio: AspectRatioType;
  aspectRatioNumeric: number; // width / height
  url: string;
  highResUrl: string;
  
  // Editorial storytelling
  fieldNote: string;
  humanizedLightContext: string;
  lensEditorialTag: string; // e.g., "Environmental Storytelling Lens"
  
  // Sensory & technical
  lightQuality: LightQuality;
  tonalSwatch: TonalSwatch;
  exif: ExifData;
  palette: PerceptualPalette;
  sonicPostcard?: SonicPostcard;
  
  // Diptych pairing logic
  seriesPairId?: string; // Links two complementary frames
  pairRole?: 'establishing_wide' | 'intimate_detail';
  
  // Print sizing calculations
  maxMuseumPrintInches: { width: number; height: number; dpi: number };
}

export interface ViewingRoomState {
  title: string;
  clientName?: string;
  note?: string;
  selectedIds: string[];
  createdTimestamp: number;
}

