import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, OrderStatus, FilterState, ViewMode, ToastMessage } from '../types';
import { initialProducts } from '../data/products';
import { initialOrders } from '../data/mockOrders';

interface CommerceContextType {
    // Navigation & Views
    currentView: ViewMode;
    switchView: (view: ViewMode) => void;
    isDark: boolean;
    toggleTheme: () => void;

    // Catalog & Filters
    products: Product[];
    filteredProducts: Product[];
    filters: FilterState;
    setCategory: (category: string) => void;
    setMaxPrice: (price: number) => void;
    setInStockOnly: (val: boolean) => void;
    setLowStockOnly: (val: boolean) => void;
    setColor: (color: string) => void;
    setSearchQuery: (query: string) => void;
    setSort: (sort: string) => void;
    resetFilters: () => void;

    // Cart & Checkout
    cart: CartItem[];
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    addToCart: (productId: number) => void;
    updateCartQty: (productId: number, delta: number) => void;
    appliedPromo: string | null;
    applyPromoCode: (code: string) => boolean;
    reservationSeconds: number;
    cartCount: number;
    cartSubtotal: number;
    cartDiscount: number;
    cartShipping: number;
    cartTotal: number;
    isExpressModalOpen: boolean;
    setIsExpressModalOpen: (open: boolean) => void;
    submitExpressOrder: () => Promise<string>;

    // OMS Operations
    orders: Order[];
    selectedOrderId: string;
    setSelectedOrderId: (id: string) => void;
    selectedOrder: Order | undefined;
    omsChannelFilter: string;
    setOmsChannelFilter: (channel: string) => void;
    advanceOrderStatus: (newStatus: OrderStatus) => void;
    resolveException: (orderId: string, actionType: 'retry_payment' | 'manual_verify') => void;
    injectSyntheticException: () => void;
    exportOrdersCsv: () => void;

    // POS Simulator
    isPosModalOpen: boolean;
    setIsPosModalOpen: (open: boolean) => void;
    executePosCheckout: (productId: number, qty: number) => void;

    // Live Telemetry & Feedback
    liveLogs: { time: string; msg: string; color: string }[];
    toasts: ToastMessage[];
    addToast: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // View & Theme
    const [currentView, setCurrentView] = useState<ViewMode>('storefront');
    const [isDark, setIsDark] = useState<boolean>(() => {
        return localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    // Theme effect
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(prev => !prev);

    // Products & Inventory
    const [products, setProducts] = useState<Product[]>(initialProducts);

    // URL Query Synchronized Filter State
    const [filters, setFilters] = useState<FilterState>(() => {
        const params = new URLSearchParams(window.location.search);
        return {
            category: params.get('category') || 'all',
            maxPrice: params.get('maxPrice') ? parseFloat(params.get('maxPrice')!) : 350,
            inStockOnly: params.get('inStock') === 'true',
            lowStockOnly: params.get('lowStock') === 'true',
            color: params.get('color') || 'all',
            searchQuery: params.get('search') || '',
            sort: params.get('sort') || 'featured'
        };
    });

    // Sync state to URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.category !== 'all') params.set('category', filters.category);
        if (filters.maxPrice < 350) params.set('maxPrice', filters.maxPrice.toString());
        if (filters.inStockOnly) params.set('inStock', 'true');
        if (filters.lowStockOnly) params.set('lowStock', 'true');
        if (filters.color !== 'all') params.set('color', filters.color);
        if (filters.searchQuery) params.set('search', filters.searchQuery);
        if (filters.sort !== 'featured') params.set('sort', filters.sort);

        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', newUrl);
    }, [filters]);

    // Filtered Products computation
    const filteredProducts = products.filter(p => {
        if (filters.category !== 'all' && p.category !== filters.category) return false;
        if (p.price > filters.maxPrice) return false;
        if (filters.inStockOnly && !p.inStock) return false;
        if (filters.lowStockOnly && p.stockOnline >= 5) return false;
        if (filters.color !== 'all' && p.color !== filters.color) return false;
        if (filters.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            const matches = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
            if (!matches) return false;
        }
        return true;
    }).sort((a, b) => {
        if (filters.sort === 'price-asc') return a.price - b.price;
        if (filters.sort === 'price-desc') return b.price - a.price;
        if (filters.sort === 'rating') return b.rating - a.rating;
        if (filters.sort === 'scarcity') return a.stockOnline - b.stockOnline;
        return 0;
    });

    // Filter Setters
    const setCategory = (category: string) => setFilters(prev => ({ ...prev, category }));
    const setMaxPrice = (maxPrice: number) => setFilters(prev => ({ ...prev, maxPrice }));
    const setInStockOnly = (inStockOnly: boolean) => setFilters(prev => ({ ...prev, inStockOnly }));
    const setLowStockOnly = (lowStockOnly: boolean) => setFilters(prev => ({ ...prev, lowStockOnly }));
    const setColor = (color: string) => setFilters(prev => ({ ...prev, color }));
    const setSearchQuery = (searchQuery: string) => setFilters(prev => ({ ...prev, searchQuery }));
    const setSort = (sort: string) => setFilters(prev => ({ ...prev, sort }));
    const resetFilters = () => setFilters({
        category: 'all',
        maxPrice: 350,
        inStockOnly: false,
        lowStockOnly: false,
        color: 'all',
        searchQuery: '',
        sort: 'featured'
    });

    // Cart & Checkout State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
    const [reservationSeconds, setReservationSeconds] = useState<number>(600); // 10:00
    const [isExpressModalOpen, setIsExpressModalOpen] = useState<boolean>(false);

    // Live reservation countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setReservationSeconds(prev => {
                if (prev > 0) return prev - 1;
                return 0;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Cart Calculations
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const cartDiscount = appliedPromo === 'DAWN20' ? cartSubtotal * 0.20 : 0;
    const freeShippingThreshold = 150.00;
    const cartShipping = (cartSubtotal - cartDiscount >= freeShippingThreshold || cartCount === 0) ? 0.00 : 15.00;
    const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartShipping);

    const addToCart = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existing = cart.find(i => i.id === productId);
        if (existing) {
            if (existing.qty >= product.stockOnline) {
                addToast(`⚠️ Only ${product.stockOnline} units available online (${product.bufferStock} reserved for physical POS).`, 'warning');
                return;
            }
            setCart(prev => prev.map(i => i.id === productId ? { ...i, qty: i.qty + 1 } : i));
        } else {
            setCart(prev => [...prev, { ...product, qty: 1 }]);
        }

        setIsCartOpen(true);
        addToast(`Added ${product.name} to cart! (🔒 Reserved for 10:00)`, 'success');
        addLog(`CART_RESERVE: Session locked 1x ${product.sku} (Buffer safety active)`, 'text-brand-300');
    };

    const updateCartQty = (productId: number, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.id === productId) {
                    const newQty = item.qty + delta;
                    return newQty > 0 ? { ...item, qty: newQty } : null;
                }
                return item;
            }).filter(Boolean) as CartItem[];
        });
    };

    const applyPromoCode = (code: string) => {
        if (code.trim().toUpperCase() === 'DAWN20') {
            setAppliedPromo('DAWN20');
            addToast("Promo Code DAWN20 Applied! 20% discount unlocked.", 'success');
            return true;
        } else {
            addToast("Invalid Promo Code. Try DAWN20.", 'error');
            return false;
        }
    };

    // OMS State
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-99382');
    const [omsChannelFilter, setOmsChannelFilter] = useState<string>('all');
    const [isPosModalOpen, setIsPosModalOpen] = useState<boolean>(false);

    const selectedOrder = orders.find(o => o.id === selectedOrderId);

    const submitExpressOrder = async (): Promise<string> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const subtotal = cartSubtotal;
                const discount = cartDiscount;
                const shipping = cartShipping;
                const tax = (subtotal - discount) * 0.085;
                const grandTotal = subtotal - discount + shipping + tax;

                const newOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
                const newOrder: Order = {
                    id: newOrderId,
                    customer: 'Eleanor Shellstrop',
                    avatar: 'ES',
                    channel: 'Shopify US',
                    channelType: 'Online',
                    date: 'Just Now',
                    status: 'Processing',
                    total: grandTotal,
                    priority: 'Priority',
                    items: cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        sku: item.sku,
                        qty: item.qty,
                        price: item.price
                    })),
                    address: '123 Fake Street, Phoenix, AZ 85001',
                    shippingMethod: 'Expedited (2-Day)',
                    auditLogs: [
                        { time: new Date().toLocaleTimeString(), actor: '1-Tap Express Pay', action: `Order authorized via Apple Pay ($${grandTotal.toFixed(2)})` },
                        { time: new Date().toLocaleTimeString(), actor: 'OMS Ingestion', action: 'Order dispatched to fulfillment queue' }
                    ]
                };

                // Deduct stock
                setProducts(prev => prev.map(p => {
                    const cartItem = cart.find(c => c.id === p.id);
                    if (cartItem) {
                        return { ...p, stockOnline: Math.max(0, p.stockOnline - cartItem.qty) };
                    }
                    return p;
                }));

                setOrders(prev => [newOrder, ...prev]);
                setSelectedOrderId(newOrderId);
                setCart([]);
                setAppliedPromo(null);
                setIsExpressModalOpen(false);
                setIsCartOpen(false);

                addToast(`🎉 Order ${newOrderId} Placed Successfully! Synced to OMS.`, 'success');
                addLog(`NEW_ORDER: ${newOrderId} ingested via 1-Tap Checkout ($${grandTotal.toFixed(2)})`, 'text-cyan-400');

                resolve(newOrderId);
            }, 800);
        });
    };

    const advanceOrderStatus = (newStatus: OrderStatus) => {
        if (!selectedOrder) return;
        const prev = selectedOrder.status;

        setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === selectedOrderId) {
                return {
                    ...order,
                    status: newStatus,
                    auditLogs: [
                        {
                            time: new Date().toLocaleTimeString(),
                            actor: 'OMS Supervisor',
                            action: `Transitioned state: ${prev} ➔ ${newStatus}`
                        },
                        ...order.auditLogs
                    ]
                };
            }
            return order;
        }));

        addToast(`Order ${selectedOrderId} updated to ${newStatus}`, 'info');
        addLog(`STATUS_UPDATE: ${selectedOrderId} is now ${newStatus}`, 'text-amber-400');
    };

    const resolveException = (orderId: string, actionType: 'retry_payment' | 'manual_verify') => {
        setOrders(prevOrders => prevOrders.map(order => {
            if (order.id === orderId) {
                return {
                    ...order,
                    status: 'Processing',
                    auditLogs: [
                        {
                            time: new Date().toLocaleTimeString(),
                            actor: actionType === 'retry_payment' ? 'Payment Gateway Agent' : 'Risk Officer',
                            action: actionType === 'retry_payment'
                                ? 'Resolved: 3DS Challenge re-authenticated successfully. Captured $1,450.00.'
                                : 'Manual compliance override applied.'
                        },
                        ...order.auditLogs
                    ]
                };
            }
            return order;
        }));

        addToast(`⚡ Gateway Retry Successful for ${orderId}! Order moved to Processing.`, 'success');
        addLog(`EXCEPTION_RESOLVED: ${orderId} verified and unlocked.`, 'text-emerald-400');
    };

    const injectSyntheticException = () => {
        const syntheticId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        const syntheticOrder: Order = {
            id: syntheticId,
            customer: 'Synthetic Test Merchant',
            avatar: 'ST',
            channel: 'Shopify US',
            channelType: 'Online',
            date: 'Just Now',
            status: 'Exception',
            exceptionReason: 'Velocity flag: 3 charge attempts in 4 seconds. EXCEPTION raised.',
            total: 399.00,
            priority: 'Critical',
            items: [
                { id: 1, name: 'Aura ANC Wireless Headphones', sku: 'AU-ANC-BLK', qty: 2, price: 199.00 }
            ],
            address: '777 Test Avenue, Austin, TX',
            shippingMethod: 'Overnight Air',
            auditLogs: [
                { time: new Date().toLocaleTimeString(), actor: 'Fraud Radar', action: 'Velocity flag: 3 charge attempts in 4 seconds. EXCEPTION raised.' }
            ]
        };

        setOrders(prev => [syntheticOrder, ...prev]);
        setSelectedOrderId(syntheticId);
        addToast(`⚠️ Synthetic Exception Injected: ${syntheticId}`, 'warning');
        addLog(`EXCEPTION_TRIGGER: ${syntheticId} flagged by Fraud Radar.`, 'text-rose-400');
    };

    const exportOrdersCsv = () => {
        let csv = 'Order ID,Customer,Channel,Status,Value,Date\n';
        orders.forEach(o => {
            csv += `"${o.id}","${o.customer}","${o.channel}","${o.status}",${o.total},"${o.date}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Apex_OMS_Orders_${Date.now()}.csv`;
        a.click();
        addToast("Orders exported to CSV successfully.", 'info');
    };

    const executePosCheckout = (productId: number, qty: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Synchronously decrement stock
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockOnline: Math.max(0, p.stockOnline - qty) } : p));

        const posOrderId = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
        const newPosOrder: Order = {
            id: posOrderId,
            customer: 'Walk-in Retail Guest',
            avatar: 'WI',
            channel: 'Retail POS #3',
            channelType: 'In-Store',
            date: 'Just Now (Counter Scan)',
            status: 'Fulfilled',
            total: product.price * qty,
            priority: 'Immediate',
            items: [
                { id: product.id, name: product.name, sku: product.sku, qty, price: product.price }
            ],
            address: 'Terminal #3 Register Counter',
            shippingMethod: 'Instant Walk-in Dispense',
            auditLogs: [
                { time: new Date().toLocaleTimeString(), actor: 'Barcode Scanner', action: `Scanned SKU ${product.sku} (Qty: ${qty})` },
                { time: new Date().toLocaleTimeString(), actor: 'POS Cash Drawer', action: `Payment cleared ($${(product.price * qty).toFixed(2)})` },
                { time: new Date().toLocaleTimeString(), actor: 'Inventory Reconciler', action: 'Synchronous decrement applied across online store.' }
            ]
        };

        setOrders(prev => [newPosOrder, ...prev]);
        setSelectedOrderId(posOrderId);
        setIsPosModalOpen(false);

        addToast(`✅ Physical POS Sale Processed: ${posOrderId}. Online catalog updated instantly!`, 'success');
        addLog(`POS_SALE: ${posOrderId} completed at Terminal #3 (-${qty} ${product.sku})`, 'text-emerald-400');
    };

    // Live Logs & Toasts
    const [liveLogs, setLiveLogs] = useState<{ time: string; msg: string; color: string }[]>([
        { time: '08:42:10', msg: 'SYNC_OK: Heartbeat 42ms • Inventory buffer intact.', color: 'text-emerald-400' },
        { time: '08:45:22', msg: 'POS_SCAN: Barcode 79284910 registered at Terminal #3.', color: 'text-cyan-400' },
        { time: '08:50:01', msg: 'CART_RESERVE: Session #883 locked 1x AU-ANC-BLK (10m).', color: 'text-brand-300' }
    ]);

    const addLog = (msg: string, color: string) => {
        const time = new Date().toLocaleTimeString();
        setLiveLogs(prev => [{ time, msg, color }, ...prev]);
    };

    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    };

    const switchView = (view: ViewMode) => {
        setCurrentView(view);
    };

    return (
        <CommerceContext.Provider
            value={{
                currentView,
                switchView,
                isDark,
                toggleTheme,
                products,
                filteredProducts,
                filters,
                setCategory,
                setMaxPrice,
                setInStockOnly,
                setLowStockOnly,
                setColor,
                setSearchQuery,
                setSort,
                resetFilters,
                cart,
                isCartOpen,
                setIsCartOpen,
                addToCart,
                updateCartQty,
                appliedPromo,
                applyPromoCode,
                reservationSeconds,
                cartCount,
                cartSubtotal,
                cartDiscount,
                cartShipping,
                cartTotal,
                isExpressModalOpen,
                setIsExpressModalOpen,
                submitExpressOrder,
                orders,
                selectedOrderId,
                setSelectedOrderId,
                selectedOrder,
                omsChannelFilter,
                setOmsChannelFilter,
                advanceOrderStatus,
                resolveException,
                injectSyntheticException,
                exportOrdersCsv,
                isPosModalOpen,
                setIsPosModalOpen,
                executePosCheckout,
                liveLogs,
                toasts,
                addToast
            }}
        >
            {children}
        </CommerceContext.Provider>
    );
};

export const useCommerce = () => {
    const context = useContext(CommerceContext);
    if (!context) {
        throw new Error('useCommerce must be used within a CommerceProvider');
    }
    return context;
};
