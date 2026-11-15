import React, { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * ============================================================================
 * CALM AIRFLOW FLIGHT BOOKING APP (REACT / ANDROID CAPACITOR)
 * ============================================================================
 * Design System: Calm Airflow (Inter typography, honest pricing, warm canvas)
 * Target: Android Capacitor / Hybrid Mobile / React Native Web
 * Architecture: All 4 screens combined into a single unified reactive file:
 *   1. Flight Selection (LIS → CPH, date carousel, filter chips, direct flights)
 *   2. Fare Selection (Light, Standard, Plus tiers with transparent inclusions)
 *   3. Seat Selection (Interactive 3-3 cabin seat map, exit row upgrades, live tags)
 *   4. Payment & Review (Transparent breakdown, multiple payment methods, PNR confirmation)
 * ============================================================================
 */

// --- TYPES & INTERFACES ---

export type BookingStep = 'flight' | 'fare' | 'seat' | 'pay';

export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  aircraft: string;
  departureTime: string;
  departureCode: string;
  departureAirport: string;
  arrivalTime: string;
  arrivalCode: string;
  arrivalAirport: string;
  duration: string;
  isDirect: boolean;
  stopsDescription?: string;
  co2Reduction?: string;
  basePrice: number;
  badge?: string;
  periodLabel?: string;
}

export interface FareTier {
  id: 'light' | 'standard' | 'plus';
  name: string;
  subtitle: string;
  priceDelta: number; // added to base price
  isPopular?: boolean;
  inclusions: { label: string; included: boolean }[];
}

export interface SeatInfo {
  id: string;
  row: number;
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  type: 'Window' | 'Middle' | 'Aisle';
  isExitRow: boolean;
  price: number;
  isOccupied: boolean;
}

export interface PassengerDetails {
  fullName: string;
  type: string;
  email: string;
  phone: string;
}

export type PaymentMethodType = 'card' | 'bank' | 'wallet';

// --- DESIGN SYSTEM THEME COLORS (CALM AIRFLOW) ---
const THEME = {
  canvas: '#F6F5F2', // Limestone warm off-white canvas
  surface: '#FFFFFF',
  surfaceLow: '#F3F3F9',
  surfaceContainer: '#EDEDF3',
  surfaceHigh: '#E8E8ED',
  surfaceHighest: '#E2E2E8',
  primary: '#1C2DC4',
  primaryContainer: '#3B4BDB',
  primaryFixed: '#DFE0FF',
  primaryTint: '#EEF0FB',
  onSurface: '#14161A',
  onSurfaceVariant: '#6B7078',
  outline: '#757686',
  outlineVariant: '#E3E1DC',
  success: '#1F8A5B',
  successFixed: '#93F7BE',
};

// --- MOCK DATA ---

const DATES_STRIP = [
  { day: 'Wed', date: '9', price: '€151' },
  { day: 'Thu', date: '10', price: '€139' },
  { day: 'Fri', date: '11', price: '€148', isSelected: true },
  { day: 'Sat', date: '12', price: '€124' },
  { day: 'Sun', date: '13', price: '€162' },
];

const FLIGHTS_DATA: FlightOption[] = [
  {
    id: 'fl-402',
    airline: 'Tern Air',
    flightNumber: 'TN 402',
    aircraft: 'Airbus A321neo',
    departureTime: '07:15',
    departureCode: 'LIS',
    departureAirport: 'Lisbon Portela T1',
    arrivalTime: '12:40',
    arrivalCode: 'CPH',
    arrivalAirport: 'Copenhagen T3',
    duration: '4h 25m',
    isDirect: true,
    co2Reduction: '-18% CO₂',
    basePrice: 148,
    badge: 'Selected',
    periodLabel: 'Morning flight',
  },
  {
    id: 'fl-406',
    airline: 'Tern Air',
    flightNumber: 'TN 406',
    aircraft: 'Boeing 737-800',
    departureTime: '13:20',
    departureCode: 'LIS',
    departureAirport: 'Lisbon Portela T1',
    arrivalTime: '18:45',
    arrivalCode: 'CPH',
    arrivalAirport: 'Copenhagen T3',
    duration: '4h 25m',
    isDirect: true,
    basePrice: 172,
    periodLabel: 'Afternoon departure',
  },
  {
    id: 'fl-410',
    airline: 'Tern Air',
    flightNumber: 'TN 410',
    aircraft: 'Airbus A320',
    departureTime: '19:05',
    departureCode: 'LIS',
    departureAirport: 'Lisbon Portela T1',
    arrivalTime: '00:30',
    arrivalCode: 'CPH',
    arrivalAirport: 'Copenhagen T3',
    duration: '4h 25m',
    isDirect: true,
    basePrice: 135,
    periodLabel: 'Evening flight · +1 day',
  },
  {
    id: 'fl-881',
    airline: 'Aster Air',
    flightNumber: 'AS 214',
    aircraft: 'Airbus A320',
    departureTime: '09:30',
    departureCode: 'LIS',
    departureAirport: 'Lisbon Portela T1',
    arrivalTime: '14:10',
    arrivalCode: 'CPH',
    arrivalAirport: 'Copenhagen T3',
    duration: '3h 40m',
    isDirect: true,
    basePrice: 158,
    periodLabel: 'Direct',
  },
];

const FARE_TIERS: FareTier[] = [
  {
    id: 'light',
    name: 'Light',
    subtitle: 'Essential travel, carry-on only',
    priceDelta: 0,
    inclusions: [
      { label: 'Small cabin bag (under seat)', included: true },
      { label: 'Taxes & airport fees included', included: true },
      { label: 'Overhead cabin bag (10kg)', included: false },
      { label: 'Checked bag (23kg)', included: false },
      { label: 'Seat selection', included: false },
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    subtitle: 'Balanced comfort with cabin allowance',
    priceDelta: 36, // Base €148 + €36 = €184
    isPopular: true,
    inclusions: [
      { label: 'Small cabin bag + 10kg overhead trolley', included: true },
      { label: 'Standard seat selection (Rows 8–24)', included: true },
      { label: 'Taxes & fees included', included: true },
      { label: 'Checked bag (23kg)', included: false },
      { label: 'Ticket refundability', included: false },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    subtitle: 'Maximum flexibility & heavy luggage',
    priceDelta: 90, // Base €148 + €90 = €238
    inclusions: [
      { label: 'Cabin bag + 10kg overhead trolley', included: true },
      { label: '23kg checked bag included', included: true },
      { label: 'Free seat selection (any row)', included: true },
      { label: 'Free ticket exchange & cancellation', included: true },
    ],
  },
];

// Initial pre-configured cabin seats (Rows 10 through 18)
const INITIAL_SEATS: SeatInfo[] = [
  // Row 10
  { id: '10A', row: 10, letter: 'A', type: 'Window', isExitRow: false, price: 0, isOccupied: true },
  { id: '10B', row: 10, letter: 'B', type: 'Middle', isExitRow: false, price: 0, isOccupied: true },
  { id: '10C', row: 10, letter: 'C', type: 'Aisle', isExitRow: false, price: 0, isOccupied: false },
  { id: '10D', row: 10, letter: 'D', type: 'Aisle', isExitRow: false, price: 0, isOccupied: false },
  { id: '10E', row: 10, letter: 'E', type: 'Middle', isExitRow: false, price: 0, isOccupied: true },
  { id: '10F', row: 10, letter: 'F', type: 'Window', isExitRow: false, price: 0, isOccupied: true },

  // Row 11
  { id: '11A', row: 11, letter: 'A', type: 'Window', isExitRow: false, price: 0, isOccupied: true },
  { id: '11B', row: 11, letter: 'B', type: 'Middle', isExitRow: false, price: 0, isOccupied: false },
  { id: '11C', row: 11, letter: 'C', type: 'Aisle', isExitRow: false, price: 0, isOccupied: false },
  { id: '11D', row: 11, letter: 'D', type: 'Aisle', isExitRow: false, price: 0, isOccupied: true },
  { id: '11E', row: 11, letter: 'E', type: 'Middle', isExitRow: false, price: 0, isOccupied: true },
  { id: '11F', row: 11, letter: 'F', type: 'Window', isExitRow: false, price: 0, isOccupied: true },

  // Row 12 (Emergency Exit Row: +€15 Extra Legroom)
  { id: '12A', row: 12, letter: 'A', type: 'Window', isExitRow: true, price: 15, isOccupied: false },
  { id: '12B', row: 12, letter: 'B', type: 'Middle', isExitRow: true, price: 15, isOccupied: false },
  { id: '12C', row: 12, letter: 'C', type: 'Aisle', isExitRow: true, price: 15, isOccupied: false },
  { id: '12D', row: 12, letter: 'D', type: 'Aisle', isExitRow: true, price: 15, isOccupied: false },
  { id: '12E', row: 12, letter: 'E', type: 'Middle', isExitRow: true, price: 15, isOccupied: false },
  { id: '12F', row: 12, letter: 'F', type: 'Window', isExitRow: true, price: 15, isOccupied: false },

  // Row 14 (Standard, Default chosen 14A)
  { id: '14A', row: 14, letter: 'A', type: 'Window', isExitRow: false, price: 0, isOccupied: false },
  { id: '14B', row: 14, letter: 'B', type: 'Middle', isExitRow: false, price: 0, isOccupied: false },
  { id: '14C', row: 14, letter: 'C', type: 'Aisle', isExitRow: false, price: 0, isOccupied: false },
  { id: '14D', row: 14, letter: 'D', type: 'Aisle', isExitRow: false, price: 0, isOccupied: false },
  { id: '14E', row: 14, letter: 'E', type: 'Middle', isExitRow: false, price: 0, isOccupied: true },
  { id: '14F', row: 14, letter: 'F', type: 'Window', isExitRow: false, price: 0, isOccupied: false },

  // Row 15
  { id: '15A', row: 15, letter: 'A', type: 'Window', isExitRow: false, price: 0, isOccupied: false },
  { id: '15B', row: 15, letter: 'B', type: 'Middle', isExitRow: false, price: 0, isOccupied: false },
  { id: '15C', row: 15, letter: 'C', type: 'Aisle', isExitRow: false, price: 0, isOccupied: false },
  { id: '15D', row: 15, letter: 'D', type: 'Aisle', isExitRow: false, price: 0, isOccupied: false },
  { id: '15E', row: 15, letter: 'E', type: 'Middle', isExitRow: false, price: 0, isOccupied: false },
  { id: '15F', row: 15, letter: 'F', type: 'Window', isExitRow: false, price: 0, isOccupied: false },

  // Row 16
  { id: '16A', row: 16, letter: 'A', type: 'Window', isExitRow: false, price: 0, isOccupied: true },
  { id: '16B', row: 16, letter: 'B', type: 'Middle', isExitRow: false, price: 0, isOccupied: false },
  { id: '16C', row: 16, letter: 'C', type: 'Aisle', isExitRow: false, price: 0, isOccupied: false },
  { id: '16D', row: 16, letter: 'D', type: 'Aisle', isExitRow: false, price: 0, isOccupied: false },
  { id: '16E', row: 16, letter: 'E', type: 'Middle', isExitRow: false, price: 0, isOccupied: true },
  { id: '16F', row: 16, letter: 'F', type: 'Window', isExitRow: false, price: 0, isOccupied: false },
];

// --- HAPTIC TRIGGER FOR ANDROID CAPACITOR & WEB ---
const triggerHaptic = () => {
  try {
    // If Capacitor Haptics plugin is present in window
    const cap = (window as unknown as { Capacitor?: { Plugins?: { Haptics?: { impact: (opts: { style: string }) => void } } } }).Capacitor;
    if (cap?.Plugins?.Haptics) {
      cap.Plugins.Haptics.impact({ style: 'LIGHT' });
      return;
    }
  } catch {
    // fallback
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(15);
    } catch {
      // ignore
    }
  }
};

// --- VECTOR ICONS (SVG) ---

const IconCheck: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 text-[#1F8A5B]' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const IconShield: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 text-[#1F8A5B]' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 3.582-7.5 9-7.5c5.418 0 9 2.53 9 7.5z" />
  </svg>
);

const IconPlane: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

const IconBack: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const IconCreditCard: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <rect x="2" y="5" width="20" height="14" rx="2.5" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
  </svg>
);

const IconBank: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M12 3L2 8h20L12 3z" />
  </svg>
);

const IconWallet: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a3 3 0 00-3-3H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-7zm-4 3h.01" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V6a2 2 0 00-2-2H6" />
  </svg>
);

const IconLock: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0v4" />
  </svg>
);

// --- MAIN UNIFIED COMPONENT ---

export const FlightBookingApp: React.FC = () => {
  // Navigation Step State
  const [currentStep, setCurrentStep] = useState<BookingStep>('flight');

  // Booking Flow States
  const [selectedFlight, setSelectedFlight] = useState<FlightOption>(FLIGHTS_DATA[0]);
  const [selectedFareTier, setSelectedFareTier] = useState<FareTier>(FARE_TIERS[1]); // default 'Standard'
  const [seats, setSeats] = useState<SeatInfo[]>(INITIAL_SEATS);
  const [selectedSeatId, setSelectedSeatId] = useState<string>('14A');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('card');
  const [passenger] = useState<PassengerDetails>({
    fullName: 'Anna Silva',
    type: '1 Adult',
    email: 'anna.silva@example.com',
    phone: '+351 912 345 678',
  });

  // Filters State
  const [isDirectOnly, setIsDirectOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'best' | 'price' | 'duration'>('best');

  // Confirmation Modal
  const [showBookingSuccess, setShowBookingSuccess] = useState<boolean>(false);
  const [bookingPnr, setBookingPnr] = useState<string>('');

  // Selected Seat Object
  const currentSeat = useMemo(() => {
    return seats.find((s) => s.id === selectedSeatId) || seats[3]; // default 14A
  }, [seats, selectedSeatId]);

  // Dynamic Total Price Calculation (Honest, all-inclusive)
  const totalPrice = useMemo(() => {
    const flightBase = selectedFlight.basePrice;
    const fareDelta = selectedFareTier.priceDelta;
    // If user chose exit row on Standard fare, add seat upgrade fee
    const seatFee = currentSeat ? currentSeat.price : 0;
    return flightBase + fareDelta + seatFee;
  }, [selectedFlight, selectedFareTier, currentSeat]);

  // Capacitor Android Hardware Back Button Hook
  useEffect(() => {
    const handleBackButton = () => {
      if (showBookingSuccess) {
        setShowBookingSuccess(false);
        return;
      }
      if (currentStep === 'pay') setCurrentStep('seat');
      else if (currentStep === 'seat') setCurrentStep('fare');
      else if (currentStep === 'fare') setCurrentStep('flight');
    };

    // Listen to Android Capacitor App backButton event if available
    const capApp = (window as unknown as { Capacitor?: { Plugins?: { App?: { addListener: (evt: string, cb: () => void) => { remove: () => void } } } } }).Capacitor?.Plugins?.App;
    let listener: { remove: () => void } | null = null;
    if (capApp) {
      listener = capApp.addListener('backButton', handleBackButton);
    }

    // Web popstate fallback
    window.addEventListener('popstate', handleBackButton);

    return () => {
      if (listener) listener.remove();
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [currentStep, showBookingSuccess]);

  // Navigate Back
  const handleNavBack = () => {
    triggerHaptic();
    if (currentStep === 'pay') setCurrentStep('seat');
    else if (currentStep === 'seat') setCurrentStep('fare');
    else if (currentStep === 'fare') setCurrentStep('flight');
  };

  // Seat Selection Handler
  const handleSelectSeat = (seat: SeatInfo) => {
    if (seat.isOccupied) return;
    triggerHaptic();
    setSelectedSeatId(seat.id);
  };

  // Submit Booking
  const handleConfirmAndPay = () => {
    triggerHaptic();
    const randomPnr = 'TRN-' + Math.floor(1000 + Math.random() * 9000) + 'K';
    setBookingPnr(randomPnr);
    setShowBookingSuccess(true);
  };

  // Reset / Book Another
  const handleReset = () => {
    setShowBookingSuccess(false);
    setCurrentStep('flight');
    setSelectedFlight(FLIGHTS_DATA[0]);
    setSelectedFareTier(FARE_TIERS[1]);
    setSelectedSeatId('14A');
  };

  // Step names for progress header
  const stepIndex = currentStep === 'flight' ? 0 : currentStep === 'fare' ? 1 : currentStep === 'seat' ? 2 : 3;

  return (
    <div
      className="min-h-screen w-full flex justify-center bg-[#EDEDF3] text-[#14161A]"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Mobile Shell Container (Fixed 393px width on desktop or 100% on native mobile device) */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#F6F5F2] flex flex-col relative shadow-2xl overflow-x-hidden select-none">
        
        {/* =========================================================================
            HEADER & ANDROID / CAPACITOR STATUS BAR
           ========================================================================= */}
        <header className="sticky top-0 z-40 bg-[#F6F5F2]/95 backdrop-blur-md border-b border-[#E3E1DC]">
          {/* Android / iOS Status Bar Area */}
          <div className="w-full h-8 px-6 pt-2 flex justify-between items-center text-[12px] font-semibold text-[#14161A]">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="text-[10px]">5G</span>
              <div className="w-3.5 h-2 border border-current rounded-sm p-[1px] flex items-center">
                <div className="w-full h-full bg-current rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Nav Title & Action */}
          <div className="h-12 px-4 flex items-center justify-between">
            {currentStep !== 'flight' ? (
              <button
                type="button"
                onClick={handleNavBack}
                aria-label="Back"
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#14161A] active:bg-[#E3E1DC]/50 transition-colors"
              >
                <IconBack />
              </button>
            ) : (
              <div className="w-8" />
            )}

            <div className="text-center">
              <h1 className="text-[15px] font-semibold tracking-tight text-[#14161A]">
                {currentStep === 'flight' && 'Lisbon → Copenhagen'}
                {currentStep === 'fare' && 'Choose Your Fare'}
                {currentStep === 'seat' && 'Select Your Seat'}
                {currentStep === 'pay' && 'Review & Payment'}
              </h1>
              <p className="text-[11px] text-[#6B7078] font-normal leading-tight">Fri 11 Dec · 1 Adult</p>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#1C2DC4] flex items-center justify-center text-white text-[12px] font-bold">
              AS
            </div>
          </div>

          {/* 4-Step Progress Indicator (Flight · Fare · Seat · Pay) */}
          <div className="px-5 pb-3">
            <div className="grid grid-cols-4 gap-1.5 h-1">
              <div className={`h-1 rounded-full transition-all ${stepIndex >= 0 ? 'bg-[#3B4BDB]' : 'bg-[#E3E1DC]'}`} />
              <div className={`h-1 rounded-full transition-all ${stepIndex >= 1 ? 'bg-[#3B4BDB]' : 'bg-[#E3E1DC]'}`} />
              <div className={`h-1 rounded-full transition-all ${stepIndex >= 2 ? 'bg-[#3B4BDB]' : 'bg-[#E3E1DC]'}`} />
              <div className={`h-1 rounded-full transition-all ${stepIndex >= 3 ? 'bg-[#3B4BDB]' : 'bg-[#E3E1DC]'}`} />
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center mt-1.5 text-[11px] font-medium">
              <span className={stepIndex === 0 ? 'text-[#3B4BDB] font-semibold' : 'text-[#6B7078]'}>Flight</span>
              <span className={stepIndex === 1 ? 'text-[#3B4BDB] font-semibold' : 'text-[#6B7078]'}>Fare</span>
              <span className={stepIndex === 2 ? 'text-[#3B4BDB] font-semibold' : 'text-[#6B7078]'}>Seat</span>
              <span className={stepIndex === 3 ? 'text-[#3B4BDB] font-semibold' : 'text-[#6B7078]'}>Pay</span>
            </div>
          </div>
        </header>

        {/* =========================================================================
            SCREEN BODY CONTENT (RENDERED BY STEP)
           ========================================================================= */}
        <main className="flex-1 px-4 py-4 pb-28 overflow-y-auto">
          {/* STEP 1: FLIGHT SELECTION */}
          {currentStep === 'flight' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* Route Summary Pill */}
              <div className="bg-white rounded-full border border-[#E3E1DC] px-4 py-3 flex items-center justify-between shadow-none">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#14161A]">LIS → CPH</span>
                  <span className="text-[12px] text-[#6B7078]">· Fri 11 Dec · 1 Adult</span>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3B4BDB] bg-[#EEF0FB] px-2 py-0.5 rounded-full">
                  Direct
                </span>
              </div>

              {/* 5-Day Date Carousel */}
              <div className="grid grid-cols-5 gap-2">
                {DATES_STRIP.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={triggerHaptic}
                    className={`rounded-2xl border flex flex-col items-center justify-center py-2 transition-all ${
                      item.isSelected
                        ? 'bg-[#3B4BDB] border-[#3B4BDB] text-white shadow-sm'
                        : 'bg-white border-[#E3E1DC] text-[#14161A] active:bg-[#F3F3F9]'
                    }`}
                  >
                    <span className={`text-[11px] leading-tight ${item.isSelected ? 'text-white/80' : 'text-[#6B7078]'}`}>
                      {item.day}
                    </span>
                    <span className="text-[15px] font-bold leading-tight my-0.5">{item.date}</span>
                    <span className={`text-[11px] font-medium ${item.isSelected ? 'text-white' : 'text-[#6B7078]'}`}>
                      {item.price}
                    </span>
                  </button>
                ))}
              </div>

              {/* Filter Row & Honesty Note */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[12px] text-[#6B7078]">
                  <IconShield className="w-4 h-4 text-[#1F8A5B]" />
                  <span>Fixed price with all taxes</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setSortBy(sortBy === 'best' ? 'price' : 'best');
                  }}
                  className="bg-white border border-[#E3E1DC] rounded-full px-3 py-1 text-[11px] font-medium text-[#14161A] flex items-center gap-1 active:bg-[#F3F3F9]"
                >
                  <span>Sort: {sortBy === 'best' ? 'Best' : 'Lowest Price'}</span>
                </button>
              </div>

              {/* Flight Cards Stack */}
              <div className="flex flex-col gap-3">
                {FLIGHTS_DATA.map((flight) => {
                  const isSelected = selectedFlight.id === flight.id;
                  return (
                    <div
                      key={flight.id}
                      onClick={() => {
                        triggerHaptic();
                        setSelectedFlight(flight);
                      }}
                      className={`cursor-pointer rounded-[16px] border transition-all p-3.5 relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#EEF0FB] border-[#3B4BDB] shadow-sm'
                          : 'bg-white border-[#E3E1DC] hover:border-[#3B4BDB]/40'
                      }`}
                    >
                      {/* Top Flight Info Bar */}
                      <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-[#14161A]">{flight.airline} · {flight.flightNumber}</span>
                          {flight.badge && (
                            <span className="bg-[#3B4BDB] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              {flight.badge}
                            </span>
                          )}
                          <span className="text-[11px] text-[#6B7078]">{flight.aircraft}</span>
                        </div>
                        {flight.co2Reduction && (
                          <span className="text-[10px] font-medium text-[#1F8A5B] bg-[#1F8A5B]/10 px-2 py-0.5 rounded-full">
                            {flight.co2Reduction}
                          </span>
                        )}
                      </div>

                      {/* Schedule Timeline */}
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-1">
                        <div>
                          <span className="text-[20px] font-bold text-[#14161A] tracking-tight tabular-nums block">
                            {flight.departureTime}
                          </span>
                          <span className="text-[13px] font-semibold text-[#14161A]">{flight.departureCode}</span>
                          <span className="text-[11px] text-[#6B7078] block truncate">{flight.departureAirport}</span>
                        </div>

                        {/* Mid Indicator */}
                        <div className="flex flex-col items-center px-2 min-w-[90px]">
                          <span className="text-[11px] text-[#6B7078] font-medium mb-1">{flight.duration}</span>
                          <div className="w-full h-[1px] bg-[#E3E1DC] relative flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#3B4BDB]" />
                          </div>
                          <span className="text-[11px] text-[#1F8A5B] font-medium mt-1">
                            {flight.isDirect ? 'Non-stop' : flight.stopsDescription}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[20px] font-bold text-[#14161A] tracking-tight tabular-nums block">
                            {flight.arrivalTime}
                          </span>
                          <span className="text-[13px] font-semibold text-[#14161A]">{flight.arrivalCode}</span>
                          <span className="text-[11px] text-[#6B7078] block truncate">{flight.arrivalAirport}</span>
                        </div>
                      </div>

                      {/* Inclusions & Price Bottom Bar */}
                      <div className="mt-3 pt-2.5 border-t border-[#E3E1DC]/70 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px] text-[#6B7078]">
                          <div className="flex items-center gap-1">
                            <IconCheck className="w-3.5 h-3.5 text-[#1F8A5B]" />
                            <span>Cabin bag</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IconCheck className="w-3.5 h-3.5 text-[#1F8A5B]" />
                            <span>Seat included</span>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-[11px] text-[#6B7078]">all-in from</span>
                          <span className={`text-[19px] font-bold tabular-nums ${isSelected ? 'text-[#3B4BDB]' : 'text-[#14161A]'}`}>
                            €{flight.basePrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Honest Promise Card */}
              <div className="bg-white rounded-xl border border-[#E3E1DC] p-3.5 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#93F7BE]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#1F8A5B]">
                  <IconShield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[13px] font-semibold text-[#14161A] block">Straightforward travel promise</span>
                  <p className="text-[12px] text-[#6B7078] mt-0.5 leading-relaxed">
                    No surprise payment handling fees or forced add-ons. Standard personal item and overhead bag are guaranteed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FARE SELECTION */}
          {currentStep === 'fare' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* Flight Summary Context */}
              <div className="bg-white rounded-xl border border-[#E3E1DC] p-3.5">
                <div className="flex items-center justify-between text-[11px] text-[#6B7078] mb-1">
                  <span className="font-semibold uppercase tracking-wider text-[#3B4BDB]">Selected Flight</span>
                  <span>Direct · {selectedFlight.duration}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[16px] font-bold text-[#14161A]">
                      {selectedFlight.departureTime} – {selectedFlight.arrivalTime}
                    </span>
                    <span className="text-[12px] font-medium bg-[#EDEDF3] px-2 py-0.5 rounded-full text-[#14161A]">
                      {selectedFlight.flightNumber}
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#14161A]">
                    {selectedFlight.departureCode} → {selectedFlight.arrivalCode}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-[18px] font-bold tracking-tight text-[#14161A]">Choose your fare</h2>
                <p className="text-[13px] text-[#6B7078] mt-0.5">
                  Clear, all-inclusive pricing with transparent luggage allowances.
                </p>
              </div>

              {/* Fare Tier Cards */}
              <div className="flex flex-col gap-3">
                {FARE_TIERS.map((tier) => {
                  const isSelected = selectedFareTier.id === tier.id;
                  const tierPrice = selectedFlight.basePrice + tier.priceDelta;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => {
                        triggerHaptic();
                        setSelectedFareTier(tier);
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all relative ${
                        isSelected
                          ? 'bg-[#EEF0FB] border-[#3B4BDB] shadow-sm'
                          : 'bg-white border-[#E3E1DC] active:bg-[#F3F3F9]'
                      }`}
                    >
                      {tier.isPopular && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-white bg-[#3B4BDB] px-2.5 py-0.5 rounded-full">
                            Most popular
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#3B4BDB] text-white flex items-center justify-center">
                              <IconCheck className="w-3.5 h-3.5 text-white" />
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-[16px] font-bold text-[#14161A]">{tier.name}</h3>
                          <span className="text-[12px] text-[#6B7078]">{tier.subtitle}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-[20px] font-bold tabular-nums ${isSelected ? 'text-[#3B4BDB]' : 'text-[#14161A]'}`}>
                            €{tierPrice}
                          </span>
                          <span className="block text-[11px] text-[#6B7078]">per traveler</span>
                        </div>
                      </div>

                      {/* Inclusions List */}
                      <div className="flex flex-col gap-2 pt-3 border-t border-[#E3E1DC]/80 mt-3">
                        {tier.inclusions.map((inc, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-[12px]">
                            {inc.included ? (
                              <IconCheck className="w-4 h-4 text-[#1F8A5B] shrink-0" />
                            ) : (
                              <span className="w-4 text-center text-[#6B7078] font-bold shrink-0">—</span>
                            )}
                            <span className={inc.included ? 'text-[#14161A] font-medium' : 'text-[#6B7078]'}>
                              {inc.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex justify-end">
                        <span className={`text-[12px] font-semibold ${isSelected ? 'text-[#3B4BDB]' : 'text-[#6B7078]'}`}>
                          {isSelected ? '✓ Selected tier' : 'Tap to select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Guarantee Callout */}
              <div className="bg-white rounded-xl border border-[#E3E1DC] p-3 flex items-start gap-2.5">
                <IconShield className="w-5 h-5 text-[#3B4BDB] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#6B7078] leading-snug">
                  <strong className="text-[#14161A]">Locked Fare Guarantee:</strong> The tier price selected right now includes mandatory passenger taxes, security, and fuel surcharges.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: SEAT SELECTION */}
          {currentStep === 'seat' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* Route & Aircraft Badge */}
              <div className="bg-white rounded-xl border border-[#E3E1DC] p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[14px] font-bold text-[#14161A]">
                    <span>{selectedFlight.departureCode}</span>
                    <span>→</span>
                    <span>{selectedFlight.arrivalCode}</span>
                  </div>
                  <span className="text-[11px] text-[#6B7078]">
                    {selectedFlight.flightNumber} · {selectedFlight.aircraft}
                  </span>
                </div>
                <div className="bg-[#EEF0FB] text-[#3B4BDB] px-3 py-1 rounded-full text-[12px] font-semibold">
                  {selectedFareTier.name} Fare
                </div>
              </div>

              {/* Seat Legend */}
              <div className="bg-white rounded-xl border border-[#E3E1DC] p-3 flex items-center justify-around text-[11px] text-[#6B7078]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-white border border-[#E3E1DC]" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#FFF4E5] border border-[#F5B875]" />
                  <span>+€15 Exit Row</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#E3E1DC]" />
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-[#3B4BDB]" />
                  <span className="text-[#3B4BDB] font-semibold">Selected</span>
                </div>
              </div>

              {/* Airplane Cabin Container */}
              <div className="bg-white rounded-2xl border border-[#E3E1DC] p-4 flex flex-col items-center">
                {/* Nose Cone */}
                <div className="w-24 h-5 rounded-t-full bg-[#EDEDF3] flex items-center justify-center mb-1 text-[#6B7078]">
                  <IconPlane className="w-3.5 h-3.5 text-[#3B4BDB]" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#6B7078] font-semibold mb-3">
                  Front of Aircraft · Cockpit
                </span>

                {/* Column Letters */}
                <div className="w-full max-w-[320px] grid grid-cols-7 gap-1.5 text-center text-[12px] font-bold text-[#6B7078] mb-2">
                  <span>A</span>
                  <span>B</span>
                  <span>C</span>
                  <span className="text-[9px] text-[#6B7078]/60 uppercase tracking-widest self-center">AISLE</span>
                  <span>D</span>
                  <span>E</span>
                  <span>F</span>
                </div>

                {/* Rows Grid */}
                <div className="w-full max-w-[320px] flex flex-col gap-2">
                  {[10, 11, 12, 14, 15, 16].map((rowNum) => {
                    const rowSeats = seats.filter((s) => s.row === rowNum);
                    const isExitRow = rowNum === 12;

                    return (
                      <div key={rowNum} className="flex flex-col gap-1">
                        {isExitRow && (
                          <div className="bg-[#FFF4E5] border border-[#F5B875]/40 rounded-lg px-2 py-0.5 my-1 flex justify-between items-center text-[10px]">
                            <span className="font-semibold text-[#B45309]">Emergency Exit Row</span>
                            <span className="font-bold text-[#B45309]">+7cm Legroom</span>
                          </div>
                        )}

                        <div className="grid grid-cols-7 gap-1.5 items-center">
                          {/* Seats A, B, C */}
                          {['A', 'B', 'C'].map((col) => {
                            const seat = rowSeats.find((s) => s.letter === col);
                            if (!seat) return <div key={col} className="h-9" />;
                            const isSelected = selectedSeatId === seat.id;

                            if (seat.isOccupied) {
                              return (
                                <div
                                  key={seat.id}
                                  className="h-9 rounded-lg bg-[#E3E1DC] flex items-center justify-center text-[11px] text-[#6B7078]/60 font-semibold"
                                >
                                  {seat.id}
                                </div>
                              );
                            }

                            return (
                              <button
                                key={seat.id}
                                type="button"
                                onClick={() => handleSelectSeat(seat)}
                                className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold text-[11px] transition-all active:scale-95 ${
                                  isSelected
                                    ? 'bg-[#3B4BDB] text-white shadow-sm'
                                    : seat.isExitRow
                                    ? 'bg-[#FFF4E5] border border-[#F5B875] text-[#B45309]'
                                    : 'bg-white border border-[#E3E1DC] text-[#14161A] hover:bg-[#F3F3F9]'
                                }`}
                              >
                                <span>{seat.id}</span>
                                {seat.isExitRow && !isSelected && (
                                  <span className="text-[8px] leading-none text-[#B45309]">+€15</span>
                                )}
                              </button>
                            );
                          })}

                          {/* Center Row Number */}
                          <div className="text-center text-[11px] font-bold text-[#6B7078]">
                            {rowNum}
                          </div>

                          {/* Seats D, E, F */}
                          {['D', 'E', 'F'].map((col) => {
                            const seat = rowSeats.find((s) => s.letter === col);
                            if (!seat) return <div key={col} className="h-9" />;
                            const isSelected = selectedSeatId === seat.id;

                            if (seat.isOccupied) {
                              return (
                                <div
                                  key={seat.id}
                                  className="h-9 rounded-lg bg-[#E3E1DC] flex items-center justify-center text-[11px] text-[#6B7078]/60 font-semibold"
                                >
                                  {seat.id}
                                </div>
                              );
                            }

                            return (
                              <button
                                key={seat.id}
                                type="button"
                                onClick={() => handleSelectSeat(seat)}
                                className={`h-9 rounded-lg flex flex-col items-center justify-center font-bold text-[11px] transition-all active:scale-95 ${
                                  isSelected
                                    ? 'bg-[#3B4BDB] text-white shadow-sm'
                                    : seat.isExitRow
                                    ? 'bg-[#FFF4E5] border border-[#F5B875] text-[#B45309]'
                                    : 'bg-white border border-[#E3E1DC] text-[#14161A] hover:bg-[#F3F3F9]'
                                }`}
                              >
                                <span>{seat.id}</span>
                                {seat.isExitRow && !isSelected && (
                                  <span className="text-[8px] leading-none text-[#B45309]">+€15</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Seat Summary Card */}
              <div className="bg-white rounded-xl border border-[#E3E1DC] p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[14px] font-bold text-[#14161A] block">
                    Seat {currentSeat.id} · {currentSeat.type} {currentSeat.isExitRow ? '(Exit Row)' : ''}
                  </span>
                  <span className="text-[12px] text-[#6B7078]">
                    {currentSeat.price > 0
                      ? 'Extra Legroom upgrade (+€15.00)'
                      : `Included with your ${selectedFareTier.name} fare (+€0.00)`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[15px] font-bold text-[#14161A] tabular-nums block">
                    +€{currentSeat.price.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-medium text-[#1F8A5B]">
                    {currentSeat.price === 0 ? 'Complimentary' : 'Upgrade'}
                  </span>
                </div>
              </div>

              {/* Cabin Amenities Bar */}
              <div className="bg-white rounded-xl border border-[#E3E1DC] p-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7078] mb-2 block">
                  Aircraft Specifications
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-[#F3F3F9] p-2 rounded-lg">
                    <span className="font-bold text-[#14161A] block">USB-C Power</span>
                    <span className="text-[#6B7078]">At every seat</span>
                  </div>
                  <div className="bg-[#F3F3F9] p-2 rounded-lg">
                    <span className="font-bold text-[#14161A] block">31" Pitch</span>
                    <span className="text-[#6B7078]">Ergonomic recline</span>
                  </div>
                  <div className="bg-[#F3F3F9] p-2 rounded-lg">
                    <span className="font-bold text-[#14161A] block">HEPA Air</span>
                    <span className="text-[#6B7078]">99.97% clean airflow</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT & REVIEW */}
          {currentStep === 'pay' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* Honest Price Banner */}
              <div className="bg-white rounded-xl border border-[#E3E1DC] p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#93F7BE]/40 flex items-center justify-center text-[#1F8A5B]">
                    <IconShield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-[#14161A] block">Honest Price Promise</span>
                    <span className="text-[11px] text-[#6B7078]">Zero credit card or payment surcharges</span>
                  </div>
                </div>
                <IconCheck className="w-5 h-5 text-[#1F8A5B]" />
              </div>

              {/* Trip Itinerary Card */}
              <div className="bg-white rounded-xl border border-[#E3E1DC] p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#6B7078]">Itinerary</span>
                  <span className="text-[11px] font-semibold text-[#3B4BDB] bg-[#EEF0FB] px-2 py-0.5 rounded-full">
                    {selectedFlight.isDirect ? 'Direct Flight' : 'Connecting'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[24px] font-bold text-[#14161A] leading-tight block">
                      {selectedFlight.departureCode}
                    </span>
                    <span className="text-[12px] text-[#6B7078]">Lisbon</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-4">
                    <span className="text-[11px] font-medium text-[#6B7078] mb-1">{selectedFlight.duration}</span>
                    <div className="w-full h-[1px] bg-[#E3E1DC] relative flex items-center justify-center">
                      <IconPlane className="w-3.5 h-3.5 text-[#3B4BDB] rotate-90" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#3B4BDB] mt-1">{selectedFlight.flightNumber}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[24px] font-bold text-[#14161A] leading-tight block">
                      {selectedFlight.arrivalCode}
                    </span>
                    <span className="text-[12px] text-[#6B7078]">Copenhagen</span>
                  </div>
                </div>

                <div className="bg-[#F3F3F9] rounded-lg p-2.5 flex items-center justify-between text-[12px]">
                  <span className="text-[#6B7078]">Fri, 11 Dec 2026</span>
                  <span className="font-semibold text-[#14161A]">
                    {selectedFlight.departureTime} → {selectedFlight.arrivalTime}
                  </span>
                </div>

                {/* Passenger & Inclusions summary */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[12px]">
                  <div className="bg-[#F3F3F9] p-2.5 rounded-lg">
                    <span className="text-[11px] text-[#6B7078] block">Passenger</span>
                    <span className="font-bold text-[#14161A]">{passenger.fullName}</span>
                    <span className="text-[10px] text-[#6B7078] block">1 Adult</span>
                  </div>
                  <div className="bg-[#F3F3F9] p-2.5 rounded-lg">
                    <span className="text-[11px] text-[#6B7078] block">Seat & Fare</span>
                    <span className="font-bold text-[#14161A]">{currentSeat.id} ({currentSeat.type})</span>
                    <span className="text-[10px] text-[#1F8A5B] block font-semibold">{selectedFareTier.name} Fare</span>
                  </div>
                </div>
              </div>

              {/* Itemized Price Breakdown Card */}
              <div className="bg-white rounded-xl border border-[#E3E1DC] p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[14px] font-bold text-[#14161A]">Transparent Fare Review</span>
                  <span className="text-[11px] font-semibold text-[#1F8A5B] bg-[#93F7BE]/40 px-2 py-0.5 rounded-full">
                    Price Locked
                  </span>
                </div>

                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#6B7078]">Flight fare ({selectedFareTier.name})</span>
                  <span className="font-semibold text-[#14161A] tabular-nums">
                    €{(selectedFlight.basePrice + selectedFareTier.priceDelta - 36).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#6B7078]">Taxes, security & airport charges</span>
                  <span className="font-semibold text-[#14161A] tabular-nums">€36.00</span>
                </div>

                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#6B7078]">Seat selection ({currentSeat.id} {currentSeat.type})</span>
                  <span className="font-semibold text-[#14161A] tabular-nums">
                    €{currentSeat.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#6B7078]">Baggage allowance</span>
                  <span className="font-semibold text-[#1F8A5B]">Included</span>
                </div>

                <div className="h-[1px] bg-[#E3E1DC] my-1" />

                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-[15px] font-bold text-[#14161A] block">Total due</span>
                    <span className="text-[11px] text-[#6B7078]">Includes all local VAT & taxes</span>
                  </div>
                  <span className="text-[24px] font-bold text-[#3B4BDB] tabular-nums">
                    €{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7078]">Payment Method</span>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B7078]">
                    <IconLock className="w-3.5 h-3.5" />
                    <span>256-bit SSL Encrypted</span>
                  </div>
                </div>

                {/* Option 1: Credit / Debit Card */}
                <div
                  onClick={() => {
                    triggerHaptic();
                    setSelectedPaymentMethod('card');
                  }}
                  className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition-all ${
                    selectedPaymentMethod === 'card'
                      ? 'bg-[#EEF0FB] border-[#3B4BDB]'
                      : 'bg-white border-[#E3E1DC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EDEDF3] flex items-center justify-center text-[#1C2DC4]">
                      <IconCreditCard />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-[#14161A]">Debit Mastercard</span>
                        <span className="text-[11px] font-mono bg-[#EDEDF3] px-1.5 py-0.5 rounded text-[#14161A]">
                          •••• 4821
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7078]">Expires 08/28 · Anna Silva</span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      selectedPaymentMethod === 'card' ? 'bg-[#3B4BDB] text-white' : 'border border-[#E3E1DC]'
                    }`}
                  >
                    {selectedPaymentMethod === 'card' && <IconCheck className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>

                {/* Option 2: Instant Bank Transfer */}
                <div
                  onClick={() => {
                    triggerHaptic();
                    setSelectedPaymentMethod('bank');
                  }}
                  className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition-all ${
                    selectedPaymentMethod === 'bank'
                      ? 'bg-[#EEF0FB] border-[#3B4BDB]'
                      : 'bg-white border-[#E3E1DC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EDEDF3] flex items-center justify-center text-[#6B7078]">
                      <IconBank />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-[#14161A] block">Instant Bank Transfer</span>
                      <span className="text-[11px] text-[#6B7078]">SEPA / Open Banking Instant Auth</span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      selectedPaymentMethod === 'bank' ? 'bg-[#3B4BDB] text-white' : 'border border-[#E3E1DC]'
                    }`}
                  >
                    {selectedPaymentMethod === 'bank' && <IconCheck className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>

                {/* Option 3: Digital Wallet (Google Pay / Apple Pay) */}
                <div
                  onClick={() => {
                    triggerHaptic();
                    setSelectedPaymentMethod('wallet');
                  }}
                  className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition-all ${
                    selectedPaymentMethod === 'wallet'
                      ? 'bg-[#EEF0FB] border-[#3B4BDB]'
                      : 'bg-white border-[#E3E1DC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EDEDF3] flex items-center justify-center text-[#6B7078]">
                      <IconWallet />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-[#14161A] block">Google Pay / Digital Wallet</span>
                      <span className="text-[11px] text-[#6B7078]">Instant one-touch biometric checkout</span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      selectedPaymentMethod === 'wallet' ? 'bg-[#3B4BDB] text-white' : 'border border-[#E3E1DC]'
                    }`}
                  >
                    {selectedPaymentMethod === 'wallet' && <IconCheck className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* =========================================================================
            PERSISTENT STICKY BOTTOM ANCHOR BAR
           ========================================================================= */}
        <footer className="fixed bottom-0 w-full max-w-[430px] z-50 bg-white/95 backdrop-blur-xl border-t border-[#E3E1DC] px-4 pt-3 pb-6 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Total Price Display */}
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[11px] text-[#6B7078] leading-none">Total · 1 adult</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[24px] font-bold text-[#14161A] tracking-tight tabular-nums">
                  €{totalPrice.toFixed(0)}
                </span>
                <span className="text-[11px] text-[#6B7078] font-normal">all-in</span>
              </div>
            </div>

            {/* Right: Primary Action Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                if (currentStep === 'flight') setCurrentStep('fare');
                else if (currentStep === 'fare') setCurrentStep('seat');
                else if (currentStep === 'seat') setCurrentStep('pay');
                else if (currentStep === 'pay') handleConfirmAndPay();
              }}
              className="flex-1 max-w-[210px] h-[50px] bg-[#3B4BDB] hover:bg-[#1C2DC4] active:scale-[0.98] text-white rounded-[14px] text-[15px] font-bold tracking-tight shadow-none flex items-center justify-center transition-all"
            >
              {currentStep === 'flight' && 'Select Fare'}
              {currentStep === 'fare' && 'Select Seat'}
              {currentStep === 'seat' && 'Review & Pay'}
              {currentStep === 'pay' && `Pay €${totalPrice.toFixed(2)}`}
            </button>
          </div>

          {/* Android Capacitor / iOS Home Indicator Pill */}
          <div className="w-full flex justify-center pt-1">
            <div className="w-32 h-1 bg-[#14161A]/20 rounded-full" />
          </div>
        </footer>

        {/* =========================================================================
            BOOKING CONFIRMATION SUCCESS MODAL
           ========================================================================= */}
        {showBookingSuccess && (
          <div className="fixed inset-0 z-50 bg-[#14161A]/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-slideUp">
              <div className="w-16 h-16 rounded-full bg-[#1F8A5B]/15 text-[#1F8A5B] flex items-center justify-center mb-4">
                <IconCheck className="w-8 h-8 text-[#1F8A5B]" />
              </div>

              <h3 className="text-[20px] font-bold text-[#14161A]">Booking Confirmed!</h3>
              <p className="text-[13px] text-[#6B7078] mt-1 mb-4">
                Your flight to Copenhagen has been successfully booked and ticketed.
              </p>

              {/* Ticket Details Box */}
              <div className="w-full bg-[#F6F5F2] rounded-2xl p-4 mb-4 text-left border border-[#E3E1DC]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-[#6B7078] uppercase font-semibold">Booking Ref (PNR)</span>
                  <span className="text-[13px] font-mono font-bold text-[#3B4BDB]">{bookingPnr}</span>
                </div>
                <div className="text-[14px] font-bold text-[#14161A] mb-1">
                  {selectedFlight.departureCode} → {selectedFlight.arrivalCode} · {selectedFlight.flightNumber}
                </div>
                <div className="text-[12px] text-[#6B7078] flex justify-between">
                  <span>Passenger: {passenger.fullName}</span>
                  <span className="font-semibold text-[#14161A]">Seat: {currentSeat.id}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#E3E1DC] flex justify-between items-center text-[13px]">
                  <span className="text-[#6B7078]">Total Paid:</span>
                  <span className="font-bold text-[#14161A] tabular-nums">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full h-12 bg-[#3B4BDB] text-white rounded-[14px] font-bold text-[14px] hover:bg-[#1C2DC4] active:scale-[0.98] transition-all"
              >
                Done / Book Another Flight
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FlightBookingApp;

