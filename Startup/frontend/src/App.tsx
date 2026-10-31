import React, { useState, useEffect } from 'react';
import { MarketingShell } from './components/MarketingShell.js';
import { HeroProductStage } from './components/HeroProductStage.js';
import { FeatureBentoMatrix } from './components/FeatureBentoMatrix.js';
import { InteractivePricingMatrix } from './components/InteractivePricingMatrix.js';
import { VerifiedTestimonialWall } from './components/VerifiedTestimonialWall.js';
import { FAQAccordion } from './components/FAQAccordion.js';
import { InstantProvisionCtaDock } from './components/InstantProvisionCtaDock.js';
import { Footer } from './components/Footer.js';
import { CommandKModal } from './components/CommandKModal.js';
import { QuotePage } from './components/QuotePage.js';

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check if viewing a shareable CFO quote URL: /quote/:id
  const quoteMatch = currentPath.match(/^\/quote\/([^/]+)/);

  if (quoteMatch) {
    const quoteId = quoteMatch[1];
    return (
      <QuotePage
        quoteId={quoteId}
        onBack={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
      />
    );
  }

  return (
    <MarketingShell>
      {/* 1. Zero-Signup Hero Stage & Live Sandbox */}
      <HeroProductStage />

      {/* 2. Tactile Chaos vs Clarity Scrubber & Bento Feature Matrix */}
      <FeatureBentoMatrix />

      {/* 3. Interactive Pricing & Real-Time ROI Simulator */}
      <InteractivePricingMatrix />

      {/* 4. Metric-Verified Wall of Love & Stack Blueprints */}
      <VerifiedTestimonialWall />

      {/* 5. 2-Column Objection Busting FAQ */}
      <FAQAccordion />

      {/* 6. Dual-Velocity Provisioning Dock & Enterprise Review */}
      <InstantProvisionCtaDock />

      {/* 7. Footer & Live Activity Pulse */}
      <Footer />

      {/* Global Cmd+K Quick-Jump Modal */}
      <CommandKModal />
    </MarketingShell>
  );
}

export default App;
