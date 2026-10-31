import React, { useState } from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import {
  X,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building,
  User,
  Mail,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EnterpriseBookerModal: React.FC = () => {
  const { isEnterpriseModalOpen, setIsEnterpriseModalOpen, incrementSandboxAction } =
    useMarketingStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('Tomorrow, 10:00 AM EST');
  const [isBooked, setIsBooked] = useState(false);

  if (!isEnterpriseModalOpen) return null;

  const slots = [
    'Tomorrow, 10:00 AM EST',
    'Tomorrow, 2:30 PM EST',
    'Thursday, 11:00 AM EST',
    'Thursday, 4:00 PM EST',
    'Friday, 1:00 PM EST'
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    incrementSandboxAction();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0D111C] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={() => {
            setIsEnterpriseModalOpen(false);
            setIsBooked(false);
          }}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isBooked ? (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium mb-2">
                <Calendar className="w-3.5 h-3.5" /> 1-on-1 Architecture Deep-Dive
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Schedule Instant Architecture Review
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Meet with a Principal Distributed Systems Architect to review your migration roadmap, security perimeter, and custom SLA.
              </p>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Company Legal Name & Team Size</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="VektorDB (45 engineers)"
                  className="w-full bg-[#06080F] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Select 30-min Zoom Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 rounded-lg text-xs font-mono text-left border transition-all ${
                        selectedSlot === slot
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                          : 'bg-[#06080F] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Compliance Tray */}
              <div className="pt-3 border-t border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Guaranteed Compliance Standards:
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                  <div className="p-1.5 rounded bg-white/5 border border-white/5 text-emerald-400">
                    SOC2 Type II
                  </div>
                  <div className="p-1.5 rounded bg-white/5 border border-white/5 text-emerald-400">
                    ISO 27001
                  </div>
                  <div className="p-1.5 rounded bg-white/5 border border-white/5 text-cyan-400">
                    HIPAA Ready
                  </div>
                  <div className="p-1.5 rounded bg-white/5 border border-white/5 text-indigo-300">
                    99.999% SLA
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-4"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm Architecture Review Slot</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Architecture Review Confirmed!</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              A calendar invite and private Zoom war-room link has been sent to{' '}
              <span className="text-indigo-300 font-semibold">{email || 'your email'}</span> for{' '}
              <span className="text-white font-semibold">{selectedSlot}</span>.
            </p>
            <button
              onClick={() => {
                setIsEnterpriseModalOpen(false);
                setIsBooked(false);
              }}
              className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors mt-2"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
