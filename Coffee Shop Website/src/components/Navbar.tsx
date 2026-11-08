import React, { useState, useEffect } from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { ShoppingBag, Sparkles, Compass, MapPin, BookOpen, Coffee, Menu as MenuIcon, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    cartCount, 
    cartTotal, 
    setIsPreOrderDrawerOpen, 
    setIsQuizOpen, 
    setIsCorkboardOpen 
  } = useCoffeeShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Sensory Menu', href: '#sensory-menu', icon: <Coffee className="w-4 h-4" /> },
    { label: 'Fresh Bakes', href: '#bake-cabinet', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Seating & Floorplan', href: '#seating-hub', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Seed-to-Cup Story', href: '#seed-to-cup', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Barista Picks', href: '#barista-picks', icon: <Compass className="w-4 h-4" /> },
    { label: 'Take-Home Beans', href: '#bean-shop', icon: <Coffee className="w-4 h-4" /> },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#FAF6F0]/90 backdrop-blur-md shadow-warm-sm border-b border-linen-hairline py-3' 
        : 'bg-[#FAF6F0]/95 backdrop-blur-sm border-b border-linen-hairline py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Wordmark & Tagline */}
          <a href="#" className="flex items-baseline gap-3 group">
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-espresso-primary group-hover:text-terracotta transition-colors">
              KÖPA
            </span>
            <span className="hidden sm:inline-block font-mono text-[11px] font-semibold tracking-wider text-oat-muted uppercase border-l border-espresso-primary/15 pl-3">
              Roastery & Bakery • Est. 2019
            </span>
          </a>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs uppercase font-medium tracking-wider text-cacao-secondary hover:text-terracotta hover:bg-canvas-parchment px-3 py-2 rounded-full transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Palate Quiz Pill */}
            <button
              onClick={() => setIsQuizOpen(true)}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-espresso-primary bg-amber-honey/15 hover:bg-amber-honey/25 border border-amber-honey/30 px-3 py-2 rounded-full transition-all"
              title="Take 20-second Palate Quiz to find your ideal bean"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Find My Bean</span>
            </button>

            {/* Walk-In Pre-Order Drawer Trigger */}
            <button
              onClick={() => setIsPreOrderDrawerOpen(true)}
              className="relative flex items-center gap-2 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-warm-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Walk-In Pre-Order</span>
              <span className="sm:hidden">Order</span>
              
              {cartCount > 0 && (
                <span className="bg-espresso-primary text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {cartCount} • ${cartTotal.toFixed(2)}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-espresso-primary hover:bg-canvas-parchment rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-linen-hairline pb-4 space-y-1 bg-surface-ceramic p-4 rounded-2xl shadow-warm-lg animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-espresso-primary hover:bg-canvas-parchment rounded-xl transition-colors"
              >
                <span className="text-terracotta">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
            <div className="pt-2 border-t border-linen-hairline flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsQuizOpen(true);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-espresso-primary bg-amber-honey/15 rounded-xl border border-amber-honey/30"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                Find My Morning Bean (20s Quiz)
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCorkboardOpen(true);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-cacao-secondary bg-canvas-parchment rounded-xl"
              >
                <Coffee className="w-4 h-4 text-terracotta" />
                View Pay-It-Forward Corkboard
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

