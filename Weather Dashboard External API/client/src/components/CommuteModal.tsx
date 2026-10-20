import React, { useState, useEffect } from 'react';
import { X, Car, Clock, AlertTriangle, CheckCircle, Navigation, ArrowRight, ShieldCheck } from 'lucide-react';
import { CommuteRoute, CommuteForecastResult } from '../types/weather';
import { TemperatureUnit, formatTemp } from '../utils/weatherFormatters';

interface CommuteModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: TemperatureUnit;
}

export const CommuteModal: React.FC<CommuteModalProps> = ({ isOpen, onClose, unit }) => {
  const [routes, setRoutes] = useState<CommuteRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<CommuteRoute | null>(null);
  const [departureTime, setDepartureTime] = useState<string>('08:30');
  const [inspectionResult, setInspectionResult] = useState<CommuteForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Custom route fields
  const [customOrigin, setCustomOrigin] = useState('Brooklyn Heights');
  const [customOriginLat, setCustomOriginLat] = useState('40.6958');
  const [customOriginLon, setCustomOriginLon] = useState('-73.9936');
  const [customDest, setCustomDest] = useState('Midtown Manhattan');
  const [customDestLat, setCustomDestLat] = useState('40.7589');
  const [customDestLon, setCustomDestLon] = useState('-73.9851');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/commute')
        .then((r) => r.json())
        .then((data: CommuteRoute[]) => {
          setRoutes(data);
          if (data.length > 0) {
            setSelectedRoute(data[0]);
            setDepartureTime(data[0].departureTime);
            runInspection(data[0], data[0].departureTime);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const runInspection = async (routeToInspect: CommuteRoute, timeStr: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/commute/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: routeToInspect,
          departureTime: timeStr,
        }),
      });
      if (res.ok) {
        const result: CommuteForecastResult = await res.json();
        setInspectionResult(result);
      }
    } catch (err) {
      console.error('Inspection failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteSelect = (r: CommuteRoute) => {
    setSelectedRoute(r);
    setDepartureTime(r.departureTime);
    runInspection(r, r.departureTime);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const routeObj: CommuteRoute = {
      id: `custom-${Date.now()}`,
      name: `${customOrigin} to ${customDest}`,
      originName: customOrigin,
      originLat: parseFloat(customOriginLat) || 40.7128,
      originLon: parseFloat(customOriginLon) || -74.006,
      destName: customDest,
      destLat: parseFloat(customDestLat) || 40.7589,
      destLon: parseFloat(customDestLon) || -73.9851,
      departureTime,
      alertEnabled: true,
    };
    setSelectedRoute(routeObj);
    runInspection(routeObj, departureTime);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-weather-amber/20 text-weather-amber">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Commute & Route Weather Sentinel
            </h2>
            <p className="text-xs text-white/60">
              Dual-point point-to-point forecast module with travel friction scores & road traction alerts.
            </p>
          </div>
        </div>

        {/* Quick Saved Routes Pills */}
        <div className="mb-5">
          <label className="text-xs font-mono uppercase text-white/50 block mb-2">
            Preset Commute Corridors
          </label>
          <div className="flex flex-wrap gap-2">
            {routes.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRouteSelect(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  selectedRoute?.id === r.id
                    ? 'bg-weather-cyan/20 border-weather-cyan text-weather-cyan font-semibold shadow-md'
                    : 'bg-white/[0.05] border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                {r.name} ({r.departureTime})
              </button>
            ))}
          </div>
        </div>

        {/* Departure Time & Route Selector */}
        <form onSubmit={handleCustomSubmit} className="space-y-4 mb-6 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-white/50 block mb-1">Origin Point</label>
              <input
                type="text"
                value={customOrigin}
                onChange={(e) => setCustomOrigin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.08] border border-white/15 text-white text-xs focus:outline-none focus:border-weather-cyan"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-white/50 block mb-1">Destination Point</label>
              <input
                type="text"
                value={customDest}
                onChange={(e) => setCustomDest(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.08] border border-white/15 text-white text-xs focus:outline-none focus:border-weather-cyan"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-weather-gold" />
              <label className="text-xs font-mono text-white/70">Scheduled Departure:</label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => {
                  setDepartureTime(e.target.value);
                  if (selectedRoute) {
                    runInspection(selectedRoute, e.target.value);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 rounded-xl bg-weather-cyan hover:bg-weather-azure text-black font-semibold text-xs transition-all shadow-md"
            >
              {isLoading ? 'Analyzing...' : 'Calculate Friction'}
            </button>
          </div>
        </form>

        {/* Inspection Results */}
        {inspectionResult && (
          <div className="space-y-4 animate-fade-in">
            {/* Trip Risk Score Badge from Stitch.md */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                inspectionResult.frictionScore === 'Severe Weather Friction'
                  ? 'bg-weather-crimson/20 border-weather-crimson/40 text-weather-crimson'
                  : inspectionResult.frictionScore === 'Moderate Delay Risk'
                  ? 'bg-weather-amber/20 border-weather-amber/40 text-weather-amber'
                  : 'bg-weather-emerald/20 border-weather-emerald/40 text-weather-emerald'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <div className="font-bold text-sm font-mono tracking-tight">
                    {inspectionResult.frictionScore}
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">{inspectionResult.advisoryText}</p>
                </div>
              </div>

              {inspectionResult.recommendedCushionMinutes > 0 && (
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
                    +{inspectionResult.recommendedCushionMinutes}m Cushion
                  </span>
                </div>
              )}
            </div>

            {/* Dual Point Origin & Destination Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Origin Weather */}
              <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-white/40 uppercase">Departure Weather</span>
                  <span className="text-[11px] font-mono text-weather-cyan">
                    {inspectionResult.departureTime}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  {inspectionResult.route.originName}
                </h4>
                <div className="text-sm text-white/80">
                  {inspectionResult.originWeather.conditionText} •{' '}
                  <span className="font-mono font-semibold">
                    {formatTemp(inspectionResult.originWeather.tempC, unit)}
                  </span>
                </div>
                <div className="mt-2 text-xs font-mono text-white/60">
                  Road Condition:{' '}
                  <span className="text-white font-medium">
                    {inspectionResult.originWeather.roadCondition}
                  </span>{' '}
                  • {inspectionResult.originWeather.rainProb}% Rain Prob
                </div>
              </div>

              {/* Destination Weather */}
              <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-white/40 uppercase">Arrival Weather</span>
                  <span className="text-[11px] font-mono text-weather-gold">Estimated Arrival</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  {inspectionResult.route.destName}
                </h4>
                <div className="text-sm text-white/80">
                  {inspectionResult.destWeather.conditionText} •{' '}
                  <span className="font-mono font-semibold">
                    {formatTemp(inspectionResult.destWeather.tempC, unit)}
                  </span>
                </div>
                <div className="mt-2 text-xs font-mono text-white/60">
                  Road Condition:{' '}
                  <span className="text-white font-medium">
                    {inspectionResult.destWeather.roadCondition}
                  </span>{' '}
                  • {inspectionResult.destWeather.rainProb}% Rain Prob
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
