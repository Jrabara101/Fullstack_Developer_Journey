import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';

/**
 * ============================================================================
 * CALM AIRFLOW FLIGHT BOOKING APP (PURE REACT NATIVE)
 * ============================================================================
 * Design System: Calm Airflow
 * Framework: React Native (Expo / Bare RN / Android & iOS)
 * Screens Combined:
 *   1. Flight Selection (LIS → CPH, date strip, sort, flight cards)
 *   2. Fare Selection (Light, Standard, Plus with inclusions/exclusions)
 *   3. Seat Selection (Interactive 3-3 aircraft cabin map, Exit row upgrades)
 *   4. Payment & Review (Transparent price summary, passenger details, PNR modal)
 * ============================================================================
 */

// Theme Palette (Calm Airflow)
const COLORS = {
  canvas: '#F6F5F2',
  surface: '#FFFFFF',
  surfaceLow: '#F3F3F9',
  surfaceHigh: '#E8E8ED',
  primary: '#1C2DC4',
  primaryContainer: '#3B4BDB',
  primaryTint: '#EEF0FB',
  onSurface: '#14161A',
  onSurfaceVariant: '#6B7078',
  outline: '#E3E1DC',
  success: '#1F8A5B',
  successBg: '#E8F5E9',
  amberBg: '#FFF4E5',
  amberText: '#B45309',
};

// Types
export type Step = 'flight' | 'fare' | 'seat' | 'pay';

interface FlightItem {
  id: string;
  airline: string;
  flightNumber: string;
  aircraft: string;
  depTime: string;
  depCode: string;
  arrTime: string;
  arrCode: string;
  duration: string;
  basePrice: number;
  badge?: string;
}

interface FareOption {
  id: string;
  name: string;
  subtitle: string;
  priceDelta: number;
  inclusions: { text: string; included: boolean }[];
}

interface SeatItem {
  id: string;
  row: number;
  col: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  type: string;
  isExitRow: boolean;
  price: number;
  isOccupied: boolean;
}

// Mock Data
const FLIGHTS: FlightItem[] = [
  {
    id: 'fl-1',
    airline: 'Tern Air',
    flightNumber: 'TN 402',
    aircraft: 'Airbus A321neo',
    depTime: '07:15',
    depCode: 'LIS',
    arrTime: '12:40',
    arrCode: 'CPH',
    duration: '4h 25m',
    basePrice: 148,
    badge: 'Selected',
  },
  {
    id: 'fl-2',
    airline: 'Tern Air',
    flightNumber: 'TN 406',
    aircraft: 'Boeing 737-800',
    depTime: '13:20',
    depCode: 'LIS',
    arrTime: '18:45',
    arrCode: 'CPH',
    duration: '4h 25m',
    basePrice: 172,
  },
  {
    id: 'fl-3',
    airline: 'Tern Air',
    flightNumber: 'TN 410',
    aircraft: 'Airbus A320',
    depTime: '19:05',
    depCode: 'LIS',
    arrTime: '00:30',
    arrCode: 'CPH',
    duration: '4h 25m',
    basePrice: 135,
  },
];

const FARES: FareOption[] = [
  {
    id: 'light',
    name: 'Light',
    subtitle: 'Essential travel, carry-on only',
    priceDelta: 0,
    inclusions: [
      { text: 'Small cabin bag (under seat)', included: true },
      { text: 'Taxes & airport fees included', included: true },
      { text: 'Overhead cabin bag (10kg)', included: false },
      { text: 'Seat selection', included: false },
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    subtitle: 'Balanced comfort with cabin allowance',
    priceDelta: 36,
    inclusions: [
      { text: 'Small cabin bag + 10kg overhead trolley', included: true },
      { text: 'Standard seat selection (Rows 8–24)', included: true },
      { text: 'Taxes & fees included', included: true },
      { text: 'Checked bag (23kg)', included: false },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    subtitle: 'Maximum flexibility & heavy luggage',
    priceDelta: 90,
    inclusions: [
      { text: 'Cabin bag + 10kg overhead trolley', included: true },
      { text: '23kg checked bag included', included: true },
      { text: 'Free seat selection (any row)', included: true },
      { text: 'Free ticket exchange & cancellation', included: true },
    ],
  },
];

const CABIN_ROWS = [10, 11, 12, 14, 15];

export const FlightBookingAppReactNative: React.FC = () => {
  const [step, setStep] = useState<Step>('flight');
  const [selectedFlight, setSelectedFlight] = useState<FlightItem>(FLIGHTS[0]);
  const [selectedFare, setSelectedFare] = useState<FareOption>(FARES[1]);
  const [selectedSeat, setSelectedSeat] = useState<string>('14A');
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [pnr, setPnr] = useState<string>('');

  const isExitSeat = selectedSeat.startsWith('12');
  const seatUpgradeCost = isExitSeat ? 15 : 0;
  const total = selectedFlight.basePrice + selectedFare.priceDelta + seatUpgradeCost;

  const handleNext = () => {
    if (step === 'flight') setStep('fare');
    else if (step === 'fare') setStep('seat');
    else if (step === 'seat') setStep('pay');
    else if (step === 'pay') {
      setPnr('TRN-' + Math.floor(1000 + Math.random() * 9000) + 'K');
      setModalVisible(true);
    }
  };

  const handleBack = () => {
    if (step === 'pay') setStep('seat');
    else if (step === 'seat') setStep('fare');
    else if (step === 'fare') setStep('flight');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.canvas} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.navRow}>
          {step !== 'flight' ? (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {step === 'flight' && 'Lisbon → Copenhagen'}
              {step === 'fare' && 'Choose Your Fare'}
              {step === 'seat' && 'Select Your Seat'}
              {step === 'pay' && 'Review & Payment'}
            </Text>
            <Text style={styles.headerSubtitle}>Fri 11 Dec · 1 Adult</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBars}>
            <View style={[styles.barSegment, { backgroundColor: COLORS.primaryContainer }]} />
            <View style={[styles.barSegment, { backgroundColor: step !== 'flight' ? COLORS.primaryContainer : COLORS.outline }]} />
            <View style={[styles.barSegment, { backgroundColor: step === 'seat' || step === 'pay' ? COLORS.primaryContainer : COLORS.outline }]} />
            <View style={[styles.barSegment, { backgroundColor: step === 'pay' ? COLORS.primaryContainer : COLORS.outline }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progText, step === 'flight' && styles.progActive]}>Flight</Text>
            <Text style={[styles.progText, step === 'fare' && styles.progActive]}>Fare</Text>
            <Text style={[styles.progText, step === 'seat' && styles.progActive]}>Seat</Text>
            <Text style={[styles.progText, step === 'pay' && styles.progActive]}>Pay</Text>
          </View>
        </View>
      </View>

      {/* Main Body */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STEP 1: FLIGHTS */}
        {step === 'flight' && (
          <View style={styles.stepContainer}>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryPillText}>LIS → CPH · Fri 11 Dec · 1 Adult</Text>
              <Text style={styles.badgeDirect}>DIRECT</Text>
            </View>

            <View style={styles.cardsList}>
              {FLIGHTS.map((fl) => {
                const active = selectedFlight.id === fl.id;
                return (
                  <TouchableOpacity
                    key={fl.id}
                    onPress={() => setSelectedFlight(fl)}
                    style={[styles.flightCard, active && styles.cardActive]}
                  >
                    <View style={styles.flightTop}>
                      <Text style={styles.airlineText}>{fl.airline} · {fl.flightNumber}</Text>
                      {fl.badge && <Text style={styles.bestBadge}>{fl.badge}</Text>}
                    </View>
                    <View style={styles.flightSchedule}>
                      <View>
                        <Text style={styles.timeText}>{fl.depTime}</Text>
                        <Text style={styles.codeText}>{fl.depCode}</Text>
                      </View>
                      <View style={styles.durationBox}>
                        <Text style={styles.durationText}>{fl.duration}</Text>
                        <View style={styles.line} />
                        <Text style={styles.directText}>Non-stop</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.timeText}>{fl.arrTime}</Text>
                        <Text style={styles.codeText}>{fl.arrCode}</Text>
                      </View>
                    </View>
                    <View style={styles.flightBottom}>
                      <Text style={styles.inclusionsText}>✓ Cabin bag + seat included</Text>
                      <Text style={[styles.priceText, active && { color: COLORS.primaryContainer }]}>
                        €{fl.basePrice}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 2: FARES */}
        {step === 'fare' && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionHeading}>Choose your fare tier</Text>
            {FARES.map((fare) => {
              const active = selectedFare.id === fare.id;
              const price = selectedFlight.basePrice + fare.priceDelta;
              return (
                <TouchableOpacity
                  key={fare.id}
                  onPress={() => setSelectedFare(fare)}
                  style={[styles.fareCard, active && styles.cardActive]}
                >
                  <View style={styles.fareHeader}>
                    <View>
                      <Text style={styles.fareTitle}>{fare.name}</Text>
                      <Text style={styles.fareSubtitle}>{fare.subtitle}</Text>
                    </View>
                    <Text style={[styles.farePrice, active && { color: COLORS.primaryContainer }]}>
                      €{price}
                    </Text>
                  </View>
                  <View style={styles.inclusionsList}>
                    {fare.inclusions.map((inc, i) => (
                      <Text key={i} style={inc.included ? styles.incItem : styles.excItem}>
                        {inc.included ? '✓ ' : '— '}{inc.text}
                      </Text>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 3: SEATS */}
        {step === 'seat' && (
          <View style={styles.stepContainer}>
            <View style={styles.cabinCard}>
              <Text style={styles.cockpitText}>FRONT OF AIRCRAFT</Text>
              <View style={styles.colHeaderRow}>
                <Text style={styles.colHeaderText}>A</Text>
                <Text style={styles.colHeaderText}>B</Text>
                <Text style={styles.colHeaderText}>C</Text>
                <Text style={styles.aisleText}>AISLE</Text>
                <Text style={styles.colHeaderText}>D</Text>
                <Text style={styles.colHeaderText}>E</Text>
                <Text style={styles.colHeaderText}>F</Text>
              </View>

              {CABIN_ROWS.map((row) => (
                <View key={row} style={styles.seatRow}>
                  {['A', 'B', 'C'].map((col) => {
                    const id = `${row}${col}`;
                    const isSelected = selectedSeat === id;
                    const isExit = row === 12;
                    return (
                      <TouchableOpacity
                        key={id}
                        onPress={() => setSelectedSeat(id)}
                        style={[
                          styles.seatBox,
                          isExit && styles.exitSeatBox,
                          isSelected && styles.seatSelected,
                        ]}
                      >
                        <Text style={[styles.seatText, isSelected && { color: '#FFF' }]}>{id}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  <Text style={styles.rowNumber}>{row}</Text>
                  {['D', 'E', 'F'].map((col) => {
                    const id = `${row}${col}`;
                    const isSelected = selectedSeat === id;
                    const isExit = row === 12;
                    return (
                      <TouchableOpacity
                        key={id}
                        onPress={() => setSelectedSeat(id)}
                        style={[
                          styles.seatBox,
                          isExit && styles.exitSeatBox,
                          isSelected && styles.seatSelected,
                        ]}
                      >
                        <Text style={[styles.seatText, isSelected && { color: '#FFF' }]}>{id}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.seatSummaryBox}>
              <Text style={styles.seatSummaryTitle}>Selected Seat: {selectedSeat}</Text>
              <Text style={styles.seatSummarySubtitle}>
                {isExitSeat ? 'Emergency Exit Row (+€15.00)' : 'Standard Seat (Included +€0.00)'}
              </Text>
            </View>
          </View>
        )}

        {/* STEP 4: PAY */}
        {step === 'pay' && (
          <View style={styles.stepContainer}>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewHeading}>Booking Itinerary</Text>
              <Text style={styles.itineraryLine}>
                {selectedFlight.depCode} → {selectedFlight.arrCode} ({selectedFlight.flightNumber})
              </Text>
              <Text style={styles.passengerLine}>Passenger: Anna Silva · Seat {selectedSeat}</Text>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewHeading}>Price Breakdown</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Flight & Fare ({selectedFare.name})</Text>
                <Text style={styles.priceValue}>€{selectedFlight.basePrice + selectedFare.priceDelta}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Seat ({selectedSeat})</Text>
                <Text style={styles.priceValue}>€{seatUpgradeCost}.00</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Due</Text>
                <Text style={styles.totalValue}>€{total}.00</Text>
              </View>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewHeading}>Payment Method</Text>
              <TouchableOpacity
                onPress={() => setSelectedPayment('card')}
                style={[styles.paymentMethod, selectedPayment === 'card' && styles.paymentActive]}
              >
                <Text style={styles.payName}>Debit Mastercard •••• 4821</Text>
                <Text style={styles.payCheck}>{selectedPayment === 'card' ? '✓' : ''}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomSub}>Total · 1 adult</Text>
          <Text style={styles.bottomTotal}>€{total}</Text>
        </View>
        <TouchableOpacity onPress={handleNext} style={styles.ctaButton}>
          <Text style={styles.ctaText}>
            {step === 'flight' && 'Select Fare'}
            {step === 'fare' && 'Select Seat'}
            {step === 'seat' && 'Review & Pay'}
            {step === 'pay' && `Pay €${total}.00`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>✓</Text>
            <Text style={styles.modalTitle}>Booking Confirmed!</Text>
            <Text style={styles.modalPnr}>PNR: {pnr}</Text>
            <Text style={styles.modalDetails}>
              {selectedFlight.depCode} → {selectedFlight.arrCode} · Seat {selectedSeat}
            </Text>
            <Text style={styles.modalPaid}>Paid Total: €{total}.00</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setStep('flight');
              }}
              style={styles.modalBtn}
            >
              <Text style={styles.modalBtnText}>Done / Book Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  header: {
    backgroundColor: COLORS.canvas,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outline,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    color: COLORS.onSurface,
    lineHeight: 30,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBars: {
    flexDirection: 'row',
    gap: 6,
    height: 4,
  },
  barSegment: {
    flex: 1,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    flex: 1,
    textAlign: 'center',
  },
  progActive: {
    color: COLORS.primaryContainer,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  stepContainer: {
    gap: 12,
  },
  summaryPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  summaryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  badgeDirect: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryContainer,
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cardsList: {
    gap: 12,
    marginTop: 8,
  },
  flightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outline,
    padding: 14,
  },
  cardActive: {
    borderColor: COLORS.primaryContainer,
    backgroundColor: COLORS.primaryTint,
  },
  flightTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  airlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  bestBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  flightSchedule: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  codeText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  durationBox: {
    alignItems: 'center',
    width: 90,
  },
  durationText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  line: {
    height: 1,
    backgroundColor: COLORS.outline,
    width: '100%',
    marginVertical: 4,
  },
  directText: {
    fontSize: 10,
    color: COLORS.success,
  },
  flightBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.outline,
    paddingTop: 8,
    marginTop: 8,
  },
  inclusionsText: {
    fontSize: 11,
    color: COLORS.success,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  fareCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outline,
    padding: 14,
  },
  fareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fareTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  fareSubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  farePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  inclusionsList: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.outline,
    paddingTop: 8,
  },
  incItem: {
    fontSize: 12,
    color: COLORS.onSurface,
  },
  excItem: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  cabinCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outline,
    padding: 14,
    alignItems: 'center',
  },
  cockpitText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },
  colHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  colHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    width: 32,
    textAlign: 'center',
    color: COLORS.onSurfaceVariant,
  },
  aisleText: {
    fontSize: 9,
    width: 40,
    textAlign: 'center',
    color: COLORS.outline,
    lineHeight: 18,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
  },
  seatBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitSeatBox: {
    backgroundColor: COLORS.amberBg,
    borderColor: '#F5B875',
  },
  seatSelected: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },
  seatText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  rowNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    width: 40,
    textAlign: 'center',
  },
  seatSummaryBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.outline,
    padding: 12,
  },
  seatSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  seatSummarySubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.outline,
    padding: 14,
  },
  reviewHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 6,
  },
  itineraryLine: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  passengerLine: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.outline,
    paddingTop: 8,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryContainer,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: 10,
    marginTop: 4,
  },
  paymentActive: {
    borderColor: COLORS.primaryContainer,
    backgroundColor: COLORS.primaryTint,
  },
  payName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  payCheck: {
    fontSize: 13,
    color: COLORS.primaryContainer,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outline,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomSub: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  bottomTotal: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  ctaButton: {
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 160,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  modalIcon: {
    fontSize: 32,
    color: COLORS.success,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  modalPnr: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryContainer,
    marginVertical: 6,
  },
  modalDetails: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },
  modalPaid: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 16,
  },
  modalBtn: {
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default FlightBookingAppReactNative;

