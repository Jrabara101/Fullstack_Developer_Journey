import { Order } from '../types';

export const initialOrders: Order[] = [
    {
        id: 'ORD-99382',
        customer: 'Eleanor Shellstrop',
        avatar: 'ES',
        channel: 'Shopify US',
        channelType: 'Online',
        date: 'Oct 24, 2026 • 14:32 EST',
        status: 'Processing',
        total: 224.00,
        priority: 'Priority',
        items: [
            { id: 1, name: 'Aura ANC Wireless Headphones', sku: 'AU-ANC-BLK', qty: 1, price: 199.00 },
            { id: 2, name: 'Nylon Braided USB-C Cable (2m)', sku: 'CBL-USBC-2M', qty: 1, price: 25.00 }
        ],
        address: '123 Fake Street, Apt 4B, Phoenix, AZ 85001',
        shippingMethod: 'Expedited (2-Day)',
        auditLogs: [
            { time: '14:32:01', actor: 'Storefront Webhook', action: 'Order created via Apple Pay (Auth: #AP-8823)' },
            { time: '14:32:05', actor: 'Inventory Engine', action: 'Buffer safety hold confirmed (SKU AU-ANC-BLK -1)' },
            { time: '14:35:12', actor: 'OMS Worker #04', action: 'Moved status from Pending to Processing' }
        ]
    },
    {
        id: 'ORD-99381',
        customer: 'Jason Mendoza',
        avatar: 'JM',
        channel: 'Retail POS #3',
        channelType: 'In-Store',
        date: 'Oct 24, 2026 • 13:15 EST',
        status: 'Fulfilled',
        total: 89.00,
        priority: 'Standard',
        items: [
            { id: 3, name: 'Magnetic 3-in-1 Fast Charging Stand', sku: 'WCH-MAG-TRI', qty: 1, price: 89.00 }
        ],
        address: 'Retail Store Counter #3 (Walk-in Pickup)',
        shippingMethod: 'Immediate POS Dispense',
        auditLogs: [
            { time: '13:15:00', actor: 'POS Terminal #3', action: 'Barcode scanned & Cash Drawer verified' },
            { time: '13:15:02', actor: 'POS Sync Webhook', action: 'Synchronous inventory decrement recorded' },
            { time: '13:15:04', actor: 'System', action: 'Marked Fulfilled' }
        ]
    },
    {
        id: 'ORD-99380',
        customer: 'Tahani Al-Jamil',
        avatar: 'TA',
        channel: 'B2B Portal',
        channelType: 'B2B',
        date: 'Oct 24, 2026 • 11:05 EST',
        status: 'Exception',
        exceptionReason: 'Payment Gateway 3D-Secure Timeout (Stripe API #ETIMEDOUT)',
        total: 1450.00,
        priority: 'Critical',
        items: [
            { id: 4, name: 'Chrono Titan Smart Wellness Watch', sku: 'WCH-TITAN-X', qty: 4, price: 299.00 },
            { id: 2, name: 'Nylon Braided USB-C Cable (2m)', sku: 'CBL-USBC-2M', qty: 10, price: 25.00 }
        ],
        address: 'High Society Blvd, Suite 100, London, UK',
        shippingMethod: 'DHL Express International',
        auditLogs: [
            { time: '11:05:10', actor: 'B2B Portal', action: 'Checkout initiated ($1,450.00 invoice)' },
            { time: '11:05:42', actor: 'Gateway Router', action: '3DS challenge timed out. Flagged as EXCEPTION.' }
        ]
    },
    {
        id: 'ORD-99379',
        customer: 'Chidi Anagonye',
        avatar: 'CA',
        channel: 'Shopify US',
        channelType: 'Online',
        date: 'Oct 23, 2026 • 16:45 EST',
        status: 'Fulfilled',
        total: 120.75,
        priority: 'Standard',
        items: [
            { id: 6, name: 'Full-Grain Leather Executive Desk Mat', sku: 'DK-DESK-MAT', qty: 1, price: 49.00 },
            { id: 2, name: 'Nylon Braided USB-C Cable (2m)', sku: 'CBL-USBC-2M', qty: 2, price: 25.00 }
        ],
        address: 'University Hall, Dept of Philosophy, Boston, MA',
        shippingMethod: 'Standard Ground',
        auditLogs: [
            { time: '16:45:00', actor: 'Storefront Webhook', action: 'Order created via Credit Card' },
            { time: '17:10:00', actor: 'Warehouse Scanner', action: 'Packed in Bin #A-14' },
            { time: '18:00:00', actor: 'FedEx Webhook', action: 'Carrier picked up tracking #TRK-881928' }
        ]
    }
];
