import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { AnnouncementMarquee } from './AnnouncementMarquee';

export const TopNavBar: React.FC = () => {
    const {
        currentView,
        switchView,
        isDark,
        toggleTheme,
        cartCount,
        cartTotal,
        setIsCartOpen,
        setIsPosModalOpen,
        filters,
        setSearchQuery,
        orders
    } = useCommerce();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const exceptionsCount = orders.filter(o => o.status === 'Exception').length;

    return (
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <AnnouncementMarquee />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Brand Logo */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => switchView('storefront')}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                        </div>
                        <div>
                            <div className="font-extrabold text-lg tracking-tight leading-none text-slate-900 dark:text-white flex items-center gap-1.5">
                                APEX <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">PRO</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tracking-wider">
                                DAWN STOREFRONT &amp; OMS
                            </span>
                        </div>
                    </div>

                    {/* Desktop View Switcher */}
                    <nav className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-medium">
                        <button
                            onClick={() => switchView('storefront')}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-150 ${
                                currentView === 'storefront'
                                    ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm font-semibold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">storefront</span>
                            <span>Shopify Dawn Storefront</span>
                        </button>
                        <button
                            onClick={() => switchView('oms')}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-150 ${
                                currentView === 'oms'
                                    ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm font-semibold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">inventory</span>
                            <span>Enterprise OMS Queue</span>
                            {exceptionsCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                                    {exceptionsCount} Exception{exceptionsCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => switchView('metrics')}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-150 ${
                                currentView === 'metrics'
                                    ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-white shadow-sm font-semibold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">analytics</span>
                            <span>Business Telemetry</span>
                        </button>
                    </nav>
                </div>

                {/* Search Bar & Actions */}
                <div className="flex items-center gap-3">
                    {currentView === 'storefront' && (
                        <div className="relative hidden sm:block w-48 md:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                                search
                            </span>
                            <input
                                value={filters.searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                type="text"
                                placeholder="Search products, SKU..."
                                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                            />
                            {filters.searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* POS Simulator Trigger */}
                    <button
                        onClick={() => setIsPosModalOpen(true)}
                        title="Simulate Walk-in Physical POS Checkout"
                        className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium shadow-sm transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[16px] text-emerald-500">point_of_sale</span>
                        <span>POS Terminal</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {isDark ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {/* Slide-out Cart Button */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm shadow-brand-500/30 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                        <span className="hidden sm:inline">Cart</span>
                        <span className="w-5 h-5 rounded-full bg-white text-brand-700 font-mono font-bold text-[11px] flex items-center justify-center shadow-sm">
                            {cartCount}
                        </span>
                        <span className="hidden md:inline font-mono font-medium text-brand-100 ml-1 border-l border-brand-500/60 pl-2">
                            ${cartTotal.toFixed(2)}
                        </span>
                    </button>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined text-[22px]">menu</span>
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
                    <button
                        onClick={() => { switchView('storefront'); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-brand-500">storefront</span>
                            Shopify Dawn Storefront
                        </span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                    <button
                        onClick={() => { switchView('oms'); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-indigo-500">inventory</span>
                            OMS Fulfillment Queue
                        </span>
                        {exceptionsCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                                {exceptionsCount} Exception
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => { switchView('metrics'); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-cyan-500">analytics</span>
                            Business Telemetry &amp; KPIs
                        </span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                    <button
                        onClick={() => { setIsPosModalOpen(true); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50"
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-emerald-500">point_of_sale</span>
                            Simulate Retail POS Checkout
                        </span>
                        <span className="font-mono text-[10px] uppercase">Walk-in</span>
                    </button>
                </div>
            )}
        </header>
    );
};
