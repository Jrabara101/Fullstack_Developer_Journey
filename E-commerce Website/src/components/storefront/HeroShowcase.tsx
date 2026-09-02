import React from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const HeroShowcase: React.FC = () => {
    const { addToCart } = useCommerce();

    const scrollToCatalog = () => {
        const el = document.getElementById('catalog-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 py-10 md:py-16">
            {/* Background Ambient Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-500/15 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/80 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800/70 text-brand-700 dark:text-brand-300 text-xs font-semibold tracking-wide">
                            <span className="material-symbols-outlined text-[16px] text-brand-600 dark:text-brand-400">
                                verified
                            </span>
                            <span>Shopify Dawn Minimalist Speed Architecture</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                            Precision Hardware Engineered for <span className="text-gradient-primary">Zero-Friction Audio.</span>
                        </h1>

                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                            Experience instant URL-state faceted catalog discovery, live buffer stock inventory safeguards, and 1-tap express checkout with zero surprise fees.
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                            <button
                                onClick={scrollToCatalog}
                                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span>Explore Collection</span>
                                <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                            </button>
                            <button
                                onClick={() => addToCart(1)}
                                className="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[18px] text-brand-600 dark:text-brand-400">
                                    add_shopping_cart
                                </span>
                                <span>Quick Add Flagship ANC ($199)</span>
                            </button>
                        </div>

                        {/* Trust Proof Pills */}
                        <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                                100% Real-time POS Inventory Sync
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-emerald-500">timer</span>
                                10-Min Live Cart Reservation
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-emerald-500">local_shipping</span>
                                Free 2-Day Shipping over $150
                            </span>
                        </div>
                    </div>

                    {/* Hero Interactive Product Showcase Card */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 shadow-xl relative group">
                            <div className="relative h-60 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                                    alt="Aura ANC Wireless Headphones"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/95 text-white tracking-wide shadow-sm flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                                    Only 3 Left In Stock
                                </span>
                                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-900/80 backdrop-blur text-white">
                                    SKU: AU-ANC-BLK
                                </span>
                            </div>
                            <div className="mt-4 flex justify-between items-start">
                                <div>
                                    <h2 className="font-bold text-base text-slate-900 dark:text-white">Aura ANC Wireless Headphones</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dual 40mm Beryllium Drivers • 42h Battery</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-extrabold text-base text-brand-600 dark:text-brand-400 font-mono">$199.00</div>
                                    <span className="text-[10px] text-slate-400 line-through font-mono">$249.00</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                                    <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                                    <span>4.9</span>
                                    <span className="text-slate-400 text-[10px]">(328 reviews)</span>
                                </div>
                                <button
                                    onClick={() => addToCart(1)}
                                    className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[15px]">add</span>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
