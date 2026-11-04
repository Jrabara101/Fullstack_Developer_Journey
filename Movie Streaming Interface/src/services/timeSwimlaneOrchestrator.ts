import { SimulatedTimeSlot } from '../types';

export interface TimeContext {
  currentTime: Date;
  hour: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  isWeekend: boolean;
  timeSlotName: string;
  timeSlotBadge: string;
  timeSlotDescription: string;
  recommendedCategoryOrder: string[];
}

export const TIME_SIMULATION_PRESETS: SimulatedTimeSlot[] = [
  {
    label: 'Live Clock',
    description: 'Synced with your actual computer clock',
    hour: -1, // dynamic
    isWeekend: false,
    idealCategory: 'dynamic'
  },
  {
    label: 'Friday 9:00 PM',
    description: 'Weekend Movie Night Prime Time',
    hour: 21,
    isWeekend: true,
    idealCategory: 'weekend-epics'
  },
  {
    label: 'Tuesday 1:15 PM',
    description: 'Weekday Quick Lunch Break',
    hour: 13,
    isWeekend: false,
    idealCategory: 'fast-laughs'
  },
  {
    label: 'Wednesday 7:30 PM',
    description: 'Dinner & Unwind Routine',
    hour: 19,
    isWeekend: false,
    idealCategory: 'dinner-friendly'
  },
  {
    label: 'Sunday 11:45 PM',
    description: 'Late Night Wind-Down (No Stress)',
    hour: 23,
    isWeekend: false,
    idealCategory: '90min-brainoff'
  }
];

/**
 * Evaluates the time context and returns tailored category priority order
 */
export function evaluateTimeContext(simulatedHour?: number, forcedWeekend?: boolean): TimeContext {
  const now = new Date();
  const hour = simulatedHour !== undefined && simulatedHour >= 0 ? simulatedHour : now.getHours();
  const dayOfWeek = forcedWeekend !== undefined ? (forcedWeekend ? 5 : 2) : now.getDay();
  const isWeekend = forcedWeekend !== undefined ? forcedWeekend : (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6);

  // Late Night: 11 PM to 4:59 AM
  if (hour >= 23 || hour < 5) {
    return {
      currentTime: now,
      hour,
      dayOfWeek,
      isWeekend,
      timeSlotName: 'Late Night Chill',
      timeSlotBadge: '🌙 Late Night Mode',
      timeSlotDescription: 'Brisk 90-minute stress-free titles so you can sleep on time.',
      recommendedCategoryOrder: [
        '90min-brainoff',
        'continue-watching',
        'dinner-friendly',
        'fast-laughs',
        'household-top10',
        'shared-taste',
        'mind-benders',
        'weekend-epics'
      ]
    };
  }

  // Morning / Lunch: 11 AM to 3:59 PM (Weekday)
  if (!isWeekend && hour >= 11 && hour < 16) {
    return {
      currentTime: now,
      hour,
      dayOfWeek,
      isWeekend,
      timeSlotName: 'Midday Lunch Break',
      timeSlotBadge: '🍱 Lunchtime Quick Bites',
      timeSlotDescription: 'Brisk 20-30 minute episodes tailored for lunch and short breaks.',
      recommendedCategoryOrder: [
        'fast-laughs',
        'dinner-friendly',
        'continue-watching',
        '90min-brainoff',
        'household-top10',
        'shared-taste',
        'mind-benders',
        'weekend-epics'
      ]
    };
  }

  // Friday / Saturday Evening: 6 PM to 11 PM (Weekend Primetime)
  if (isWeekend && hour >= 17 && hour < 23) {
    return {
      currentTime: now,
      hour,
      dayOfWeek,
      isWeekend,
      timeSlotName: 'Weekend Cinema Prime',
      timeSlotBadge: '🍿 Prime Weekend Epics',
      timeSlotDescription: 'High-production 2+ hour cinema and immersive psychological thrillers.',
      recommendedCategoryOrder: [
        'weekend-epics',
        'household-top10',
        'shared-taste',
        'mind-benders',
        'continue-watching',
        '90min-brainoff',
        'dinner-friendly',
        'fast-laughs'
      ]
    };
  }

  // Weekday Evening Dinner: 5 PM to 9 PM
  if (!isWeekend && hour >= 17 && hour < 21) {
    return {
      currentTime: now,
      hour,
      dayOfWeek,
      isWeekend,
      timeSlotName: 'Dinner & Evening Unwind',
      timeSlotBadge: '🍽️ Dinner Hour Streaming',
      timeSlotDescription: 'Mouthwatering culinary series and engaging crowd-pleasers.',
      recommendedCategoryOrder: [
        'dinner-friendly',
        'household-top10',
        'continue-watching',
        'shared-taste',
        '90min-brainoff',
        'fast-laughs',
        'mind-benders',
        'weekend-epics'
      ]
    };
  }

  // General / Default
  return {
    currentTime: now,
    hour,
    dayOfWeek,
    isWeekend,
    timeSlotName: 'Evening Prime',
    timeSlotBadge: '✨ Evening Discovery',
    timeSlotDescription: 'Balanced recommendations calibrated for relaxation and high immersion.',
    recommendedCategoryOrder: [
      'household-top10',
      'continue-watching',
      'shared-taste',
      '90min-brainoff',
      'dinner-friendly',
      'mind-benders',
      'weekend-epics',
      'fast-laughs'
    ]
  };
}

