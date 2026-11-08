import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  CartItem, 
  MenuItem, 
  PastryItem, 
  CoffeeBeanBag, 
  MilkOption, 
  MoodCraving, 
  TimeOfDayPhase, 
  SeatingZone, 
  CommunityCup, 
  ArrivalMode,
  WeatherInfo
} from '../types';
import { 
  MENU_ITEMS, 
  PASTRY_ITEMS, 
  COFFEE_BEANS, 
  SEATING_ZONES, 
  COMMUNITY_CUPS_INITIAL, 
  TURNTABLE_TRACKS, 
  WEATHER_PRESETS 
} from '../data/mockData';

interface CoffeeShopContextType {
  // Menu & filters
  menuItems: MenuItem[];
  pastryItems: PastryItem[];
  beanBags: CoffeeBeanBag[];
  activeMood: MoodCraving;
  setActiveMood: (mood: MoodCraving) => void;
  milkPreference: MilkOption;
  setMilkPreference: (milk: MilkOption) => void;
  dietaryFilter: 'all' | 'gluten-free' | 'vegan';
  setDietaryFilter: (filter: 'all' | 'gluten-free' | 'vegan') => void;

  // Time & Weather atmospheric shift
  timeOfDay: TimeOfDayPhase;
  setTimeOfDay: (phase: TimeOfDayPhase) => void;
  weather: WeatherInfo;

  // Turntable
  currentTrackIndex: number;
  isPlayingVinyl: boolean;
  toggleVinyl: () => void;
  nextVinylTrack: () => void;

  // Seating & Floorplan
  selectedZone: SeatingZone;
  setSelectedZone: (zone: SeatingZone) => void;
  allZones: SeatingZone[];

  // Cart & Arrival-Timed Pre-Order
  cart: CartItem[];
  addToCart: (item: {
    id: string;
    name: string;
    price: number;
    itemType: 'drink' | 'pastry' | 'bean';
    milk?: MilkOption;
    temp?: 'hot' | 'iced';
    pairedPastry?: { id: string; name: string; price: number };
  }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  arrivalMode: ArrivalMode;
  setArrivalMode: (mode: ArrivalMode) => void;
  getPrepScheduleEstimate: () => { prepStartString: string; targetReadyString: string; message: string };

  // Modals & Drawers
  isPreOrderDrawerOpen: boolean;
  setIsPreOrderDrawerOpen: (open: boolean) => void;
  cupAnatomyDrink: MenuItem | null;
  setCupAnatomyDrink: (drink: MenuItem | null) => void;
  brewCompanionBean: CoffeeBeanBag | null;
  setBrewCompanionBean: (bean: CoffeeBeanBag | null) => void;
  isQuizOpen: boolean;
  setIsQuizOpen: (open: boolean) => void;
  isCorkboardOpen: boolean;
  setIsCorkboardOpen: (open: boolean) => void;

  // Pay-it-Forward Community Board
  communityCups: CommunityCup[];
  addCommunityCup: (from: string, note: string, drinkName: string, amount: number) => void;
  claimCommunityCup: (id: string, name: string) => void;

  // Fresh bake elapsed minutes
  pastryBakeMinutes: Record<string, number>;
}

const CoffeeShopContext = createContext<CoffeeShopContextType | undefined>(undefined);

export const CoffeeShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMood, setActiveMood] = useState<MoodCraving>('all');
  const [milkPreference, setMilkPreference] = useState<MilkOption>('oat');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'gluten-free' | 'vegan'>('all');
  
  // Initialize time of day based on current local hour
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayPhase>(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 15) return 'midday';
    if (hour >= 15 && hour < 18) return 'golden-hour';
    return 'evening-lounge';
  });

  const weather = WEATHER_PRESETS[timeOfDay] || WEATHER_PRESETS['golden-hour'];

  // Turntable Vinyl state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingVinyl, setIsPlayingVinyl] = useState(true);

  const toggleVinyl = () => setIsPlayingVinyl(prev => !prev);
  const nextVinylTrack = () => setCurrentTrackIndex(prev => (prev + 1) % TURNTABLE_TRACKS.length);

  // Floorplan
  const [selectedZone, setSelectedZone] = useState<SeatingZone>(SEATING_ZONES[0]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [arrivalMode, setArrivalMode] = useState<ArrivalMode>('walking-5');
  const [isPreOrderDrawerOpen, setIsPreOrderDrawerOpen] = useState(false);

  // Modals
  const [cupAnatomyDrink, setCupAnatomyDrink] = useState<MenuItem | null>(null);
  const [brewCompanionBean, setBrewCompanionBean] = useState<CoffeeBeanBag | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCorkboardOpen, setIsCorkboardOpen] = useState(false);

  // Community Cups
  const [communityCups, setCommunityCups] = useState<CommunityCup[]>(COMMUNITY_CUPS_INITIAL);

  // Fresh bake timer tracking
  const [pastryBakeMinutes, setPastryBakeMinutes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    PASTRY_ITEMS.forEach(p => {
      initial[p.id] = p.bakedMinutesAgo;
    });
    return initial;
  });

  // Increment bake timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setPastryBakeMinutes(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          next[k] = next[k] + 1;
        });
        return next;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (item: {
    id: string;
    name: string;
    price: number;
    itemType: 'drink' | 'pastry' | 'bean';
    milk?: MilkOption;
    temp?: 'hot' | 'iced';
    pairedPastry?: { id: string; name: string; price: number };
  }) => {
    let priceAdjust = item.price;
    if (item.milk === 'almond') priceAdjust += 0.50;

    const cartItemId = `${item.id}-${item.milk || 'none'}-${item.temp || 'std'}-${Date.now()}`;
    const newCartItem: CartItem = {
      cartItemId,
      itemId: item.id,
      itemType: item.itemType,
      name: item.name,
      price: priceAdjust,
      milkChoice: item.milk || milkPreference,
      tempChoice: item.temp || 'hot',
      quantity: 1,
      pairedPastry: item.pairedPastry
    };

    setCart(prev => [...prev, newCartItem]);
    setIsPreOrderDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(c => c.cartItemId !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.cartItemId === cartItemId) {
        const newQty = c.quantity + delta;
        return newQty > 0 ? { ...c, quantity: newQty } : null;
      }
      return c;
    }).filter(Boolean) as CartItem[]);
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity + (item.pairedPastry ? item.quantity : 0), 0);

  const cartTotal = cart.reduce((sum, item) => {
    let itemTotal = item.price * item.quantity;
    if (item.pairedPastry) {
      itemTotal += item.pairedPastry.price * item.quantity;
    }
    return sum + itemTotal;
  }, 0);

  // Arrival-Synced Barista Prep Scheduler
  const getPrepScheduleEstimate = () => {
    const now = new Date();
    let etaMinutes = 5;
    if (arrivalMode === 'walking-5') etaMinutes = 5;
    if (arrivalMode === 'walking-10') etaMinutes = 10;
    if (arrivalMode === 'biking-10') etaMinutes = 10;
    if (arrivalMode === 'dine-in-table') etaMinutes = 3;
    if (arrivalMode === 'curbside-15') etaMinutes = 15;

    // Barista queue latency: e.g. 2 minutes to pull shots & steam milk
    const prepStartMin = Math.max(1, etaMinutes - 2);
    const readyDate = new Date(now.getTime() + etaMinutes * 60000);
    const prepStartDate = new Date(now.getTime() + prepStartMin * 60000);

    const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    let message = '';
    if (arrivalMode === 'dine-in-table') {
      message = `We'll hand-deliver directly to your seat at Table 4 within ~4 minutes.`;
    } else {
      message = `Our baristas will start pulling your shots and steaming milk at ${formatTime(prepStartDate)} so your cup finishes pouring right as you walk through our doors at ${formatTime(readyDate)}.`;
    }

    return {
      prepStartString: formatTime(prepStartDate),
      targetReadyString: formatTime(readyDate),
      message
    };
  };

  const addCommunityCup = (from: string, note: string, drinkName: string, amount: number) => {
    const colors: ('yellow' | 'sage' | 'peach' | 'amber')[] = ['peach', 'yellow', 'sage', 'amber'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newCup: CommunityCup = {
      id: `cup-${Date.now()}`,
      from: from || 'A Friendly Neighbor',
      recipientNote: note,
      drinkName,
      amount,
      timestamp: 'Just now',
      isClaimed: false,
      stickyColor: randomColor
    };
    setCommunityCups(prev => [newCup, ...prev]);
  };

  const claimCommunityCup = (id: string, name: string) => {
    setCommunityCups(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          isClaimed: true,
          claimedBy: `Claimed by ${name || 'a grateful neighbor'} just now`
        };
      }
      return c;
    }));
  };

  return (
    <CoffeeShopContext.Provider value={{
      menuItems: MENU_ITEMS,
      pastryItems: PASTRY_ITEMS,
      beanBags: COFFEE_BEANS,
      activeMood,
      setActiveMood,
      milkPreference,
      setMilkPreference,
      dietaryFilter,
      setDietaryFilter,
      timeOfDay,
      setTimeOfDay,
      weather,
      currentTrackIndex,
      isPlayingVinyl,
      toggleVinyl,
      nextVinylTrack,
      selectedZone,
      setSelectedZone,
      allZones: SEATING_ZONES,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartCount,
      cartTotal,
      arrivalMode,
      setArrivalMode,
      getPrepScheduleEstimate,
      isPreOrderDrawerOpen,
      setIsPreOrderDrawerOpen,
      cupAnatomyDrink,
      setCupAnatomyDrink,
      brewCompanionBean,
      setBrewCompanionBean,
      isQuizOpen,
      setIsQuizOpen,
      isCorkboardOpen,
      setIsCorkboardOpen,
      communityCups,
      addCommunityCup,
      claimCommunityCup,
      pastryBakeMinutes
    }}>
      {children}
    </CoffeeShopContext.Provider>
  );
};

export const useCoffeeShop = () => {
  const context = useContext(CoffeeShopContext);
  if (!context) {
    throw new Error('useCoffeeShop must be used within a CoffeeShopProvider');
  }
  return context;
};
