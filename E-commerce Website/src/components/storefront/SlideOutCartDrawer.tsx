import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const SlideOutCartDrawer: React.FC = () => {
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        updateCartQty,
        addToCart,
        appliedPromo,
        applyPromoCode,
        reservationSeconds,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartShipping,
        cartTotal,
        setIsExpressModalOpen
    } = useCommerce();

    const [promoInput, setPromoInput] = useState('');
    const [showUpsell, setShowUpsell] = useState(true);

    const freeShippingThreshold = 150.00;
    const diff = Math.max(0, freeShippingThreshold - (cartSubtotal - cartDiscount));
    const progressPercent = Math.min(100, Math.round(((cartSubtotal - cartDiscount) / freeShippingThreshold) * 100));

    const mins = Math.floor(reservationSeconds / 60);
    const secs = reservationSeconds % 60;
    const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const handleApplyPromo = () => {
        if (!promoInput.trim()) return;
        applyPromoCode(promoInput);
    };

    return (
        <div className={`fixed inset-0 z-50 ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                onClick={() => setIsCartOpen(false)}
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
                    isCartOpen ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Slide-out Drawer Panel */}
            <aside
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isCartOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-brand-600">shopping_bag</span>
                        <h2 className="font-bold text-base text-slate-900 dark:text-white">
                            Your Cart ({cartCount})
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Urgency Reservation Timer */}
                <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200/80 dark:border-amber-900/50 px-4 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-amber-600">lock_clock</span>
                        <span className="font-medium">Items reserved for:</span>
                    </div>
                    <span className="font-mono font-bold text-amber-900 dark:text-amber-100 bg-amber-200/60 dark:bg-amber-900/80 px-2 py-0.5 rounded">
                        {formattedTime}
                    </span>
                </div>

                {/* Dynamic Free Shipping Threshold Bar */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-medium text-slate-700 dark:text-slate-300">
                        {diff === 0 && cartCount > 0 ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                <span className="material-symbols-outlined text-[16px]">verified</span>
                                <span>Unlocked: <strong>Free Expedited 2-Day Shipping!</strong></span>
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px] text-brand-600">local_shipping</span>
                                <span>Add <strong className="text-brand-600 dark:text-brand-400 font-mono">${diff.toFixed(2)}</strong> for <strong>Free 2-Day Shipping</strong></span>
                            </span>
                        )}
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-brand-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                                shopping_cart
                            </span>
                            <p className="text-xs text-slate-500">Your shopping cart is currently empty.</p>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold"
                            >
                                Explore Catalog
                            </button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-14 h-14 rounded-lg object-cover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.name}</h4>
                                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">SKU: {item.sku}</span>
                                    <div className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400 mt-1">
                                        ${item.price.toFixed(2)}
                                    </div>
                                </div>
                                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                                    <button
                                        onClick={() => updateCartQty(item.id, -1)}
                                        className="px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">remove</span>
                                    </button>
                                    <span className="px-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                        {item.qty}
                                    </span>
                                    <button
                                        onClick={() => updateCartQty(item.id, 1)}
                                        className="px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">add</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 1-Click Contextual Upsell */}
                {showUpsell && (
                    <div className="px-5 py-3 bg-brand-50/60 dark:bg-slate-800/60 border-t border-b border-brand-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-brand-900 dark:text-brand-200 mb-2">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                Recommended Add-On
                            </span>
                        </div>
                        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-brand-200/60 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <img
                                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=150&auto=format&fit=crop&q=80"
                                    alt="Braided Cable"
                                    className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                                />
                                <div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                        Nylon Braided USB-C Cable
                                    </div>
                                    <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                                        $25.00
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    addToCart(2);
                                    setShowUpsell(false);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                )}

                {/* Promo Code Input */}
                <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code (e.g. DAWN20)"
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs uppercase font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                        onClick={handleApplyPromo}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-medium transition-all"
                    >
                        Apply
                    </button>
                </div>

                {/* Drawer Footer */}
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                                ${cartSubtotal.toFixed(2)}
                            </span>
                        </div>
                        {appliedPromo && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                                <span>Promo Discount (20%)</span>
                                <span className="font-mono">-${cartDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Estimated Shipping</span>
                            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                                {cartShipping === 0 ? 'FREE' : `$${cartShipping.toFixed(2)}`}
                            </span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span>Total</span>
                            <span className="font-mono text-brand-600 dark:text-brand-400">
                                ${cartTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (cart.length === 0) return;
                            setIsExpressModalOpen(true);
                        }}
                        disabled={cart.length === 0}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:to-indigo-900 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-slate-950/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-[18px] text-amber-400">bolt</span>
                        <span>1-Tap Express Checkout (Zero Surprise Fees)</span>
                    </button>
                </div>
            </aside>
        </div>
    );
};
