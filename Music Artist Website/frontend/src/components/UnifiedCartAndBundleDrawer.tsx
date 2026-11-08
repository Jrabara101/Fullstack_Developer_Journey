import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Package,
  QrCode,
  CreditCard,
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { TourDate } from '../types';

interface CartDrawerProps {
  upcomingDates: TourDate[];
}

export const UnifiedCartAndBundleDrawer: React.FC<CartDrawerProps> = ({ upcomingDates }) => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    fulfillmentMode,
    setFulfillmentMode,
    pickupTourDateId,
    setPickupTourDateId,
    subtotalCents,
    bundleDiscountCents,
    shippingCents,
    totalCents,
    hasBundleSavings,
    executeCheckout,
    isCheckingOut
  } = useCart();

  const [fanEmail, setFanEmail] = useState('fan@artistflagship.com');
  const [shippingAddress, setShippingAddress] = useState({
    street: '742 Evergreen Terrace',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    country: 'United States'
  });

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fanEmail.trim()) return;
    executeCheckout(fanEmail, fulfillmentMode === 'ship_to_address' ? shippingAddress : undefined);
  };

  const selectedTourShow = upcomingDates.find(d => d.id === pickupTourDateId) || upcomingDates[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg h-full bg-[#0D0F14] border-l border-white/20 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--era-accent)]/15 text-[var(--era-accent)]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Direct-to-Fan Bag</span>
                <span className="text-[var(--era-accent)]">({items.reduce((a, b) => a + b.quantity, 0)} Items)</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Artist-Owned Storefront • No Middlemen
              </div>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Smart "Era Bundle" Progress Indicator */}
          <div className="p-3.5 rounded-2xl border transition-colors bg-white/[0.03] border-white/10">
            {hasBundleSavings ? (
              <div className="flex items-start gap-2 text-xs font-mono text-signal-emerald">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">🎉 15% Era Bundle Discount Applied!</div>
                  <div className="text-[11px] text-zinc-300 font-sans mt-0.5">
                    Vinyl + Apparel/Poster combined. You are saving ${(bundleDiscountCents / 100).toFixed(2)} on this order.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs font-mono text-zinc-300">
                <Sparkles className="w-4 h-4 text-signal-amber flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Unlock 15% Era Bundle Savings:</div>
                  <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    Combine any vinyl LP pressing with tour apparel or screenprint poster to trigger automatic 15% discount.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          {items.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 font-mono text-xs space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto opacity-30 text-zinc-400" />
              <div>Your bag is empty.</div>
              <div className="text-[11px] text-zinc-400">
                Browse our limited 180g vinyl pressings or tour apparel above.
              </div>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-white/5">
              {items.map((item, idx) => (
                <div key={item.variant.id} className="pt-4 first:pt-0 flex items-start gap-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="text-xs font-sans font-bold text-white truncate">
                      {item.product.title}
                    </div>
                    <div className="text-[10px] font-mono text-[var(--era-accent)] mt-0.5">
                      {item.variant.variant_name}
                    </div>
                    <div className="text-xs font-mono font-bold text-white mt-1 tabular-nums">
                      ${(item.variant.price_cents / 100).toFixed(2)} each
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2 font-mono text-xs">
                      <div className="flex items-center border border-white/15 rounded-lg bg-black/60">
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                          className="p-1 hover:text-[var(--era-accent)]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 tabular-nums font-bold text-white text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          className="p-1 hover:text-[var(--era-accent)]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.variant.id)}
                        className="text-zinc-400 hover:text-signal-crimson p-1 ml-auto"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fulfillment Mode Switcher */}
          {items.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-3 font-mono text-xs">
              <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                Select Fulfillment Method:
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentMode('ship_to_address')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    fulfillmentMode === 'ship_to_address'
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/10 bg-black/40 text-zinc-400'
                  }`}
                >
                  <Package className="w-4 h-4 mb-1 text-zinc-300" />
                  <div className="font-bold text-xs">Ship to Address</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">$9.50 Tracked Courier</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentMode('venue_pickup')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    fulfillmentMode === 'venue_pickup'
                      ? 'border-signal-emerald bg-signal-emerald/10 text-white shadow-lg'
                      : 'border-white/10 bg-black/40 text-zinc-400'
                  }`}
                >
                  <QrCode className="w-4 h-4 mb-1 text-signal-emerald" />
                  <div className="font-bold text-xs text-signal-emerald">Venue Pickup Tonight</div>
                  <div className="text-[10px] text-zinc-300 mt-0.5">$0.00 • Skip the Line</div>
                </button>
              </div>

              {/* Venue Selector if Venue Pickup Mode */}
              {fulfillmentMode === 'venue_pickup' ? (
                <div className="p-3.5 rounded-xl bg-signal-emerald/10 border border-signal-emerald/30 space-y-2">
                  <div className="text-[11px] font-bold text-signal-emerald uppercase">
                    Select Your Concert Night:
                  </div>
                  <select
                    value={pickupTourDateId}
                    onChange={e => setPickupTourDateId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/80 border border-white/20 text-xs text-white focus:outline-none"
                  >
                    {upcomingDates.filter(d => d.venue_pickup_enabled).map(tour => (
                      <option key={tour.id} value={tour.id}>
                        {tour.city} — {tour.venue_name} (Nov 2026)
                      </option>
                    ))}
                  </select>
                  <div className="text-[10px] text-zinc-300 leading-tight">
                    🎫 Upon payment, you receive an Apple Wallet / QR pass. Collect your pre-packed vinyl at Merch Booth #2 without waiting in the crowd!
                  </div>
                </div>
              ) : (
                /* Address Fields */
                <div className="space-y-2">
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={e => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    placeholder="Street Address"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder-zinc-400"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="City"
                      className="px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="State"
                      className="px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={e => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      placeholder="ZIP Code"
                      className="px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Fan Email */}
              <div className="pt-2">
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Fan Email (For Pass & Vault Token)</label>
                <input
                  type="email"
                  value={fanEmail}
                  onChange={e => setFanEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-xs text-white"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout Button */}
        {items.length > 0 && (
          <div className="p-5 sm:p-6 bg-black/90 border-t border-white/10 space-y-4">
            {/* Calculation Totals */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="tabular-nums text-white">${(subtotalCents / 100).toFixed(2)}</span>
              </div>

              {bundleDiscountCents > 0 && (
                <div className="flex justify-between text-signal-emerald font-semibold">
                  <span>15% Era Bundle Savings</span>
                  <span className="tabular-nums">-${(bundleDiscountCents / 100).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400">
                <span>Fulfillment ({fulfillmentMode === 'venue_pickup' ? 'Venue Pickup' : 'Courier'})</span>
                <span className="tabular-nums text-white">
                  {shippingCents === 0 ? 'FREE ($0.00)' : `$${(shippingCents / 100).toFixed(2)}`}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between text-base font-bold text-white">
                <span>Total Due</span>
                <span className="tabular-nums text-[var(--era-accent)]">${(totalCents / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Simulated Apple Pay / Stripe Button */}
            <button
              onClick={handleCheckoutSubmit}
              disabled={isCheckingOut}
              className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-black" />
              <span>
                {isCheckingOut ? 'Securing Inventory...' : `Pay ${(totalCents / 100).toFixed(2)} with Stripe / Apple Pay`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-signal-emerald" />
              <span>Direct Artist Payout • 256-Bit SSL Encrypted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

