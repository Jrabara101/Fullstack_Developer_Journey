import React from 'react';
import { useCommerce } from '../../context/CommerceContext';

export const FacetedFilterSidebar: React.FC = () => {
    const {
        products,
        filters,
        setMaxPrice,
        setInStockOnly,
        setLowStockOnly,
        setColor,
        resetFilters
    } = useCommerce();

    const inStockCount = products.filter(p => p.inStock).length;

    return (
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-brand-600">tune</span>
                        Faceted Filters
                    </span>
                    <button
                        onClick={resetFilters}
                        className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium"
                    >
                        Reset All
                    </button>
                </div>

                {/* Price Slider Filter */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Max Price</span>
                        <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                            ${filters.maxPrice}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="20"
                        max="350"
                        step="10"
                        value={filters.maxPrice}
                        onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                        className="w-full accent-brand-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>$20</span>
                        <span>$180</span>
                        <span>$350</span>
                    </div>
                </div>

                {/* Availability Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 block mb-2">
                        Inventory Availability
                    </span>
                    <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-900">
                        <input
                            type="checkbox"
                            checked={filters.inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                        />
                        <span>In Stock Ready to Ship ({inStockCount})</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-900">
                        <input
                            type="checkbox"
                            checked={filters.lowStockOnly}
                            onChange={(e) => setLowStockOnly(e.target.checked)}
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                        />
                        <span className="flex items-center gap-1">
                            <span>Soft-Scarcity &lt; 5 Units</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                        </span>
                    </label>
                </div>

                {/* Color Swatches */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 block mb-2">
                        Colorway Palette
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setColor('all')}
                            title="All Colors"
                            className={`w-6 h-6 rounded-full border-2 ${
                                filters.color === 'all' ? 'border-brand-500' : 'border-slate-300'
                            } bg-slate-300 flex items-center justify-center text-[10px] font-bold`}
                        >
                            ALL
                        </button>
                        <button
                            onClick={() => setColor('Black')}
                            title="Matte Black"
                            className={`w-6 h-6 rounded-full border ${
                                filters.color === 'Black' ? 'ring-2 ring-brand-500' : ''
                            } bg-slate-900 shadow-sm`}
                        ></button>
                        <button
                            onClick={() => setColor('Silver')}
                            title="Silver Platinum"
                            className={`w-6 h-6 rounded-full border ${
                                filters.color === 'Silver' ? 'ring-2 ring-brand-500' : ''
                            } bg-slate-200 shadow-sm`}
                        ></button>
                        <button
                            onClick={() => setColor('Titanium')}
                            title="Titanium Slate"
                            className={`w-6 h-6 rounded-full border ${
                                filters.color === 'Titanium' ? 'ring-2 ring-brand-500' : ''
                            } bg-indigo-900 shadow-sm`}
                        ></button>
                    </div>
                </div>

                {/* Inventory Buffer Stock Safeguard Callout */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-brand-500">verified_user</span>
                        Buffer Allocation Engine
                    </div>
                    <p>
                        Online storefront automatically retains 2 buffer safety units per SKU to prevent POS flash oversells.
                    </p>
                </div>
            </div>
        </aside>
    );
};
