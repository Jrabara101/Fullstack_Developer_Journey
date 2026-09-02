import React from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { FacetedFilterSidebar } from './FacetedFilterSidebar';
import { ProductCard } from './ProductCard';

export const ProductCatalogGrid: React.FC = () => {
    const {
        products,
        filteredProducts,
        filters,
        setCategory,
        setSort,
        resetFilters,
        setMaxPrice,
        setInStockOnly,
        setLowStockOnly,
        setSearchQuery
    } = useCommerce();

    const categories = ['all', 'Audio', 'Accessories', 'Smart Wear', 'Desk Studio'];

    // Active chips calculation
    const activeChips: { label: string; clear: () => void }[] = [];
    if (filters.category !== 'all') {
        activeChips.push({ label: `Category: ${filters.category}`, clear: () => setCategory('all') });
    }
    if (filters.maxPrice < 350) {
        activeChips.push({ label: `Max Price: $${filters.maxPrice}`, clear: () => setMaxPrice(350) });
    }
    if (filters.inStockOnly) {
        activeChips.push({ label: `In Stock Only`, clear: () => setInStockOnly(false) });
    }
    if (filters.lowStockOnly) {
        activeChips.push({ label: `Low Stock Only`, clear: () => setLowStockOnly(false) });
    }
    if (filters.searchQuery) {
        activeChips.push({ label: `Search: "${filters.searchQuery}"`, clear: () => setSearchQuery('') });
    }

    return (
        <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
            {/* Catalog Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Product Catalog
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Showing <span className="font-bold text-brand-600 dark:text-brand-400 font-mono">{filteredProducts.length} of {products.length}</span> active products • Asynchronous URL query state enabled
                    </p>
                </div>

                {/* Categories & Sorting Selector */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Category quick buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                        {categories.map(cat => {
                            const count = cat === 'all'
                                ? products.length
                                : products.filter(p => p.category === cat).length;
                            const isActive = filters.category === cat;

                            return (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                        isActive
                                            ? 'border border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold'
                                            : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-300'
                                    }`}
                                >
                                    {cat === 'all' ? 'All' : cat} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative inline-block text-left shrink-0">
                        <select
                            value={filters.sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                            <option value="featured">Sort: Featured</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                            <option value="scarcity">Inventory Urgency (Low Stock First)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Catalog Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                <FacetedFilterSidebar />

                <div className="lg:col-span-9">
                    {/* Active Filter Chips */}
                    {activeChips.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-xs text-slate-400 font-medium">Active Filters:</span>
                            {activeChips.map((chip, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-slate-700"
                                >
                                    {chip.label}
                                    <button
                                        onClick={chip.clear}
                                        className="hover:text-rose-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">
                                filter_alt_off
                            </span>
                            <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                No Matching Products Found
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                                Try relaxing your price filters or search keywords to view available items.
                            </p>
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
