import React, { useState } from 'react';
import { Car, Plane, Users, Plus, Check, MessageCircle } from 'lucide-react';
import { RideShareMatch } from '../../types/editorial';
import { sounds } from '../../services/soundEffects';

interface TravelCoordinatorProps {
  initialRides: RideShareMatch[];
}

export const TravelCoordinator: React.FC<TravelCoordinatorProps> = ({
  initialRides,
}) => {
  const [rides, setRides] = useState<RideShareMatch[]>(initialRides);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [airport, setAirport] = useState<string>('Florence Peretola (FLR)');
  const [time, setTime] = useState<string>('Friday Sep 18 at 3:30 PM');
  const [flight, setFlight] = useState<string>('LH 410');
  const [seats, setSeats] = useState<number>(1);
  const [contact, setContact] = useState<string>('WhatsApp / SMS');
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  const handleConnect = (id: string) => {
    sounds.playMasteredSound();
    setConnectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handlePostRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newRide: RideShareMatch = {
      id: `ride-${Date.now()}`,
      guestName: guestName.trim(),
      arrivalAirport: airport,
      arrivalTime: time,
      flightNumber: flight,
      seatsNeeded: seats,
      contactHint: contact || 'WhatsApp message',
    };

    setRides([newRide, ...rides]);
    sounds.playMasteredSound();
    setIsModalOpen(false);
    setGuestName('');
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 font-bold block">
            AIRPORT & TRANSIT COORDINATOR
          </span>
          <h3 className="text-2xl font-serif text-stone-900 mt-1">Share a Ride / Split a Cab Matcher</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            Connect with other celebration guests arriving at Florence Peretola (FLR) or Pisa (PSA) within the same arrival window.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playCardSnap();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Your Flight Arrival</span>
        </button>
      </div>

      {/* Ride-Share Matcher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rides.map((r) => {
          const isConnected = connectedIds.includes(r.id);
          return (
            <div
              key={r.id}
              className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                  <span className="flex items-center gap-1 text-amber-700 font-bold">
                    <Plane className="w-3.5 h-3.5" /> {r.flightNumber}
                  </span>
                  <span>{r.seatsNeeded} seat(s)</span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 mt-2 font-serif">{r.guestName}</h4>

                <div className="mt-2 space-y-1 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Car className="w-3.5 h-3.5 text-stone-400" />
                    <span>{r.arrivalAirport}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">{r.arrivalTime}</div>
                </div>

                <div className="mt-3 text-[11px] text-stone-500 bg-stone-50 p-2 rounded-xl border border-stone-100">
                  {r.contactHint}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-mono font-bold">
                  ✓ Window Matched
                </span>

                <button
                  onClick={() => handleConnect(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-900 hover:bg-black text-white shadow-2xs'
                  }`}
                >
                  {isConnected ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <MessageCircle className="w-3.5 h-3.5" />}
                  <span>{isConnected ? 'Connected' : 'Split Cab'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Flight Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif">Post Your Arrival & Airport Window</h3>

            <form onSubmit={handlePostRide} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Liam Baker"
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Arrival Airport</label>
                <select
                  value={airport}
                  onChange={(e) => setAirport(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 text-stone-800"
                >
                  <option value="Florence Peretola (FLR)">Florence Peretola (FLR)</option>
                  <option value="Pisa Galileo Galilei (PSA)">Pisa Galileo Galilei (PSA)</option>
                  <option value="Rome Fiumicino (FCO) Shuttle">Rome Fiumicino (FCO) Shuttle</option>
                  <option value="JFK International (NYC)">JFK International (NYC)</option>
                  <option value="Newark Liberty (EWR)">Newark Liberty (EWR)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Arrival Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Friday 3:30 PM"
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Flight Number</label>
                  <input
                    type="text"
                    value={flight}
                    onChange={(e) => setFlight(e.target.value)}
                    placeholder="e.g. AF 1064"
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 text-stone-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Post Arrival Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

