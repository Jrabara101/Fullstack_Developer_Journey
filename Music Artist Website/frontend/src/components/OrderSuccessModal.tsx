import React, { useState } from 'react';
import {
  CheckCircle2,
  QrCode,
  Download,
  Share2,
  FileText,
  Sparkles,
  ShieldCheck,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const OrderSuccessModal: React.FC = () => {
  const { completedOrder, dismissOrderSuccessModal } = useCart();
  const [downloadCount, setDownloadCount] = useState(0);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  if (!completedOrder) return null;

  const hasVenuePickup = completedOrder.fulfillment_mode === 'venue_pickup' && completedOrder.venue_pickup_pass;
  const hasDigitalVault = !!completedOrder.digital_vault_token;

  const handleSimulateDownload = (format: string) => {
    setDownloadCount(prev => prev + 1);
    setDownloadSuccessMessage(`Master audio bundle (${format}) download dispatched!`);
    setTimeout(() => setDownloadSuccessMessage(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-3xl bg-[#0D0F14] border border-white/20 shadow-2xl overflow-hidden flex flex-col hardware-transition animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-signal-emerald/20 via-white/[0.04] to-black border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-signal-emerald/20 text-signal-emerald border border-signal-emerald/40 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-signal-emerald uppercase tracking-wider">
                Direct-to-Fan Order Confirmed
              </div>
              <div className="text-lg font-display font-extrabold text-white mt-0.5">
                {completedOrder.order_number}
              </div>
            </div>
          </div>

          <button
            onClick={dismissOrderSuccessModal}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Order Summary banner */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between font-mono text-xs">
            <div>
              <div className="text-zinc-400">Total Paid (Direct Artist Settlement)</div>
              <div className="text-xl font-bold text-white mt-0.5 tabular-nums">
                ${(completedOrder.total_cents / 100).toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-zinc-400">Confirmation Sent To</div>
              <div className="text-white font-semibold">{completedOrder.fan_email}</div>
            </div>
          </div>

          {/* VENUE PICKUP PASS CARD (If chosen) */}
          {hasVenuePickup && (
            <div className="rounded-2xl border-2 border-signal-emerald bg-black/80 p-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-signal-emerald/30">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-signal-emerald uppercase tracking-wider">
                  <QrCode className="w-4 h-4" />
                  <span>Express Venue Merch Pickup Pass (Skip the Line)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-signal-emerald text-black text-[10px] font-mono font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Simulated QR Code Graphic */}
                <div className="sm:col-span-5 flex flex-col items-center">
                  <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-32 h-32 text-black">
                      <rect width="100" height="100" fill="white" />
                      <path
                        d="M10 10h30v30h-30z M15 15h20v20h-20z M60 10h30v30h-30z M65 15h20v20h-20z M10 60h30v30h-30z M15 65h20v20h-20z M45 10h10v10h-10z M45 30h10v10h-10z M45 50h10v10h-10z M10 45h10v10h-10z M30 45h10v10h-10z M50 70h10v10h-10z M70 50h20v10h-20z M60 70h10v20h-10z M80 80h10v10h-10z"
                        fill="black"
                      />
                    </svg>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-2 text-center">
                    Cryptographic Pass #
                    <br />
                    <span className="text-zinc-200">{completedOrder.venue_pickup_pass?.qr_code_data.slice(0, 24)}...</span>
                  </div>
                </div>

                {/* Pickup Instructions */}
                <div className="sm:col-span-7 font-mono text-xs space-y-2.5">
                  <div>
                    <div className="text-zinc-400 text-[10px] uppercase">Concert Venue & Night</div>
                    <div className="text-sm font-bold text-white">
                      {completedOrder.venue_pickup_pass?.city} — {completedOrder.venue_pickup_pass?.venue_name}
                    </div>
                  </div>

                  <div>
                    <div className="text-zinc-400 text-[10px] uppercase">Designated Collection Point</div>
                    <div className="text-sm font-bold text-signal-emerald">
                      {completedOrder.venue_pickup_pass?.booth}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-zinc-300 font-sans leading-tight">
                    Show this screen or add to Apple Wallet at Booth #2. Your gatefold record is pre-packed and stamped with your edition number.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DIGITAL LOSSLESS VAULT TOKEN CARD */}
          {hasDigitalVault && (
            <div className="rounded-2xl border border-[var(--era-accent)] bg-black/60 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                  <Download className="w-4 h-4 text-[var(--era-accent)]" />
                  <span>24-Bit / 96kHz Lossless Master Vault Download</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--era-secondary)]">
                  Token: {completedOrder.digital_vault_token?.slice(0, 12)}...
                </span>
              </div>

              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                As a vinyl/bundle patron, you have instant midnight access to uncompressed studio masters and full-resolution liner art.
              </p>

              {/* Download Format Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <button
                  onClick={() => handleSimulateDownload('24-Bit / 96kHz .WAV')}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[var(--era-accent)] hover:text-white border border-white/10 transition-all flex flex-col text-left group"
                >
                  <div className="font-bold">Studio Master .WAV</div>
                  <div className="text-[10px] text-zinc-400 group-hover:text-zinc-200 mt-0.5">24-Bit / 96kHz • 840 MB</div>
                </button>

                <button
                  onClick={() => handleSimulateDownload('.FLAC Lossless')}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[var(--era-accent)] hover:text-white border border-white/10 transition-all flex flex-col text-left group"
                >
                  <div className="font-bold">Lossless .FLAC</div>
                  <div className="text-[10px] text-zinc-400 group-hover:text-zinc-200 mt-0.5">Compressed Master • 480 MB</div>
                </button>

                <button
                  onClick={() => handleSimulateDownload('320kbps MP3')}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[var(--era-accent)] hover:text-white border border-white/10 transition-all flex flex-col text-left group"
                >
                  <div className="font-bold">LAME 320kbps MP3</div>
                  <div className="text-[10px] text-zinc-400 group-hover:text-zinc-200 mt-0.5">Mobile Friendly • 110 MB</div>
                </button>
              </div>

              {downloadSuccessMessage && (
                <div className="p-2.5 rounded-lg bg-signal-emerald/20 border border-signal-emerald/40 text-signal-emerald text-xs font-mono text-center">
                  {downloadSuccessMessage}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-2 border-t border-white/5">
                <span>Downloads Used: {downloadCount} / 5 Max</span>
                <span>Access Valid for 30 Days</span>
              </div>
            </div>
          )}

          {/* Purchased Items List */}
          <div>
            <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Purchased Manifest:
            </div>
            <div className="divide-y divide-white/5 font-mono text-xs">
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-zinc-300">
                  <div>
                    <span className="font-bold text-white">{item.quantity}x</span> {item.product_title} ({item.variant_name})
                  </div>
                  <div className="tabular-nums font-bold text-white">
                    ${(item.total_price_cents / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-black/60 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-signal-emerald" />
            <span>Cryptographic Proof Recorded to Artist Ledger</span>
          </div>

          <button
            onClick={dismissOrderSuccessModal}
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95"
          >
            Continue Exploring Flagship
          </button>
        </div>
      </div>
    </div>
  );
};

