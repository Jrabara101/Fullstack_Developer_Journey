import React from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const OmsQueueHeader: React.FC = () => {
    const {
        orders,
        omsChannelFilter,
        setOmsChannelFilter,
        setIsPosModalOpen,
        injectSyntheticException,
        exportOrdersCsv
    } = useCommerce();

    const totalActive = orders.length;
    const exceptionsCount = orders.filter(o => o.status === 'Exception').length;

    const channels = [
        { id: 'all', label: `All Channels (${totalActive})` },
        { id: 'exceptions', label: `⚠️ Exceptions First (${exceptionsCount})` },
        { id: 'Shopify US', label: 'Online (Shopify US)' },
        { id: 'Retail POS #3', label: 'Physical Retail POS #3' },
        { id: 'B2B Portal', label: 'B2B Portal' }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Unified Fulfillment Queue
                        </h1>
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                            {totalActive} Active
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Dual-Channel Synced
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Exception-First operational workflow • Atomic state transitions with tamper-evident audit logs.
                    </p>
                </div>

                {/* OMS Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPosModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[16px]">barcode_scanner</span>
                        <span>Simulate POS Checkout</span>
                    </button>
                    <button
                        onClick={injectSyntheticException}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 text-xs font-semibold rounded-lg transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        <span>Simulate Gateway Exception</span>
                    </button>
                    <button
                        onClick={exportOrdersCsv}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg hover:bg-slate-50 transition-all"
                    >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Channel Filter Pills */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {channels.map(ch => {
                    const isActive = omsChannelFilter === ch.id;
                    const isException = ch.id === 'exceptions';

                    return (
                        <button
                            key={ch.id}
                            onClick={() => setOmsChannelFilter(ch.id)}
                            className={`px-3 py-1 rounded-lg text-xs transition-all ${
                                isActive
                                    ? isException
                                        ? 'border border-rose-400 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-bold'
                                        : 'border border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold'
                                    : isException
                                        ? 'border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold hover:border-rose-400'
                                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                            }`}
                        >
                            {ch.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
