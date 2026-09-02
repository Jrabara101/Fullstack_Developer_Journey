export type ViewMode = 'storefront' | 'oms' | 'metrics';

export interface Product {
    id: number;
    sku: string;
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviewsCount: number;
    stockOnline: number;
    bufferStock: number; // Protected inventory for physical POS
    inStock: boolean;
    color: string;
    tag: string;
    description: string;
    image: string;
}

export interface CartItem extends Product {
    qty: number;
}

export interface OrderItem {
    id: number;
    name: string;
    sku: string;
    qty: number;
    price: number;
}

export interface AuditLog {
    time: string;
    actor: string;
    action: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Dispatched' | 'Fulfilled' | 'Exception' | 'Held';

export interface Order {
    id: string;
    customer: string;
    avatar: string;
    channel: string;
    channelType: 'Online' | 'In-Store' | 'B2B';
    date: string;
    status: OrderStatus;
    exceptionReason?: string;
    total: number;
    priority: 'Standard' | 'Priority' | 'Critical' | 'Immediate';
    items: OrderItem[];
    address: string;
    shippingMethod: string;
    auditLogs: AuditLog[];
}

export interface FilterState {
    category: string;
    maxPrice: number;
    inStockOnly: boolean;
    lowStockOnly: boolean;
    color: string;
    searchQuery: string;
    sort: string;
}

export interface ToastMessage {
    id: string;
    text: string;
    type?: 'info' | 'success' | 'warning' | 'error';
}
