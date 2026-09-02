import React from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const ToastContainer: React.FC = () => {
    const { toasts } = useCommerce();

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => {
                let icon = 'info';
                let iconColor = 'text-brand-400';
                if (toast.type === 'success') {
                    icon = 'check_circle';
                    iconColor = 'text-emerald-400';
                } else if (toast.type === 'warning') {
                    icon = 'warning';
                    iconColor = 'text-amber-400';
                } else if (toast.type === 'error') {
                    icon = 'error';
                    iconColor = 'text-rose-400';
                }

                return (
                    <div
                        key={toast.id}
                        className="pointer-events-auto bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-3 rounded-xl border border-slate-700 shadow-xl text-xs font-medium flex items-center gap-2 transform transition-all duration-300 animate-soft-glow"
                    >
                        <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>
                            {icon}
                        </span>
                        <span>{toast.text}</span>
                    </div>
                );
            })}
        </div>
    );
};
