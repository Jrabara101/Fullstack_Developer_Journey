import React from 'react';
import { useCommerce } from './context/CommerceContext';
import { TopNavBar } from './components/layout/TopNavBar';
import { ToastContainer } from './components/layout/ToastContainer';
import { HeroShowcase } from './components/storefront/HeroShowcase';
import { TrustPillars } from './components/storefront/TrustPillars';
import { ProductCatalogGrid } from './components/storefront/ProductCatalogGrid';
import { SlideOutCartDrawer } from './components/storefront/SlideOutCartDrawer';
import { ExpressCheckoutModal } from './components/storefront/ExpressCheckoutModal';
import { OmsQueueHeader } from './components/oms/OmsQueueHeader';
import { ExceptionAlertBanner } from './components/oms/ExceptionAlertBanner';
import { OrdersTable } from './components/oms/OrdersTable';
import { OrderInspectorDrawer } from './components/oms/OrderInspectorDrawer';
import { PosSimulatorModal } from './components/pos/PosSimulatorModal';
import { TelemetryDashboard } from './components/telemetry/TelemetryDashboard';

export const AppContent: React.FC = () => {
    const { currentView } = useCommerce();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
            <TopNavBar />

            <div className="flex-1 flex flex-col">
                {/* VIEW 1: STOREFRONT */}
                {currentView === 'storefront' && (
                    <main className="flex-1 pb-16">
                        <HeroShowcase />
                        <TrustPillars />
                        <ProductCatalogGrid />
                    </main>
                )}

                {/* VIEW 2: ENTERPRISE OMS */}
                {currentView === 'oms' && (
                    <main className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        <OmsQueueHeader />
                        <ExceptionAlertBanner />
                        <div className="flex-1 flex overflow-hidden min-h-[600px]">
                            <OrdersTable />
                            <OrderInspectorDrawer />
                        </div>
                    </main>
                )}

                {/* VIEW 3: TELEMETRY DASHBOARD */}
                {currentView === 'metrics' && (
                    <TelemetryDashboard />
                )}
            </div>

            {/* Overlays & Drawers */}
            <SlideOutCartDrawer />
            <ExpressCheckoutModal />
            <PosSimulatorModal />
            <ToastContainer />
        </div>
    );
};

export default AppContent;
