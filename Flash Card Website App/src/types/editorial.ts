export type EventType = 'wedding' | 'birthday' | 'conference';

export interface EventThemeConfig {
  id: EventType;
  title: string;
  subtitle: string;
  hostName: string;
  dateStr: string;
  timeStr: string;
  venueName: string;
  venueAddress: string;
  badgeStyle: 'wax_seal' | 'ribbon' | 'hologram_lanyard';
  accentPrimary: string;
  accentSecondary: string;
  bgClass: string;
  surfaceClass: string;
  fontDisplay: string;
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  dressCodeTitle: string;
  dressCodeDescription: string;
  dressCodeColors: string[];
  weatherForecast: string;
  isExpanded?: boolean;
}

export interface GuestParty {
  inviteCode: string;
  primaryGuest: string;
  email: string;
  allowedPlusOnes: number;
  householdMembers: string[];
  subEventsAllowed: string[]; // e.g., ['Rehearsal Dinner', 'Main Ceremony', 'VIP Lounge']
  tableAssigned?: string;
  seatNumber?: string;
  conferenceTrack?: string;
}

export interface GuestRsvpData {
  inviteCode: string;
  isAttending: boolean;
  guestsCount: number;
  guestNames: string[];
  dietaryRequirements: string[];
  dietaryNotes: string;
  travelArrivalWindow?: string;
  hotelOrFlightInfo?: string;
  optInRideShare: boolean;
  phoneOrContact?: string;
  submittedAt: number;
}

export interface PolaroidPost {
  id: string;
  authorName: string;
  imageUrl: string;
  caption: string;
  timestamp: string;
  rotationDeg: number;
  xPos?: number;
  yPos?: number;
  hasAudioToast?: boolean;
  audioBlobUrl?: string;
}

export interface VotingItem {
  id: string;
  title: string;
  submittedBy: string;
  votes: number;
  category: string;
  hasUserVoted?: boolean;
}

export interface RideShareMatch {
  id: string;
  guestName: string;
  arrivalAirport: string;
  arrivalTime: string;
  flightNumber: string;
  seatsNeeded: number;
  contactHint: string;
}

export interface TableSeating {
  id: string;
  name: string;
  capacity: number;
  category: string; // e.g., 'Cypress Grove' or 'AI Systems Track'
  guests: Array<{
    name: string;
    avatar: string;
    relation: string;
    dietary?: string;
  }>;
}

