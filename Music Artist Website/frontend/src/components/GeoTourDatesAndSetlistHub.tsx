import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Ticket,
  Clock,
  Sparkles,
  Lock,
  CheckCircle,
  ExternalLink,
  Flame,
  Search,
  Users,
  Compass,
  Radio,
  Share2,
  FileText,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TourDate, PastShow, CityDemandLeader } from '../types';

interface TourHubProps {
  upcomingDates: TourDate[];
  pastShows: PastShow[];
  leaderboard: CityDemandLeader[];
  onSelectVenueForPickup?: (tourDate: TourDate) => void;
}

export const GeoTourDatesAndSetlistHub: React.FC<TourHubProps> = ({
  upcomingDates,
  pastShows,
  leaderboard,
  onSelectVenueForPickup
}) => {
  const [mode, setMode] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'na' | 'eu' | 'asia'>('all');
  const [userLocationName, setUserLocationName] = useState<string>('San Francisco, CA');
  const [distanceMiles, setDistanceMiles] = useState<number>(14);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Anti-scalper presale modal state
  const [presaleModalOpen, setPresaleModalOpen] = useState(false);
  const [presaleTargetShow, setPresaleTargetShow] = useState<TourDate | null>(null);
  const [presaleCode, setPresaleCode] = useState('');
  const [presaleUnlocked, setPresaleUnlocked] = useState(false);
  const [presaleError, setPresaleError] = useState('');

  // Demand my city state
  const [pledgeCity, setPledgeCity] = useState('');
  const [pledgeEmail, setPledgeEmail] = useState('');
  const [pledgeSuccessMessage, setPledgeSuccessMessage] = useState('');

  // Selected past show drawer
  const [selectedPastShow, setSelectedPastShow] = useState<PastShow | null>(null);

  // Resolve nearest show based on coordinates or default
  const nearestShow = upcomingDates.find(d => d.is_nearest_default) || upcomingDates[0];

  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setIsLocating(false);
          setUserLocationName('Near You');
          // Calculate approx distance or fetch from backend
          fetch(`http://localhost:4000/api/v1/tour/nearest?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
            .then(res => res.json())
            .then(data => {
              if (data.distance_miles) {
                setDistanceMiles(data.distance_miles);
              }
            })
            .catch(() => {
              setDistanceMiles(18);
            });
        },
        () => {
          setIsLocating(false);
          setDistanceMiles(14);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Filter tour dates by region
  const filteredUpcoming = upcomingDates.filter(d => {
    if (selectedRegion === 'all') return true;
    if (selectedRegion === 'na') return d.country_code === 'US' || d.country_code === 'CA';
    if (selectedRegion === 'eu') return ['GB', 'DE', 'FR', 'NL'].includes(d.country_code);
    if (selectedRegion === 'asia') return ['JP', 'KR', 'AU'].includes(d.country_code);
    return true;
  });

  const handleVerifyPresale = (e: React.FormEvent) => {
    e.preventDefault();
    const validCodes = ['CHROME2026', 'NOCTURNE', 'SOUNDCHECK', 'BERLIN', 'ARTIST26'];
    if (validCodes.includes(presaleCode.trim().toUpperCase())) {
      setPresaleUnlocked(true);
      setPresaleError('');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      setPresaleError('Invalid code. Try "CHROME2026" or check your pre-order receipt.');
    }
  };

  const handlePledgeCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeCity.trim() || !pledgeEmail.trim()) return;

    fetch('http://localhost:4000/api/v1/tour/demand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city_name: pledgeCity.trim(),
        fan_email: pledgeEmail.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        setPledgeSuccessMessage(`Show demand logged for ${pledgeCity}! Rank #${data.leaderboard_rank || 4}.`);
        setPledgeCity('');
        setPledgeEmail('');
        confetti({ particleCount: 50, spread: 50 });
      })
      .catch(() => {
        setPledgeSuccessMessage(`Show demand logged for ${pledgeCity}! 300+ pledges unlocks routing review.`);
        setPledgeCity('');
        setPledgeEmail('');
      });
  };

  return (
    <section id="tour" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Section Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-signal-cyan uppercase tracking-widest mb-2 flex items-center gap-2">
            <span>02 // Global Routing Ledger</span>
            <span className="w-1.5 h-1.5 rounded-full bg-signal-cyan animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase text-white tracking-tight">
            Tour Horizon & Setlist Ledger
          </h2>
          <p className="mt-2 text-zinc-400 font-editorial italic text-base sm:text-lg">
            Direct face-value ticketing, anti-scalper fan presale unlocks, and living setlist time capsules.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1.5 rounded-2xl bg-[#101216] border border-white/10 font-mono text-xs">
          <button
            onClick={() => setMode('upcoming')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              mode === 'upcoming'
                ? 'bg-signal-cyan/20 text-signal-cyan border border-signal-cyan/40 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🌍 Upcoming Dates ({upcomingDates.length})</span>
          </button>
          <button
            onClick={() => setMode('past')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              mode === 'past'
                ? 'bg-[var(--era-accent)]/20 text-[var(--era-accent)] border border-[var(--era-accent)]/40 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>📼 Past Shows Archive (142)</span>
          </button>
        </div>
      </div>

      {mode === 'upcoming' ? (
        <>
          {/* Geo-Targeted Nearest Show Spotlight Card */}
          <div className="rounded-2xl border border-signal-cyan/40 bg-gradient-to-r from-signal-cyan/10 via-[#101216] to-[#101216] p-5 sm:p-6 mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-signal-cyan/15 text-signal-cyan border border-signal-cyan/30 flex-shrink-0 mt-1">
                <MapPin className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-signal-cyan font-bold tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-signal-cyan animate-ping" />
                  <span>NEAREST SHOW DETECTED ({distanceMiles} MILES FROM YOU)</span>
                </div>

                <div className="text-xl sm:text-2xl font-display font-extrabold uppercase text-white tracking-tight">
                  FRI, NOV 20, 2026 • {nearestShow.city} — {nearestShow.venue_name}
                </div>

                <div className="text-xs font-mono text-zinc-300 mt-1.5 flex flex-wrap items-center gap-2">
                  <span>Support: {nearestShow.support_acts.join(' + ')}</span>
                  <span>•</span>
                  <span>Doors {nearestShow.doors_time}</span>
                  <span>•</span>
                  <span className="text-signal-emerald font-semibold">Venue Merch Booth #2 Pickup Ready</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
              <div className="px-3 py-1.5 rounded-lg bg-signal-amber/20 border border-signal-amber/40 text-signal-amber text-xs font-mono font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Only {nearestShow.remaining_tickets_estimate} Tickets Left</span>
              </div>

              <a
                href={nearestShow.ticket_url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-signal-cyan hover:opacity-90 text-black font-mono font-bold text-xs tracking-wider transition-all shadow-lg shadow-signal-cyan/20 flex items-center gap-2"
              >
                <span>Get Face-Value Tickets (${nearestShow.price_usd})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  setPresaleTargetShow(nearestShow);
                  setPresaleModalOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-zinc-300"
              >
                VIP Soundcheck Upgrade
              </button>
            </div>
          </div>

          {/* Region Filter Bar */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-3.5 py-1.5 rounded-xl border transition-colors ${
                selectedRegion === 'all'
                  ? 'bg-white/15 text-white border-white/20 font-semibold'
                  : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              All Regions ({upcomingDates.length})
            </button>
            <button
              onClick={() => setSelectedRegion('na')}
              className={`px-3.5 py-1.5 rounded-xl border transition-colors ${
                selectedRegion === 'na'
                  ? 'bg-white/15 text-white border-white/20 font-semibold'
                  : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              North America
            </button>
            <button
              onClick={() => setSelectedRegion('eu')}
              className={`px-3.5 py-1.5 rounded-xl border transition-colors ${
                selectedRegion === 'eu'
                  ? 'bg-white/15 text-white border-white/20 font-semibold'
                  : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              Europe & UK
            </button>
            <button
              onClick={() => setSelectedRegion('asia')}
              className={`px-3.5 py-1.5 rounded-xl border transition-colors ${
                selectedRegion === 'asia'
                  ? 'bg-white/15 text-white border-white/20 font-semibold'
                  : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              Asia-Pacific
            </button>
          </div>

          {/* High-Density Tabular Tour Schedule */}
          <div className="rounded-2xl border border-white/15 bg-[#101216] overflow-hidden divide-y divide-white/10 shadow-2xl">
            {filteredUpcoming.map(tour => {
              const dateObj = new Date(tour.show_date);
              const dateFormatted = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }).toUpperCase();
              const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

              return (
                <div
                  key={tour.id}
                  className="p-5 sm:p-6 hover:bg-white/[0.03] transition-colors grid grid-cols-1 md:grid-cols-12 items-center gap-4 text-xs font-mono"
                >
                  {/* Date Column (2 Cols) */}
                  <div className="md:col-span-2">
                    <div className="font-bold text-white text-sm">{dateFormatted}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {dayOfWeek} • DOORS {tour.doors_time}
                    </div>
                  </div>

                  {/* City & Country (3 Cols) */}
                  <div className="md:col-span-3">
                    <div className="font-display font-extrabold text-base uppercase text-white tracking-tight">
                      {tour.city}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {tour.neighborhood || 'Metro'} • [{tour.country_code}]
                    </div>
                  </div>

                  {/* Venue & Perks (4 Cols) */}
                  <div className="md:col-span-4">
                    <div className="text-zinc-200 font-semibold text-sm">{tour.venue_name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                      Support: {tour.support_acts.join(', ')}
                    </div>
                    {tour.venue_pickup_enabled && (
                      <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-signal-emerald/10 text-signal-emerald border border-signal-emerald/20 text-[10px]">
                        <span>✓ Venue Merch Pickup Booth Enabled</span>
                      </div>
                    )}
                  </div>

                  {/* Ticket CTA & Status (3 Cols, Right-Aligned) */}
                  <div className="md:col-span-3 flex items-center md:justify-end gap-2.5">
                    {tour.ticket_status === 'on_sale' && (
                      <a
                        href={tour.ticket_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all flex items-center gap-1.5"
                      >
                        <Ticket className="w-3.5 h-3.5 text-signal-emerald" />
                        <span>Tickets • ${tour.price_usd}</span>
                      </a>
                    )}

                    {tour.ticket_status === 'low_tickets' && (
                      <a
                        href={tour.ticket_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-signal-amber/20 hover:bg-signal-amber/30 border border-signal-amber/40 text-signal-amber font-bold transition-all flex items-center gap-1.5"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Last {tour.remaining_tickets_estimate} Tickets</span>
                      </a>
                    )}

                    {tour.ticket_status === 'presale' && (
                      <button
                        onClick={() => {
                          setPresaleTargetShow(tour);
                          setPresaleModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-signal-cyan/20 hover:bg-signal-cyan/30 border border-signal-cyan/40 text-signal-cyan font-bold transition-all flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Enter Fan Code</span>
                      </button>
                    )}

                    {tour.ticket_status === 'sold_out' && (
                      <button
                        onClick={() => alert(`Joined verified face-value waitlist for ${tour.city}. You will be alerted via SMS if tickets are returned.`)}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span>Waitlist (Face-Value)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* "Don't See Your City?" Crowd Demand Bar */}
          <div className="mt-8 rounded-2xl border border-dashed border-white/20 bg-black/40 p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="lg:max-w-md">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4 text-signal-cyan" />
                <span>"Demand My City" Crowd-Routing Heatmap</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Don't see your city on the 2026–2027 routing? 4,280 fans have pledged their locations. When 300+ fans pledge a city, booking agents evaluate an official tour addition.
              </p>
              {/* Leaderboard snippet */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span className="text-zinc-200 font-bold">Top Requested:</span>
                {leaderboard.slice(0, 3).map((item, idx) => (
                  <span key={item.city_name} className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                    {idx + 1}. {item.city_name} ({item.count})
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handlePledgeCity} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 font-mono text-xs">
              <input
                type="text"
                placeholder="City Name / Country"
                value={pledgeCity}
                onChange={e => setPledgeCity(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#101216] border border-white/15 text-white placeholder-zinc-400 focus:outline-none focus:border-signal-cyan w-full sm:w-44"
                required
              />
              <input
                type="email"
                placeholder="Email or Mobile #"
                value={pledgeEmail}
                onChange={e => setPledgeEmail(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#101216] border border-white/15 text-white placeholder-zinc-400 focus:outline-none focus:border-signal-cyan w-full sm:w-48"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-signal-cyan hover:opacity-90 text-black font-bold whitespace-nowrap shadow-md transition-all active:scale-95"
              >
                + Request My City
              </button>
            </form>
          </div>
          {pledgeSuccessMessage && (
            <div className="mt-3 p-3 rounded-xl bg-signal-emerald/20 border border-signal-emerald/40 text-signal-emerald text-xs font-mono text-center">
              {pledgeSuccessMessage}
            </div>
          )}
        </>
      ) : (
        /* Past Shows Setlist Archive (142 Shows) */
        <div className="space-y-6">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between pb-3 border-b border-white/10">
            <span>Showing verified night-by-night soundboard recordings and full song setlists</span>
            <span className="text-[var(--era-accent)] font-semibold">142 Archive Nights Documented</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastShows.map(show => (
              <div
                key={show.id}
                onClick={() => setSelectedPastShow(show)}
                className="rounded-2xl border border-white/15 bg-[#101216] p-5 cursor-pointer hover:border-[var(--era-accent)] transition-all group"
              >
                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 relative bg-black">
                  <img
                    src={show.poster_art_url}
                    alt={show.venue_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono border border-white/20 text-white flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-signal-emerald" />
                    <span>Soundboard Available</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-zinc-400">{show.show_date} • {show.tour_leg_name}</div>
                <h4 className="text-xl font-display font-extrabold uppercase text-white tracking-tight mt-1">
                  {show.city} — {show.venue_name}
                </h4>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>{show.setlist_tracks.length} Songs Played</span>
                  <span className="text-[var(--era-accent)] font-bold group-hover:underline">
                    View Setlist & Photos →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setlist & Bootleg Drawer Modal */}
      {selectedPastShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#0D0F14] border border-white/20 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-[var(--era-accent)] uppercase">
                  {selectedPastShow.show_date} • {selectedPastShow.tour_leg_name}
                </div>
                <h3 className="text-xl font-display font-extrabold uppercase text-white mt-0.5">
                  {selectedPastShow.city} — {selectedPastShow.venue_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPastShow(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  Played Setlist (18 Songs Tracked):
                </div>
                <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-black/40 font-mono text-xs">
                  {selectedPastShow.setlist_tracks.map(trk => (
                    <div key={trk.num} className="p-3 flex items-center justify-between text-zinc-300">
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400">{trk.num < 10 ? `0${trk.num}` : trk.num}.</span>
                        <span className="font-sans font-semibold text-white">{trk.title}</span>
                      </div>
                      <span className="tabular-nums text-zinc-400">{trk.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  Soundboard Audio Master & Fan Artifacts:
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-signal-emerald" />
                    <div>
                      <div className="font-mono text-xs font-bold text-white">Full Soundboard Audio Tape (FLAC / MP3)</div>
                      <div className="text-[10px] font-mono text-zinc-400">Direct console stereo feed mastered at 24-bit</div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Streaming soundboard tape directly from live tour vault.')}
                    className="px-3 py-1.5 rounded-lg bg-signal-emerald text-black text-xs font-mono font-bold"
                  >
                    Listen to Tape
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Scalper Presale Passcode Modal */}
      {presaleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[#0D0F14] border border-signal-cyan/40 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-signal-cyan" />
                <span className="font-mono font-bold text-sm text-white uppercase">Verified Fan Presale</span>
              </div>
              <button
                onClick={() => {
                  setPresaleModalOpen(false);
                  setPresaleUnlocked(false);
                  setPresaleCode('');
                  setPresaleError('');
                }}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {!presaleUnlocked ? (
              <form onSubmit={handleVerifyPresale} className="space-y-4 font-mono text-xs">
                <p className="text-zinc-300 font-sans text-sm">
                  To protect genuine listeners from automated secondary ticket scalpers, this performance requires a verified fan club passcode.
                </p>

                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-400">
                  <span className="text-signal-cyan font-bold">PRO-TIP:</span> Enter code <code className="text-white bg-black/60 px-1 py-0.5 rounded">CHROME2026</code> to test instant unlock.
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase mb-1">Fan Passcode</label>
                  <input
                    type="text"
                    value={presaleCode}
                    onChange={e => setPresaleCode(e.target.value)}
                    placeholder="Enter CHROME2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white placeholder-zinc-400 focus:outline-none focus:border-signal-cyan uppercase tracking-widest text-sm"
                    autoFocus
                  />
                </div>

                {presaleError && (
                  <div className="text-signal-crimson text-xs">{presaleError}</div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-signal-cyan text-black font-bold uppercase tracking-wider text-xs shadow-lg active:scale-95 transition-transform"
                >
                  Verify & Unlock Tickets
                </button>
              </form>
            ) : (
              <div className="space-y-4 font-mono text-xs text-center py-4">
                <div className="w-12 h-12 rounded-full bg-signal-emerald/20 text-signal-emerald mx-auto flex items-center justify-center border border-signal-emerald/40">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-base font-bold text-white">Fan Passcode Verified!</div>
                <p className="text-zinc-300 font-sans text-sm">
                  48-Hour Anti-Scalper Reserved Tier unlocked for {presaleTargetShow?.city} ({presaleTargetShow?.venue_name}).
                </p>
                <a
                  href={presaleTargetShow?.ticket_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-3 rounded-xl bg-signal-emerald text-black font-bold uppercase tracking-wider text-xs shadow-lg"
                >
                  Proceed to Direct-to-Fan Checkout ($45) →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

