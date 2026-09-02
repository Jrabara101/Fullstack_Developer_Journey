import React from 'react';

export const AnnouncementMarquee: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white text-xs py-1.5 px-4 flex items-center justify-between border-b border-indigo-950/40">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-2xl">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/30 text-brand-200 border border-brand-400/30 uppercase tracking-wider">
                    Flash Sale
                </span>
                <span className="font-medium text-slate-200">
                    ⚡ Use code <strong className="text-white font-mono bg-brand-600/60 px-1 rounded">DAWN20</strong> for 20% off high-fidelity gear • Free 2-day delivery on orders over $150
                </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-300 font-mono">
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    POS API Sync: <strong className="text-emerald-300">Live (42ms)</strong>
                </span>
                <span className="hidden md:inline text-slate-500">|</span>
                <span className="hidden md:flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-brand-300">security</span>
                    Buffer Stock Guard Active
                </span>
            </div>
        </div>
    );
};
