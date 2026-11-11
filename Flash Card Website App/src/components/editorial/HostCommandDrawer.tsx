import React, { useState } from 'react';
import {
  Shield,
  Download,
  Megaphone,
  Users,
  Utensils,
  Lock,
  Unlock,
  CheckCircle,
  X,
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface HostCommandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  broadcastMessage: string | null;
  onSetBroadcastMessage: (msg: string | null) => void;
}

export const HostCommandDrawer: React.FC<HostCommandDrawerProps> = ({
  isOpen,
  onClose,
  broadcastMessage,
  onSetBroadcastMessage,
}) => {
  const [password, setPassword] = useState<string>('host2026');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState<string>(
    'Reminder: Complimentary shuttles depart Florence Santa Maria Novella at 3:15 PM.'
  );

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'host2026') {
      setIsAuthenticated(true);
      setAuthError(null);
      sounds.playMasteredSound();
    } else {
      setAuthError('Incorrect host password. Hint: host2026');
      sounds.playCardSnap();
    }
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    onSetBroadcastMessage(newAnnouncement.trim());
    sounds.playMasteredSound();
  };

  const handleClearAnnouncement = () => {
    onSetBroadcastMessage(null);
    sounds.playCardSnap();
  };

  const downloadCsvManifest = () => {
    const csvContent = `Guest Name,Party Code,Attending,Dietary,Table Assigned,Seat Number
Elena Vance,vance-crew,Yes,None,Table 1: Family & Honor,Seat 1
Julian Sterling,vance-crew,Yes,None,Table 1: Family & Honor,Seat 2
Dr. Marcus Vance,vance-crew,Yes,None,Table 1: Family & Honor,Seat 3
Sarah Smith,smith-family,Yes,Vegetarian,Table 4: Cypress Grove,Seat 1
Michael Smith,smith-family,Yes,None,Table 4: Cypress Grove,Seat 2
Lucas Smith,smith-family,Yes,Kids Meal,Table 4: Cypress Grove,Seat 3
Alex Chen,alex-chen,Yes,Halal,Table 2: Brunello Reserve,Seat 5
Chloe Dubois,alex-chen,Yes,Vegan,Table 2: Brunello Reserve,Seat 6
David Thorne,smith-family,Yes,None,Table 4: Cypress Grove,Seat 4
Aria Montgomery,smith-family,Yes,Gluten-Free,Table 4: Cypress Grove,Seat 5`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'guest_manifest_seating.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sounds.playMasteredSound();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-stone-200 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-slide-left">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif">Host Command Center</h3>
                <span className="text-[10px] font-mono text-stone-500 uppercase">
                  Protected Coordinator Console
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isAuthenticated ? (
            /* PIN / Password Auth Form */
            <div className="py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-stone-900">Enter Host Password</h4>
                <p className="text-xs text-stone-500 mt-1">Default Demo PIN: host2026</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 max-w-xs mx-auto">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PIN: host2026"
                  className="w-full px-3 py-2 text-xs text-center font-mono bg-stone-50 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {authError && <div className="text-xs text-rose-600 text-center">{authError}</div>}
                <button
                  type="submit"
                  className="w-full py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Unlock Command Center
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Host Dashboard */
            <div className="py-6 space-y-6">
              {/* Headcount Breakdown Row */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-mono flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  Live Headcount Breakdown
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80">
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-800">
                      Confirmed Attending
                    </span>
                    <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-0.5">68</div>
                    <span className="text-[10px] text-emerald-600">85% of invited capacity</span>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200/80">
                    <span className="text-[10px] uppercase font-mono font-bold text-rose-800">
                      Declined / Pending
                    </span>
                    <div className="text-2xl font-extrabold text-rose-700 font-mono mt-0.5">16</div>
                    <span className="text-[10px] text-rose-600">4 declined, 12 pending</span>
                  </div>
                </div>
              </div>

              {/* Meal & Dietary Tallies */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-mono flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  Catering & Dietary Requirements
                </span>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-700 font-medium">
                    <span>Standard Tuscan Tasting</span>
                    <span className="font-mono font-bold">42 meals</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-700 font-medium">
                    <span>Vegetarian Harvest</span>
                    <span className="font-mono font-bold text-amber-700">14 meals</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-700 font-medium">
                    <span>Vegan Plant-Based</span>
                    <span className="font-mono font-bold text-emerald-700">8 meals</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-700 font-medium">
                    <span>Gluten-Free & Allergies</span>
                    <span className="font-mono font-bold text-rose-700">6 meals</span>
                  </div>
                </div>
              </div>

              {/* Broadcast Announcement Creator */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Megaphone className="w-4 h-4 text-amber-700" />
                    <span>Broadcast Live Announcement</span>
                  </div>
                  {broadcastMessage && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.2 rounded-full">
                      ACTIVE ON PORTAL
                    </span>
                  )}
                </div>

                <form onSubmit={handlePublishAnnouncement} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="Broadcast last-minute venue or shuttle updates..."
                    className="w-full p-2.5 text-xs bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
                  />
                  <div className="flex items-center justify-between gap-2">
                    {broadcastMessage ? (
                      <button
                        type="button"
                        onClick={handleClearAnnouncement}
                        className="text-xs text-rose-600 hover:text-rose-800 cursor-pointer font-medium"
                      >
                        Dismiss Banner
                      </button>
                    ) : <span />}

                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                    >
                      Publish Banner
                    </button>
                  </div>
                </form>
              </div>

              {/* Export Seating CSV */}
              <div className="pt-2">
                <button
                  onClick={downloadCsvManifest}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Guest Seating & RSVP Manifest (CSV)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-400 font-mono text-center">
          Encrypted Host Gateway • Antigravity Bespoke Suite
        </div>
      </div>
    </div>
  );
};

