import React from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const OrdersTable: React.FC = () => {
    const {
        orders,
        omsChannelFilter,
        selectedOrderId,
        setSelectedOrderId
    } = useCommerce();

    let filtered = orders;
    if (omsChannelFilter === 'exceptions') {
        filtered = orders.filter(o => o.status === 'Exception');
    } else if (omsChannelFilter !== 'all') {
        filtered = orders.filter(o => o.channel === omsChannelFilter);
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-850 z-10 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3 w-10 text-center">
                            <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                        </th>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Date / Timestamp</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Channel</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Value</th>
                        <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-800 dark:text-slate-200">
                    {filtered.map(order => {
                        const isSelected = order.id === selectedOrderId;
                        let statusClass = 'bg-amber-100 text-amber-800 border-amber-300';
                        if (order.status === 'Fulfilled') statusClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                        else if (order.status === 'Exception') statusClass = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
                        else if (order.status === 'Dispatched') statusClass = 'bg-indigo-100 text-indigo-800 border-indigo-300';

                        return (
                            <tr
                                key={order.id}
                                onClick={() => setSelectedOrderId(order.id)}
                                className={`group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                                    isSelected
                                        ? 'bg-brand-50/70 dark:bg-brand-950/40 border-l-4 border-l-brand-600'
                                        : ''
                                }`}
                            >
                                <td className="px-4 py-3 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                                </td>
                                <td className="px-4 py-3 align-middle font-mono font-bold text-brand-600 dark:text-brand-400">
                                    {order.id}
                                    <span className="block text-[10px] text-slate-400 font-sans font-normal">
                                        {order.items.length} line item{order.items.length !== 1 ? 's' : ''}
                                    </span>
                                </td>
                                <td className="px-4 py-3 align-middle text-slate-600 dark:text-slate-300">
                                    {order.date}
                                </td>
                                <td className="px-4 py-3 align-middle">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                                            {order.avatar}
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-white">{order.customer}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 align-middle">
                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                        {order.channel}
                                    </span>
                                </td>
                                <td className="px-4 py-3 align-middle">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 align-middle text-right font-mono font-bold">
                                    ${order.total.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setSelectedOrderId(order.id)}
                                        className="p-1 rounded text-slate-400 hover:text-brand-600"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
