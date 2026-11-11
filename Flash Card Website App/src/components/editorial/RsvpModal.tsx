import React, { useState } from 'react';
import { Check, X, Users, Utensils, Plane, Car, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GuestParty, GuestRsvpData } from '../../types/editorial';
import { sounds } from '../../services/soundEffects';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: GuestParty;
  onSaveRsvp: (data: GuestRsvpData) => void;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Nut Allergy',
  'Halal',
  'Kosher',
  'Dairy-Free',
  'None / No Restrictions',
];

export const RsvpModal: React.FC<RsvpModalProps> = ({
  isOpen,
  onClose,
  party,
  onSaveRsvp,
}) => {
  const [isAttending, setIsAttending] = useState<boolean>(true);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(party.householdMembers);
  const [dietary, setDietary] = useState<string[]>([]);
  const [dietaryNotes, setDietaryNotes] = useState<string>('');
  const [travelWindow, setTravelWindow] = useState<string>('Friday Sep 18, Afternoon');
  const [flightNumber, setFlightNumber] = useState<string>('');
  const [optInRideShare, setOptInRideShare] = useState<boolean>(true);
  const [contactPhone, setContactPhone] = useState<string>('');

  if (!isOpen) return null;

  const toggleDietary = (opt: string) => {
    sounds.playCardSnap();
    if (opt === 'None / No Restrictions') {
      setDietary(['None / No Restrictions']);
      return;
    }
    setDietary((prev) =>
      prev.includes(opt) ? prev.filter((d) => d !== opt) : [...prev.filter((d) => d !== 'None / No Restrictions'), opt]
    );
  };

  const toggleMember = (name: string) => {
    sounds.playCardSnap();
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rsvpData: GuestRsvpData = {
      inviteCode: party.inviteCode,
      isAttending,
      guestsCount: isAttending ? selectedMembers.length : 0,
      guestNames: isAttending ? selectedMembers : [],
      dietaryRequirements: dietary,
      dietaryNotes,
      travelArrivalWindow: travelWindow,
      hotelOrFlightInfo: flightNumber,
      optInRideShare,
      phoneOrContact: contactPhone,
      submittedAt: Date.now(),
    };

    onSaveRsvp(rsvpData);
    sounds.playCompletionFanfare();
    confetti({ particleCount: 80, spread: 80 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-amber-700 tracking-wider">
              RSVP RESPONSE PORTAL
            </span>
            <h3 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
              RSVP for {party.primaryGuest}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attending Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700">Will you be attending?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAttending(true);
                  sounds.playCardSnap();
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAttending
                    ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Joyfully Accepts</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAttending(false);
                  sounds.playCardSnap();
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !isAttending
                    ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs ring-2 ring-rose-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <X className="w-4 h-4 text-rose-500" />
                <span>Regretfully Declines</span>
              </button>
            </div>
          </div>

          {isAttending && (
            <>
              {/* Household Member Checkboxes */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Select Attending Household Members:
                </label>
                <div className="space-y-2">
                  {party.householdMembers.map((member) => (
                    <label
                      key={member}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member)}
                        onChange={() => toggleMember(member)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span className="font-medium text-stone-800">{member}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Requirements Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Dietary Preferences & Allergies:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleDietary(opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        dietary.includes(opt)
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-semibold'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ride-Share & Travel Coordinator */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Car className="w-4 h-4 text-amber-700" />
                  <span>Airport Ride-Share & Cab Split Matching</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Expected Arrival Window
                    </label>
                    <input
                      type="text"
                      value={travelWindow}
                      onChange={(e) => setTravelWindow(e.target.value)}
                      placeholder="e.g. Friday 3:00 PM"
                      className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-amber-300 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Flight / Airport (Optional)
                    </label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder="e.g. Florence FLR #AF1064"
                      className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-amber-300 text-stone-800"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 pt-1">
                  <input
                    type="checkbox"
                    checked={optInRideShare}
                    onChange={(e) => setOptInRideShare(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Opt-in to be paired with guests arriving at the same airport window</span>
                </label>
              </div>
            </>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold bg-stone-900 hover:bg-black text-white rounded-xl shadow-md cursor-pointer active:scale-95"
            >
              Submit RSVP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

