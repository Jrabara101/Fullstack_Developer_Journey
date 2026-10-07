export type TemperatureUnit = 'C' | 'F';

export function formatTemp(tempC: number, unit: TemperatureUnit): string {
  if (unit === 'F') {
    const f = (tempC * 9) / 5 + 32;
    return `${Math.round(f)}°`;
  }
  return `${Math.round(tempC)}°`;
}

export function formatTempExact(tempC: number, unit: TemperatureUnit): string {
  if (unit === 'F') {
    const f = (tempC * 9) / 5 + 32;
    return `${f.toFixed(1)}°F`;
  }
  return `${tempC.toFixed(1)}°C`;
}

export function formatWind(kmh: number, unit: 'kmh' | 'mph' = 'kmh'): string {
  if (unit === 'mph') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}
