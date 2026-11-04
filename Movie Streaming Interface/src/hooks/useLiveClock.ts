import { useState, useEffect } from 'react';

/**
 * Hook to provide a synchronized clock that ticks every 30 seconds
 * and supports simulated hour overrides for demonstration.
 */
export function useLiveClock(simulatedHour?: number, forcedWeekend?: boolean) {
  const [clock, setClock] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(timer);
  }, []);

  // Compute active date: if simulatedHour is set, override the hour on today's date
  const effectiveDate = new Date(clock);
  if (simulatedHour !== undefined && simulatedHour >= 0) {
    effectiveDate.setHours(simulatedHour, 15, 0, 0);
  }

  return {
    clock: effectiveDate,
    rawSystemClock: clock,
    isSimulated: simulatedHour !== undefined && simulatedHour >= 0,
    forcedWeekend
  };
}

