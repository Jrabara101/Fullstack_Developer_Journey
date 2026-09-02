import React from 'react';
import { Product } from '../../types';
import { useCommerce } from '../../context/CommerceContext';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCommerce();
    const isLowStock = product.stockOnline <= 4;

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
                {/* Product Image Container */}
                <div className="relative h-52 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />

                    {/* Scarcity / Urgency Pill */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isLowStock ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-600 text-white'
                            } shadow-sm`}
                        >
                            {product.tag}
                        </span>
                    </div>

                    {/* SKU & Buffer info */}
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 backdrop-blur text-slate-200">
                        {product.sku}
                    </span>
                </div>

                {/* Product Details */}
                <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
                            {product.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                            <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                            <span>{product.rating}</span>
                            <span className="text-slate-400 text-[10px]">({product.reviewsCount})</span>
                        </div>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-brand-600 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <div className="font-extrabold text-base text-slate-900 dark:text-white font-mono">
                        ${product.price.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400 line-through font-mono">
                        ${product.originalPrice.toFixed(2)}
                    </div>
                </div>
                <button
                    onClick={() => addToCart(product.id)}
                    className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    <span>Add to Cart</span>
                </button>
            </div>
        </div>
    );
};
