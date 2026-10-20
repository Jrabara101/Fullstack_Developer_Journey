import React, { useState, useEffect } from 'react';
import {
  Clock, Globe, Moon, Sun, Monitor, BellOff, Calendar,
  Check, Sparkles, MapPin, Eye, Sliders, Shield
} from 'lucide-react';

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
  'Asia/Singapore', 'Asia/Dubai', 'Asia/Shanghai', 'Australia/Sydney', 'UTC'
];

export function PreferencesConsole({
  preferences = {},
  quietHours = {},
  themePreference = 'dark',
  densityPreference = 'cozy',
  onChange,
  onQuietHoursChange,
  onThemeChange,
  onDensityChange
}) {
  const [searchTz, setSearchTz] = useState('');
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('');

  const timezone = preferences.timezone || 'America/New_York';
  const timeFormat = preferences.time_format || '24h';
  const weekStart = preferences.week_start || 'monday';
  const numberSeparator = preferences.number_separator || 'comma';
  const isQuietEnabled = quietHours.enabled !== false;
  const quietStart = quietHours.start || '22:00';
  const quietEnd = quietHours.end || '07:30';

  // Live formatted time preview
  useEffect(() => {
    function updateTime() {
      try {
        const now = new Date();
        const dateOptions = {
          timeZone: timezone,
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        };
        const timeOptions = {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: timeFormat === '12h'
        };

        const dateStr = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
        const timeStr = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
        setCurrentTimeFormatted(`${dateStr} • ${timeStr} (${timeFormat} clock)`);
      } catch (e) {
        setCurrentTimeFormatted('Invalid timezone');
      }
    }

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone, timeFormat]);

  const filteredTimezones = TIMEZONES.filter(tz =>
    tz.toLowerCase().includes(searchTz.toLowerCase())
  );

  const handleAutoDetectTimezone = () => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      onChange('timezone', detected);
    } catch (e) {
      onChange('timezone', 'America/New_York');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Timezone & Regional Context Card */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] p-6 shadow-sm space-y-5">
        <div className="border-b border-border-light/60 dark:border-border-dark/60 pb-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Temporal Ergonomics & Regional Locales</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Configure calendar conventions, local time standards, and numerical delimiters.
          </p>
        </div>

        {/* Live System Preview Badge */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#181B22] border border-border-light dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4 animate-spin-slow" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Live Regional Preview
              </p>
              <p className="text-xs font-mono font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                {currentTimeFormatted}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoDetectTimezone}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>Auto-detect timezone</span>
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Timezone Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Active Timezone
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Filter timezones..."
                value={searchTz}
                onChange={(e) => setSearchTz(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-[#181B22] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={timezone}
                onChange={(e) => onChange('timezone', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#181B22] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              >
                {filteredTimezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 12h vs 24h Clock */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Clock Display Format
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => onChange('time_format', '12h')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                  timeFormat === '12h'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                12-Hour (02:30 PM)
              </button>
              <button
                type="button"
                onClick={() => onChange('time_format', '24h')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                  timeFormat === '24h'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                24-Hour (14:30)
              </button>
            </div>
          </div>

          {/* First day of week */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              First Day of the Week
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChange('week_start', 'monday')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                  weekStart === 'monday'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Monday (ISO 8601)
              </button>
              <button
                type="button"
                onClick={() => onChange('week_start', 'sunday')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                  weekStart === 'sunday'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Sunday (Standard)
              </button>
            </div>
          </div>

          {/* Number Separator */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Number & Currency Delimiter
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChange('number_separator', 'comma')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center font-mono ${
                  numberSeparator === 'comma'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                1,234,567.89
              </button>
              <button
                type="button"
                onClick={() => onChange('number_separator', 'period')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center font-mono ${
                  numberSeparator === 'period'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                1.234.567,89
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Smart Notification Horizon (Quiet Hours / Do Not Disturb) */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border-light/60 dark:border-border-dark/60 pb-3">
          <div className="flex items-center gap-2">
            <BellOff className="w-4 h-4 text-purple-500" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Smart Notification Horizon (Quiet Hours)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Automatically silences email digests and mobile push alerts during your sleep window.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isQuietEnabled}
              onChange={(e) => onQuietHoursChange({ ...quietHours, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {isQuietEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sleep Start (Quiet Ingress)
              </label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => onQuietHoursChange({ ...quietHours, start: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#181B22] text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Wakeup End (Alert Egress)
              </label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => onQuietHoursChange({ ...quietHours, end: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#181B22] text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <Moon className="w-4 h-4 flex-shrink-0" />
          <span>
            {isQuietEnabled
              ? `Currently anchoring notifications to ${timezone}. All non-critical pings paused between ${quietStart} and ${quietEnd}.`
              : 'Quiet hours disabled. You will receive notifications around the clock.'}
          </span>
        </div>
      </div>

      {/* 3. Theme & UI Density Settings */}
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] p-6 shadow-sm space-y-5">
        <div className="border-b border-border-light/60 dark:border-border-dark/60 pb-3">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <span>Aesthetics, Theme Automation & Canvas Density</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Personalize surface luminosity, dark mode transitions, and layout padding scales.
          </p>
        </div>

        {/* 3 Visual Theme Cards with Illustrated Mini-Wireframes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Luminosity Theme Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Light Mode */}
            <button
              type="button"
              onClick={() => onThemeChange('light')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                themePreference === 'light'
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Illustrated Mini-Wireframe */}
              <div className="w-full h-16 rounded-lg bg-white border border-slate-200 p-2 space-y-1.5 shadow-sm overflow-hidden mb-3">
                <div className="h-2 w-12 bg-slate-300 rounded"></div>
                <div className="h-1.5 w-full bg-slate-100 rounded"></div>
                <div className="h-1.5 w-3/4 bg-slate-100 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light Mode</span>
                </span>
                {themePreference === 'light' && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            </button>

            {/* Dark Mode */}
            <button
              type="button"
              onClick={() => onThemeChange('dark')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                themePreference === 'dark'
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Illustrated Mini-Wireframe */}
              <div className="w-full h-16 rounded-lg bg-[#0A0B0E] border border-slate-800 p-2 space-y-1.5 shadow-sm overflow-hidden mb-3">
                <div className="h-2 w-12 bg-slate-700 rounded"></div>
                <div className="h-1.5 w-full bg-slate-800 rounded"></div>
                <div className="h-1.5 w-3/4 bg-slate-800 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Obsidian Dark</span>
                </span>
                {themePreference === 'dark' && <Check className="w-4 h-4 text-blue-400" />}
              </div>
            </button>

            {/* Sync with System */}
            <button
              type="button"
              onClick={() => onThemeChange('system')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                themePreference === 'system'
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Illustrated Mini-Wireframe (Half Light Half Dark) */}
              <div className="w-full h-16 rounded-lg bg-gradient-to-r from-white to-[#0A0B0E] border border-slate-300 dark:border-slate-700 p-2 space-y-1.5 shadow-sm overflow-hidden mb-3">
                <div className="h-2 w-12 bg-slate-500 rounded"></div>
                <div className="h-1.5 w-full bg-slate-400/50 rounded"></div>
                <div className="h-1.5 w-3/4 bg-slate-400/50 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-purple-400" />
                  <span>Sunset Scheduled</span>
                </span>
                {themePreference === 'system' && <Check className="w-4 h-4 text-blue-500" />}
              </div>
            </button>
          </div>
        </div>

        {/* UI Density Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Canvas Density Scale
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'compact', label: 'Compact', desc: 'Tight margins & data tables' },
              { id: 'cozy', label: 'Cozy (Default)', desc: 'Balanced ergonomic spacing' },
              { id: 'spacious', label: 'Spacious', desc: 'Generous tap targets & breathing room' }
            ].map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => onDensityChange(d.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  densityPreference === d.id
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-semibold">{d.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
