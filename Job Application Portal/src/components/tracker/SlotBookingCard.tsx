import React, { useState } from 'react';
import { Calendar, Clock, Video, CheckCircle2, ChevronRight, Globe } from 'lucide-react';
import { ScheduledInterview } from '../../types/index.ts';
import { scheduleInterviewSlot } from '../../utils/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface SlotBookingCardProps {
  applicationId: string;
  scheduledInterview?: ScheduledInterview;
  onSlotConfirmed: (interview: ScheduledInterview) => void;
}

export const SlotBookingCard: React.FC<SlotBookingCardProps> = ({
  applicationId,
  scheduledInterview,
  onSlotConfirmed
}) => {
  const { success, error } = useToast();
  const [selectedDay, setSelectedDay] = useState('Tue Oct 21');
  const [selectedTime, setSelectedTime] = useState<string | null>('10:00 AM');
  const [timezone, setTimezone] = useState('Pacific Time (US & Canada)');
  const [submitting, setSubmitting] = useState(false);

  const availableSlots: Record<string, string[]> = {
    'Tue Oct 21': ['10:00 AM', '02:30 PM', '04:15 PM'],
    'Wed Oct 22': ['11:00 AM', '01:30 PM', '04:00 PM'],
    'Thu Oct 23': ['09:30 AM', '11:15 AM', '03:00 PM']
  };

  const handleConfirm = async () => {
    if (!selectedTime) return;
    setSubmitting(true);
    try {
      const res = await scheduleInterviewSlot(applicationId, {
        date: selectedDay,
        timeSlot: selectedTime,
        timezone
      });
      success('Interview Slot Confirmed!', `${selectedDay} at ${selectedTime}. Calendar invite sent.`);
      onSlotConfirmed(res.scheduledInterview);
    } catch (err: any) {
      error('Failed to confirm slot', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // If already scheduled, render confirmed card
  if (scheduledInterview) {
    return (
      <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-6 animate-fade-in space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Technical Architecture Sync Confirmed</span>
          </div>
          <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
            Confirmed ✓
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <span className="text-slate-500 block">Date & Time</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {scheduledInterview.date} • {scheduledInterview.timeSlot}
              </span>
              <span className="text-[11px] text-slate-500 block">{scheduledInterview.timezone}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <span className="text-slate-500 block">Meeting Link</span>
              <a
                href={scheduledInterview.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                meet.atelier.io/session-tech-deepdive ↗
              </a>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-emerald-500/20">
          Interviewers: {scheduledInterview.interviewerNames?.join(', ')}. Need to reschedule? You can self-reschedule anytime up to 2 hours prior without awkward emails.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-indigo-500/30 bg-surface-elevated-light dark:bg-surface-elevated-dark p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
            <Calendar className="w-4 h-4" />
            <span>Action Required: Schedule Your 45-Minute Technical Sync</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pick a time that fits your schedule. No whiteboard trick questions—collaborative discussion only.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
          Instant Booking
        </span>
      </div>

      {/* Timezone picker */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <span>Timezone:</span>
        <select
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
          className="bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="Pacific Time (US & Canada)">Pacific Time (UTC-7)</option>
          <option value="Eastern Time (US & Canada)">Eastern Time (UTC-4)</option>
          <option value="Central European Time">Central European Time (UTC+2)</option>
          <option value="UTC">UTC (Universal)</option>
        </select>
      </div>

      {/* 3-Day Tab Selector */}
      <div className="flex gap-2 border-b border-divider-light dark:border-divider-dark pb-2">
        {Object.keys(availableSlots).map(day => (
          <button
            key={day}
            type="button"
            onClick={() => {
              setSelectedDay(day);
              setSelectedTime(availableSlots[day][0]);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedDay === day
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-surface-secondary-light dark:bg-surface-secondary-dark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Slot Pills Grid */}
      <div>
        <label className="block text-[11px] font-mono text-slate-500 mb-2">Available 45-minute slots:</label>
        <div className="flex flex-wrap gap-2">
          {availableSlots[selectedDay]?.map(time => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedTime(time)}
              className={`px-4 py-2 rounded-xl text-xs font-mono tabular-nums transition-all border ${
                selectedTime === time
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs scale-102'
                  : 'bg-surface-secondary-light dark:bg-surface-secondary-dark text-slate-700 dark:text-slate-300 border-divider-light dark:border-divider-dark hover:border-indigo-400'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Selected: <strong className="text-slate-800 dark:text-slate-200">{selectedDay} at {selectedTime}</strong>
        </span>

        <button
          type="button"
          disabled={!selectedTime || submitting}
          onClick={handleConfirm}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-98 disabled:opacity-50"
        >
          <span>{submitting ? 'Confirming...' : 'Confirm Interview Slot'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
