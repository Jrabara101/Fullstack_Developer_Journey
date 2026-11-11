import React from 'react';
import { Users, Link as LinkIcon, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { GuestParty } from '../../types/editorial';
import { sounds } from '../../services/soundEffects';

interface MagicLinkInviteProps {
  currentParty: GuestParty;
  onSelectParty: (code: string) => void;
  availableParties: Record<string, GuestParty>;
  onOpenRsvp: () => void;
}

export const MagicLinkInvite: React.FC<MagicLinkInviteProps> = ({
  currentParty,
  onSelectParty,
  availableParties,
  onOpenRsvp,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Magic Link Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 border border-amber-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full">
                Personalized Magic Link
              </span>
              <span className="text-xs font-mono text-stone-500">?invite={currentParty.inviteCode}</span>
            </div>
            <h4 className="text-sm font-bold text-stone-900 mt-0.5">
              Welcome, {currentParty.primaryGuest}
            </h4>
          </div>
        </div>

        {/* Demo Household Switcher Pill */}
        <div className="flex items-center gap-2 self-start md:self-auto text-xs">
          <span className="text-stone-500 font-medium hidden sm:inline">Test Magic Link:</span>
          <select
            value={currentParty.inviteCode}
            onChange={(e) => {
              sounds.playCardSnap();
              onSelectParty(e.target.value);
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
          >
            {Object.values(availableParties).map((party) => (
              <option key={party.inviteCode} value={party.inviteCode}>
                {party.primaryGuest} ({party.inviteCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Household & Sub-Events Privileges Card */}
      <div className="mt-4 p-6 rounded-3xl bg-white border border-stone-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Household Members */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-stone-400">
            Household Members
          </span>
          <div className="space-y-1.5">
            {currentParty.householdMembers.map((member, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-medium text-stone-800">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{member}</span>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-stone-500 font-mono pt-1">
            + {currentParty.allowedPlusOnes} Allowed Guest (+1)
          </div>
        </div>

        {/* Permitted Sub-Events */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-stone-400">
            Invited Sub-Events
          </span>
          <div className="space-y-1.5">
            {currentParty.subEventsAllowed.map((sub, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 mr-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                {sub}
              </span>
            ))}
          </div>
        </div>

        {/* Assigned Seating & Fast RSVP */}
        <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-stone-400">
              Reserved Seating
            </span>
            <div className="text-xs font-bold text-stone-900 mt-1">
              {currentParty.tableAssigned || 'Stage Pass: General'}
            </div>
            <div className="text-[11px] text-stone-500 font-mono">
              {currentParty.seatNumber || currentParty.conferenceTrack}
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playCardFlip();
              onOpenRsvp();
            }}
            className="mt-4 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer text-center"
          >
            Manage Your Party's RSVP
          </button>
        </div>
      </div>
    </div>
  );
};

