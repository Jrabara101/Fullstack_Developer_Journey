import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, Check, QrCode, ArrowDown } from 'lucide-react';
import { EventThemeConfig } from '../../types/editorial';
import { sounds } from '../../services/soundEffects';

interface HeroUnsealingProps {
  theme: EventThemeConfig;
  onOpenRsvp: () => void;
  guestName?: string;
  companyName?: string;
}

export const HeroUnsealing: React.FC<HeroUnsealingProps> = ({
  theme,
  onOpenRsvp,
  guestName = 'Sarah & Michael Smith',
  companyName = 'Applied Cognitive Systems',
}) => {
  const [isUnsealed, setIsUnsealed] = useState<boolean>(false);
  const [badgeTilt, setBadgeTilt] = useState<{ rx: number; ry: number; mx: number; my: number }>({
    rx: 0,
    ry: 0,
    mx: 50,
    my: 50,
  });

  const handleUnseal = () => {
    if (!isUnsealed) {
      sounds.playWaxSealBreak();
      setTimeout(() => sounds.playEnvelopeOpen(), 250);
      setIsUnsealed(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const ry = ((x - centerX) / centerX) * 14;
    const rx = -((y - centerY) / centerY) * 14;

    const mx = (x / rect.width) * 100;
    const my = (y / rect.height) * 100;

    setBadgeTilt({ rx, ry, mx, my });
  };

  const handlePointerLeave = () => {
    setBadgeTilt({ rx: 0, ry: 0, mx: 50, my: 50 });
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 px-4 flex flex-col items-center justify-center min-h-[82vh]">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-tr from-amber-200/30 to-indigo-200/30 blur-3xl rounded-full pointer-events-none" />

      {/* Hero Badge Tag */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-stone-200 text-stone-700 text-xs font-semibold shadow-2xs backdrop-blur-md mb-6 animate-fade-in">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span className="font-mono uppercase tracking-wider text-[11px]">
          {theme.id === 'wedding'
            ? 'Bespoke Wedding Invitation'
            : theme.id === 'birthday'
            ? 'Milestone Celebration'
            : 'Frontier AI Summit Pass'}
        </span>
      </div>

      {/* Main Experience: Wax Seal Envelope (Weddings/Birthdays) VS Holographic Lanyard (Conference) */}
      {theme.id !== 'conference' ? (
        /* WAX SEALED ENVELOPE EXPERIENCE */
        <div className="perspective-1200 w-full max-w-lg select-none relative my-4">
          <div
            onClick={handleUnseal}
            className={`relative mx-auto w-full transition-all duration-700 cursor-pointer ${
              isUnsealed ? 'scale-102' : 'hover:scale-[1.01]'
            }`}
          >
            {/* The Envelope Shell */}
            <div className="relative bg-[#F4EFE6] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DECDB3] overflow-hidden min-h-[380px] flex flex-col justify-between">
              {/* Envelope Flap Geometry */}
              <div
                className={`absolute top-0 left-0 right-0 h-36 bg-[#EBE3D3] border-b border-[#D8C6A5] origin-top transition-transform duration-700 z-20 ${
                  isUnsealed ? '-rotate-x-180 pointer-events-none opacity-40' : 'rotate-x-0'
                }`}
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                }}
              />

              {/* Wax Seal Stamp (Centered on the Flap) */}
              {!isUnsealed ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnseal();
                  }}
                  className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-16 h-16 rounded-full bg-linear-to-br from-[#8C3A27] via-[#A8432C] to-[#6E2A1B] shadow-xl flex items-center justify-center border-2 border-[#D97D64] hover:scale-108 transition-all active:scale-95 cursor-pointer ring-4 ring-[#A8432C]/30 group"
                  title="Click to break the wax seal and unseal invitation"
                >
                  <span className="font-serif italic text-xl font-bold text-[#FDE8E1] drop-shadow-sm select-none">
                    {theme.id === 'wedding' ? 'E&J' : 'MV'}
                  </span>
                  <div className="absolute -bottom-7 whitespace-nowrap bg-stone-900/85 text-white text-[10px] font-sans px-2.5 py-0.5 rounded-full opacity-90 group-hover:opacity-100 transition-opacity">
                    Click to Unseal
                  </div>
                </div>
              ) : null}

              {/* Letter / Invitation Paper Inside (Slides up smoothly when unsealed) */}
              <div
                className={`relative z-10 bg-[#FFFDF9] rounded-2xl p-6 sm:p-8 border border-[#E8DFC8] shadow-lg transition-all duration-700 ${
                  isUnsealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-75'
                }`}
              >
                <div className="text-center space-y-4">
                  <div className="text-[11px] font-mono tracking-widest uppercase text-[#8C6239] font-bold">
                    {theme.subtitle}
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-serif text-[#1C1917] tracking-tight leading-tight">
                    {theme.title}
                  </h1>

                  <div className="w-16 h-0.5 bg-[#8C6239]/40 mx-auto" />

                  <div className="space-y-1.5 text-xs text-stone-700">
                    <div className="flex items-center justify-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#8C6239]" />
                      <span>{theme.dateStr} • {theme.timeStr}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-[#8C6239]" />
                      <span>{theme.venueName}, {theme.venueAddress}</span>
                    </div>
                  </div>

                  {/* Personalized Recipient line */}
                  <div className="mt-4 pt-3 border-t border-[#EFE8D8] text-xs">
                    <span className="text-stone-400 font-serif italic">Cordially prepared for: </span>
                    <span className="font-serif font-bold text-stone-900">{guestName}</span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={onOpenRsvp}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#8C6239] hover:bg-[#724e2b] text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm RSVP</span>
                      <kbd className="bg-[#5a3e23] border-[#724e2b] text-[9px] text-[#f4efe6] px-1 py-0.2 rounded">R</kbd>
                    </button>

                    <a
                      href="#itinerary"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-all text-center flex items-center justify-center gap-1"
                    >
                      <span>Explore Itinerary</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Envelope Bottom Seal Trim */}
              <div className="text-center text-[11px] text-[#A6937A] font-serif italic mt-3">
                {theme.hostName}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* HOLOGRAPHIC 3D LANYARD & BADGE EXPERIENCE (CONFERENCE) */
        <div
          className="perspective-1200 w-full max-w-sm select-none my-4"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div
            style={{
              transform: `rotateX(${badgeTilt.rx}deg) rotateY(${badgeTilt.ry}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="preserve-3d relative mx-auto w-full rounded-3xl bg-neutral-950 p-6 border-2 border-neutral-700 shadow-2xl text-white overflow-hidden"
          >
            {/* Lanyard Top Ring */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-neutral-800 rounded-b-xl border border-neutral-600 flex items-center justify-center shadow-inner">
              <div className="w-4 h-2 bg-black rounded-full" />
            </div>

            {/* Specular Holographic Iridescent Gradient Sheen */}
            <div
              className="absolute inset-0 pointer-events-none rounded-3xl z-20"
              style={{
                background: `radial-gradient(circle 280px at ${badgeTilt.mx}% ${badgeTilt.my}%, rgba(204, 255, 0, 0.25), rgba(56, 189, 248, 0.25), transparent 75%)`,
              }}
            />

            {/* Holographic Watermark Band */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#CCFF00]/15 to-transparent rounded-bl-full pointer-events-none" />

            {/* Badge Content */}
            <div className="relative z-10 space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#CCFF00] font-bold block uppercase">
                    OFFICIAL SUMMIT BADGE
                  </span>
                  <span className="text-xs font-mono text-neutral-400">SYNAPSE 2026 // NYC</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-[#CCFF00]/20 border border-[#CCFF00]/40 text-[#CCFF00] font-mono text-[10px] font-bold">
                  VIP ALL-ACCESS
                </div>
              </div>

              {/* Real-time attendee name */}
              <div className="py-2 border-y border-neutral-800">
                <h2 className="text-2xl font-bold font-mono tracking-tight text-white">
                  {guestName}
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {companyName}
                </p>
              </div>

              {/* Event Metadata */}
              <div className="space-y-1 text-xs text-neutral-300 font-mono">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>October 8–10, 2026 • 9:00 AM EDT</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Pier 57 Innovation Terminal, Hudson River</span>
                </div>
              </div>

              {/* Barcode & Security Strip */}
              <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-neutral-300" />
                  <div className="font-mono text-[9px] text-neutral-500 leading-tight">
                    RFID-AUTHENTICATED<br />PASS #9928-ALPHA
                  </div>
                </div>

                <button
                  onClick={onOpenRsvp}
                  className="px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  RSVP & Claim Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

