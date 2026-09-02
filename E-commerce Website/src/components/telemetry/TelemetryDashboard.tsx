import React from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const TelemetryDashboard: React.FC = () => {
    const { liveLogs } = useCommerce();

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Core Business &amp; E-Commerce Telemetry
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Real-time operational benchmarks against target conversion funnel and OMS synchronization metrics.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* KPI 1 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                        <span>Cart Abandonment Rate</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Target &lt; 65%
                        </span>
                    </div>
                    <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">58.2%</div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 font-medium">
                        <span className="material-symbols-outlined text-[16px]">trending_down</span>
                        <span>-4.8% reduction via 10-min reservation timer</span>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '58.2%' }}></div>
                    </div>
                </div>

                {/* KPI 2 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                        <span>Filter Engagement Depth</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                            Target &gt; 40%
                        </span>
                    </div>
                    <div className="text-3xl font-extrabold font-mono text-brand-600 dark:text-brand-400">47.6%</div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-brand-600 font-medium">
                        <span className="material-symbols-outlined text-[16px]">trending_up</span>
                        <span>+12% higher AOV on faceted sessions</span>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-500 h-full rounded-full" style={{ width: '47.6%' }}></div>
                    </div>
                </div>

                {/* KPI 3 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                        <span>Fulfillment Cycle Time</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            Target &lt; 24h
                        </span>
                    </div>
                    <div className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">16.4 hrs</div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 font-medium">
                        <span className="material-symbols-outlined text-[16px]">speed</span>
                        <span>Exception-First queue prioritized</span>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '68%' }}></div>
                    </div>
                </div>

                {/* KPI 4 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
                        <span>POS API Sync Error Rate</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Target &lt; 0.1%
                        </span>
                    </div>
                    <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">0.02%</div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 font-medium">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Zero double-spend / oversells recorded</span>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.98%' }}></div>
                    </div>
                </div>
            </div>

            {/* GMV Breakdown & POS Latency Visualizer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Channel Volume Distribution */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Gross Merchandise Value (GMV) by Origin Channel
                    </h3>
                    <div className="space-y-3 font-mono text-xs">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span>Shopify US Online Storefront</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">$42,850.00 (62%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-brand-600 h-full rounded-full" style={{ width: '62%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span>Physical Retail POS Terminals (In-Store)</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">$19,420.00 (28%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '28%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span>B2B Direct Wholesale Portal</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">$6,950.00 (10%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: '10%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* POS Sync Stream Live Log Terminal */}
                <div className="lg:col-span-5 bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col font-mono text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            Live POS Webhook Event Stream
                        </span>
                        <span className="text-[10px] text-slate-500">WebSocket: /ws/inventory</span>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-48 space-y-1.5 text-[11px] text-slate-400">
                        {liveLogs.map((log, index) => (
                            <div key={index}>
                                <span className="text-slate-500">[{log.time}]</span>{' '}
                                <strong className={log.color}>{log.msg}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
};
