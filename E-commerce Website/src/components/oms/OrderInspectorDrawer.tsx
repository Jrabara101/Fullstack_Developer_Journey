import React from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const OrderInspectorDrawer: React.FC = () => {
    const { selectedOrder, advanceOrderStatus } = useCommerce();

    if (!selectedOrder) {
        return (
            <aside className="w-96 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex items-center justify-center p-6 text-slate-400 text-xs">
                Select an order to inspect details.
            </aside>
        );
    }

    let statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    if (selectedOrder.status === 'Fulfilled') statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    else if (selectedOrder.status === 'Exception') statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
    else if (selectedOrder.status === 'Dispatched') statusBadgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-300';

    return (
        <aside className="w-96 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-y-auto shadow-lg">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white">
                            {selectedOrder.id}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeClass}`}>
                            {selectedOrder.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedOrder.customer} • {selectedOrder.channel}
                    </p>
                </div>
            </div>

            {/* Line Items */}
            <div className="p-4 space-y-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Fulfillment Line Items
                </span>
                <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                                <span className="text-[10px] font-mono text-slate-400">
                                    SKU: {item.sku} • Qty: {item.qty}
                                </span>
                            </div>
                            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                                ${(item.price * item.qty).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Atomic Status Transitions */}
            <div className="p-4 space-y-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Atomic Status Transition
                </span>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => advanceOrderStatus('Processing')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 hover:bg-amber-100 transition-all flex items-center justify-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[14px]">autorenew</span> Processing
                    </button>
                    <button
                        onClick={() => advanceOrderStatus('Dispatched')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 hover:bg-indigo-100 transition-all flex items-center justify-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span> Dispatch
                    </button>
                    <button
                        onClick={() => advanceOrderStatus('Fulfilled')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Delivered
                    </button>
                    <button
                        onClick={() => advanceOrderStatus('Exception')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 hover:bg-rose-100 transition-all flex items-center justify-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[14px]">flag</span> Flag Issue
                    </button>
                </div>
            </div>

            {/* Chronological Immutable Audit Trail */}
            <div className="p-4 flex-1 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Immutable Audit Trail
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified SHA-256
                    </span>
                </div>
                <div className="space-y-2.5 font-mono text-[11px]">
                    {selectedOrder.auditLogs.map((log, index) => (
                        <div
                            key={index}
                            className="p-2 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-0.5"
                        >
                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span className="font-bold text-slate-600 dark:text-slate-300">[{log.actor}]</span>
                                <span>{log.time}</span>
                            </div>
                            <div className="text-slate-700 dark:text-slate-300 font-sans">{log.action}</div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};
