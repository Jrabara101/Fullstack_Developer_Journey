import React, { useState } from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Coffee
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ArrivalMode } from '../types';

export const PreOrderDrawer: React.FC = () => {
  const {
    isPreOrderDrawerOpen,
    setIsPreOrderDrawerOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    cartCount,
    arrivalMode,
    setArrivalMode,
    getPrepScheduleEstimate
  } = useCoffeeShop();

  const [isSuccess, setIsSuccess] = useState(false);
  const [orderToken, setOrderToken] = useState('');
  const [customerName, setCustomerName] = useState('');

  if (!isPreOrderDrawerOpen) return null;

  const prepSchedule = getPrepScheduleEstimate();

  const arrivalOptions: { id: ArrivalMode; label: string; eta: string; icon: string }[] = [
    { id: 'walking-5', label: 'Walking', eta: '5 mins away', icon: '🚶' },
    { id: 'walking-10', label: 'Brisk Walk', eta: '10 mins away', icon: '🚶‍♂️' },
    { id: 'biking-10', label: 'Cycling', eta: '10 mins away', icon: '🚲' },
    { id: 'dine-in-table', label: 'Dine-In', eta: 'Seated at Table', icon: '🪑' },
    { id: 'curbside-15', label: 'Curbside', eta: '15 mins away', icon: '🚗' },
  ];

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const token = `KÖPA-${Math.floor(100 + Math.random() * 900)}`;
    setOrderToken(token);
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#C86D44', '#D99B26', '#FAF6F0', '#4A6B53']
      });
    } catch (e) {}
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    clearCart();
    setIsPreOrderDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-espresso-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-surface-ceramic shadow-2xl border-l border-linen-hairline flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-linen-hairline bg-canvas-oat flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-terracotta font-bold">
                Arrival-Timed Pre-Order
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-espresso-primary flex items-center gap-2">
                <Coffee className="w-5 h-5 text-terracotta" />
                <span>Hot When You Walk In</span>
              </h2>
            </div>

            <button
              onClick={() => setIsPreOrderDrawerOpen(false)}
              className="p-2 text-cacao-secondary hover:text-espresso-primary rounded-full hover:bg-canvas-parchment transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-matcha-light text-matcha flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-espresso-primary">
                Order Fired to Barista Station!
              </h3>

              <div className="bg-canvas-parchment p-4 rounded-2xl border border-craft-stamp font-mono text-center space-y-2 w-full">
                <div className="text-xs text-oat-muted uppercase">Your Pickup Token</div>
                <div className="text-3xl font-bold text-terracotta tracking-widest">{orderToken}</div>
                <div className="text-xs text-cacao-secondary pt-1 border-t border-linen-hairline">
                  {prepSchedule.message}
                </div>
              </div>

              <div className="text-xs text-cacao-secondary space-y-1">
                <p>We've queued your ticket behind 1 drink ahead of you.</p>
                <p className="font-serif italic text-espresso-primary">
                  "See you in a few minutes, {customerName || 'friend'}."
                </p>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full bg-espresso-primary hover:bg-terracotta text-white py-3 rounded-full text-xs font-semibold shadow-warm-sm transition-all"
              >
                Back to Roastery Experience
              </button>
            </div>
          ) : (
            <>
              {/* Drawer Scrollable Content */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                {/* Arrival Mode Selector */}
                <div className="bg-canvas-parchment/70 p-4 rounded-2xl border border-linen-hairline space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-espresso-primary">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-terracotta" />
                      Select Arrival Mode:
                    </span>
                    <span className="text-[10px] text-terracotta">Precise Milk Steaming</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {arrivalOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setArrivalMode(opt.id)}
                        className={`p-2 rounded-xl text-left border transition-all text-xs ${
                          arrivalMode === opt.id
                            ? 'bg-surface-ceramic border-terracotta text-espresso-primary font-bold shadow-sm ring-1 ring-terracotta/30'
                            : 'bg-white/60 border-linen-hairline text-cacao-secondary hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-1 text-sm">{opt.icon} <span className="font-serif">{opt.label}</span></div>
                        <div className="text-[10px] font-mono text-oat-muted mt-0.5">{opt.eta}</div>
                      </button>
                    ))}
                  </div>

                  {/* Calculated Barista Sync Message */}
                  <div className="bg-amber-honey/15 border border-amber-honey/25 p-2.5 rounded-xl text-[11px] font-mono text-amber-950 leading-relaxed">
                    ⏱️ {prepSchedule.message}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono uppercase text-oat-muted">
                    <span>Your Handcrafted Tray ({cartCount})</span>
                    {cart.length > 0 && (
                      <button 
                        onClick={clearCart}
                        className="text-terracotta hover:underline font-semibold"
                      >
                        Clear Tray
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-12 bg-canvas-parchment/40 rounded-2xl border border-dashed border-linen-hairline p-6">
                      <ShoppingBag className="w-10 h-10 text-oat-muted mx-auto mb-2 opacity-50" />
                      <p className="font-serif text-sm font-semibold text-espresso-primary">Your tray is empty</p>
                      <p className="text-xs text-cacao-secondary mt-1">
                        Explore our Sensory Menu or Fresh Bake Cabinet to add drinks or pastries.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {cart.map((item) => (
                        <div
                          key={item.cartItemId}
                          className="bg-white p-3.5 rounded-xl border border-linen-hairline shadow-sm space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-serif font-bold text-sm text-espresso-primary">
                                {item.name}
                              </h4>
                              <div className="text-[10px] font-mono text-oat-muted">
                                {item.milkChoice && item.milkChoice !== 'none' && `Milk: ${item.milkChoice.toUpperCase()} • `}
                                {item.tempChoice && `${item.tempChoice.toUpperCase()}`}
                              </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-espresso-primary">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          {/* Paired Pastry sub-line if bundled */}
                          {item.pairedPastry && (
                            <div className="bg-canvas-parchment/70 p-2 rounded-lg text-[11px] flex justify-between items-center text-cacao-secondary">
                              <span className="font-serif">🥐 + {item.pairedPastry.name}</span>
                              <span className="font-mono font-bold">${(item.pairedPastry.price * item.quantity).toFixed(2)}</span>
                            </div>
                          )}

                          {/* Quantity Controls & Remove */}
                          <div className="flex items-center justify-between pt-1 border-t border-linen-hairline text-xs">
                            <div className="flex items-center gap-2 bg-canvas-parchment p-1 rounded-lg">
                              <button
                                onClick={() => updateCartQuantity(item.cartItemId, -1)}
                                className="p-1 hover:bg-white rounded text-cacao-secondary"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono font-bold px-1.5">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.cartItemId, 1)}
                                className="p-1 hover:bg-white rounded text-cacao-secondary"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customer Name */}
                {cart.length > 0 && (
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase text-oat-muted mb-1">
                      Your First Name (For the Cup):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya, Soren, Jordan"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-linen-hairline rounded-xl p-2.5 text-xs text-espresso-primary focus:outline-none focus:ring-1 focus:ring-terracotta"
                    />
                  </div>
                )}

              </div>

              {/* Drawer Footer Checkout Button */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-linen-hairline bg-canvas-oat space-y-4">
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-cacao-secondary">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-cacao-secondary">
                      <span>Local Craft Tax</span>
                      <span>${(cartTotal * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-espresso-primary pt-1 border-t border-linen-hairline">
                      <span>Total Due</span>
                      <span>${(cartTotal * 1.08).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3.5 px-6 rounded-full font-semibold text-sm shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Place Arrival-Synced Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center text-[10px] font-mono text-oat-muted">
                    Zero wait at counter • Hot milk poured on your ETA window
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
