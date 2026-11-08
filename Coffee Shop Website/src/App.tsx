import React from 'react';
import { CoffeeShopProvider } from './context/CoffeeShopContext';
import { LivePulseBar } from './components/LivePulseBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SensoryMenuSection } from './components/SensoryMenuSection';
import { FreshBakeCabinet } from './components/FreshBakeCabinet';
import { LocationAndSeatingHub } from './components/LocationAndSeatingHub';
import { SeedToCupScrollytelling } from './components/SeedToCupScrollytelling';
import { BaristaObsessions } from './components/BaristaObsessions';
import { BeanShopSection } from './components/BeanShopSection';
import { Footer } from './components/Footer';

// Modals & Drawers
import { CupAnatomyModal } from './components/CupAnatomyModal';
import { FindMyBeanQuizModal } from './components/FindMyBeanQuizModal';
import { HomeBrewCompanionModal } from './components/HomeBrewCompanionModal';
import { PayItForwardCorkboardModal } from './components/PayItForwardCorkboardModal';
import { PreOrderDrawer } from './components/PreOrderDrawer';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas-oat text-espresso-primary flex flex-col font-sans selection:bg-terracotta selection:text-white">
      {/* 1. Top Neighborhood Live Pulse Ribbon */}
      <LivePulseBar />

      {/* 2. Frosted Oat Sticky Navigation */}
      <Navbar />

      {/* 3. Cozy Atmosphere Hero & Weather/Palate Engine */}
      <main className="flex-1">
        <HeroSection />

        {/* 4. Interactive Sensory Menu & Flavor Translator */}
        <SensoryMenuSection />

        {/* 5. Fresh Bake Kitchen Cabinet & Depletion Tracker */}
        <FreshBakeCabinet />

        {/* 6. Interactive Floorplan & Seating Intelligence Hub */}
        <LocationAndSeatingHub />

        {/* 7. 3-Chapter Seed-to-Cup Scrollytelling & Postcards */}
        <SeedToCupScrollytelling />

        {/* 8. Barista's Current Obsession Polaroid Shelf */}
        <BaristaObsessions />

        {/* 9. Whole Bean Take-Home Bags & Home Brews */}
        <BeanShopSection />
      </main>

      {/* 10. Deep Espresso Brand Footer */}
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <CupAnatomyModal />
      <FindMyBeanQuizModal />
      <HomeBrewCompanionModal />
      <PayItForwardCorkboardModal />
      <PreOrderDrawer />
    </div>
  );
};

export default function App() {
  return (
    <CoffeeShopProvider>
      <AppContent />
    </CoffeeShopProvider>
  );
}
