import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const ExpressCheckoutModal: React.FC = () => {
    const {
        cart,
        isExpressModalOpen,
        setIsExpressModalOpen,
        cartSubtotal,
        cartDiscount,
        cartShipping,
        cartTotal,
        appliedPromo,
        submitExpressOrder,
        switchView
    } = useCommerce();

    const [isProcessing, setIsProcessing] = useState(false);

    if (!isExpressModalOpen) return null;

    const estimatedTax = (cartSubtotal - cartDiscount) * 0.085;
    const finalTotal = cartTotal + estimatedTax;

    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        try {
            await submitExpressOrder();
            // Automatically navigate to OMS view to show operational flow
            setTimeout(() => {
                switchView('oms');
            }, 800);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-soft-glow">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <h2 className="font-bold text-base text-slate-900 dark:text-white">
                            1-Tap Express Checkout
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsExpressModalOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                    {/* Customer Info */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                                Express Customer Profile
                            </span>
                            <span className="text-brand-600 text-[11px] font-medium">Apple Pay / Saved</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                            <div>
                                <span className="text-slate-400 block text-[10px]">Recipient</span>
                                <span className="font-medium text-slate-800 dark:text-white">Eleanor Shellstrop</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">Delivery Destination</span>
                                <span className="font-medium text-slate-800 dark:text-white">
                                    123 Fake Street, Phoenix, AZ
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                            Line Item Verification
                        </span>
                        <div className="space-y-1.5">
                            {cart.map(item => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 text-[11px]"
                                >
                                    <span className="font-medium text-slate-800 dark:text-slate-200">
                                        {item.name} <strong className="font-mono text-slate-500">×{item.qty}</strong>
                                    </span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                                        ${(item.price * item.qty).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zero-Surprise Fee Transparency Guarantee */}
                    <div className="p-3 bg-brand-50/50 dark:bg-slate-800/50 rounded-xl border border-brand-100 dark:border-slate-700 space-y-1.5">
                        <span className="font-bold text-brand-900 dark:text-brand-300 block text-[10px] uppercase tracking-wider">
                            Itemized Cost Guarantee
                        </span>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>Merchandise Subtotal</span>
                            <span className="font-mono font-medium">${cartSubtotal.toFixed(2)}</span>
                        </div>
                        {appliedPromo && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                                <span>Promo Discount</span>
                                <span className="font-mono">-${cartDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>Expedited Shipping &amp; Handling</span>
                            <span className="font-mono font-medium">
                                {cartShipping === 0 ? 'FREE' : `$${cartShipping.toFixed(2)}`}
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>Estimated State Tax (8.5%)</span>
                            <span className="font-mono font-medium">${estimatedTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-brand-200/60 dark:border-slate-700">
                            <span>Guaranteed Total</span>
                            <span className="font-mono text-brand-600 dark:text-brand-400">
                                ${finalTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center gap-3">
                    <button
                        onClick={() => setIsExpressModalOpen(false)}
                        disabled={isProcessing}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmPayment}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-75 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                    >
                        {isProcessing ? (
                            <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">
                                    progress_activity
                                </span>
                                <span>Processing Biometric Payment...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">verified</span>
                                <span>Confirm &amp; Place Order</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
