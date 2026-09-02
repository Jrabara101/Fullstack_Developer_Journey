import React from 'react';

export const TrustPillars: React.FC = () => {
    return (
        <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                            <span className="material-symbols-outlined text-[20px]">bolt</span>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Zero Surprise Fees</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                All duties, taxes &amp; shipping transparently itemized upfront.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <span className="material-symbols-outlined text-[20px]">sync</span>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Dual-Channel Sync</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                POS &amp; Web inventory reconciled with zero overselling risk.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                            <span className="material-symbols-outlined text-[20px]">lock_clock</span>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">10-Min Cart Reserve</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Items locked during checkout to eliminate cart-sniping.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                            <span className="material-symbols-outlined text-[20px]">assignment_return</span>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">30-Day Pure Trial</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Hassle-free return labels generated instantly inside OMS.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
