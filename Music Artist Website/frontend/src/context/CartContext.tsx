import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { CartItem, MerchProduct, MerchVariant, Order, TourDate } from '../types';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  fulfillmentMode: 'ship_to_address' | 'venue_pickup';
  pickupTourDateId: string;
  subtotalCents: number;
  bundleDiscountCents: number;
  shippingCents: number;
  totalCents: number;
  hasBundleSavings: boolean;
  completedOrder: Order | null;
  isCheckingOut: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: MerchProduct, variant: MerchVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setFulfillmentMode: (mode: 'ship_to_address' | 'venue_pickup') => void;
  setPickupTourDateId: (id: string) => void;
  executeCheckout: (fanEmail: string, address?: Record<string, string>) => Promise<Order>;
  dismissOrderSuccessModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode; defaultTourDate?: TourDate }> = ({
  children,
  defaultTourDate
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [fulfillmentMode, setFulfillmentMode] = useState<'ship_to_address' | 'venue_pickup'>('ship_to_address');
  const [pickupTourDateId, setPickupTourDateId] = useState<string>(defaultTourDate?.id || 'tour-sf-2026');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addItem = useCallback((product: MerchProduct, variant: MerchVariant, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.variant.id === variant.id);
      if (existing) {
        return prev.map(i =>
          i.variant.id === variant.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, variant, quantity }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems(prev => prev.filter(i => i.variant.id !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.variant.id === variantId ? { ...i, quantity } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Compute Totals & Bundles
  const { subtotalCents, hasBundleSavings, bundleDiscountCents, shippingCents, totalCents } = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.variant.price_cents * item.quantity, 0);

    const hasVinyl = items.some(i => i.product.category === 'vinyl' || i.product.category === 'bundle');
    const hasApparel = items.some(i => i.product.category === 'apparel' || i.product.category === 'poster_zine');

    const bundleEligible = hasVinyl && hasApparel;
    const discount = bundleEligible ? Math.round(subtotal * 0.15) : 0;
    const shipping = fulfillmentMode === 'venue_pickup' || items.length === 0 ? 0 : 950; // $9.50
    const total = Math.max(0, subtotal - discount + shipping);

    return {
      subtotalCents: subtotal,
      hasBundleSavings: bundleEligible,
      bundleDiscountCents: discount,
      shippingCents: shipping,
      totalCents: total
    };
  }, [items, fulfillmentMode]);

  const executeCheckout = useCallback(async (fanEmail: string, address?: Record<string, string>): Promise<Order> => {
    setIsCheckingOut(true);

    try {
      // Attempt backend checkout
      const response = await fetch('http://localhost:4000/api/v1/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fan_email: fanEmail,
          fulfillment_mode: fulfillmentMode,
          pickup_tour_date_id: pickupTourDateId,
          items: items.map(i => ({
            product_id: i.product.id,
            variant_id: i.variant.id,
            quantity: i.quantity
          })),
          shipping_address: address || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCompletedOrder(data.order);
        clearCart();
        setIsCartOpen(false);
        setIsCheckingOut(false);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        return data.order;
      }
    } catch {
      console.warn('Backend unavailable, running local simulation checkout');
    }

    // Local Fallback Simulation
    const orderNumber = `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const hasVinylOrLP = items.some(i => i.product.category === 'vinyl' || i.product.category === 'bundle');

    const simulatedOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      fan_email: fanEmail,
      fulfillment_mode: fulfillmentMode,
      pickup_tour_date_id: fulfillmentMode === 'venue_pickup' ? pickupTourDateId : null,
      subtotal_cents: subtotalCents,
      bundle_discount_cents: bundleDiscountCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      items: items.map(i => ({
        product_id: i.product.id,
        product_title: i.product.title,
        variant_id: i.variant.id,
        variant_name: i.variant.variant_name,
        unit_price_cents: i.variant.price_cents,
        quantity: i.quantity,
        total_price_cents: i.variant.price_cents * i.quantity
      })),
      digital_vault_token: hasVinylOrLP ? `vault_tok_${Math.random().toString(36).substring(2, 18)}` : null,
      venue_pickup_pass: fulfillmentMode === 'venue_pickup' ? {
        pass_id: `pass-${Date.now()}`,
        order_number: orderNumber,
        tour_date_id: pickupTourDateId,
        city: "San Francisco, CA",
        venue_name: "The Regency Ballroom",
        show_date: "2026-11-20T20:00:00Z",
        booth: "Merch Booth #2 (Main Concourse Floor)",
        qr_code_data: `VENUE-PICKUP-${orderNumber}-SECURE-PASS`,
        status: "issued",
        fan_email: fanEmail,
        perks: ["Line-Skip Express Lane", "Pre-Packed Gatefold Bag", "Zero Handling Damage"]
      } : null,
      status: 'paid',
      created_at: new Date().toISOString()
    };

    setCompletedOrder(simulatedOrder);
    clearCart();
    setIsCartOpen(false);
    setIsCheckingOut(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    return simulatedOrder;
  }, [fulfillmentMode, pickupTourDateId, items, subtotalCents, bundleDiscountCents, shippingCents, totalCents, clearCart]);

  const dismissOrderSuccessModal = useCallback(() => {
    setCompletedOrder(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        fulfillmentMode,
        pickupTourDateId,
        subtotalCents,
        bundleDiscountCents,
        shippingCents,
        totalCents,
        hasBundleSavings,
        completedOrder,
        isCheckingOut,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setFulfillmentMode,
        setPickupTourDateId,
        executeCheckout,
        dismissOrderSuccessModal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

