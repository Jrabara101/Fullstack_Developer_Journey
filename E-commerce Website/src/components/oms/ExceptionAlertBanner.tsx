import React from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const ExceptionAlertBanner: React.FC = () => {
    const { orders, resolveException } = useCommerce();

    const exceptionOrder = orders.find(o => o.status === 'Exception');

    if (!exceptionOrder) return null;

    return (
        <div className="bg-rose-500 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-[20px] animate-bounce">
                    report_problem
                </span>
                <span>
                    <strong>High Priority Exception:</strong> Order <strong className="font-mono">{exceptionOrder.id}</strong> flagged: <em>{exceptionOrder.exceptionReason || 'Gateway Timeout'}</em>
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => resolveException(exceptionOrder.id, 'retry_payment')}
                    className="px-2.5 py-1 rounded bg-white text-rose-700 font-bold text-xs hover:bg-rose-50 transition-all shadow-sm"
                >
                    ⚡ 1-Click Retry Gateway
                </button>
                <button
                    onClick={() => resolveException(exceptionOrder.id, 'manual_verify')}
                    className="px-2.5 py-1 rounded bg-rose-700 text-white font-medium text-xs hover:bg-rose-800 transition-all"
                >
                    Manual Override
                </button>
            </div>
        </div>
    );
};
