import React, { useState, useEffect } from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import { useQuery } from '@tanstack/react-query';
import { fetchPulse } from '../api/client.js';
import {
  Zap,
  Search,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Terminal,
  DollarSign,
  Activity,
  Layers
} from 'lucide-react';

export const MarketingShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCommandKOpen, setIsCommandKOpen, incrementSandboxAction } = useMarketingStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Poll live pulse from backend
  const { data: pulse } = useQuery({
    queryKey: ['pulse-navbar'],
    queryFn: fetchPulse,
    refetchInterval: 10000,
    staleTime: 5000
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#06080F] text-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sticky Floating Glassmorphic Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-[#06080F]/85 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/50'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Mark & Live Status Badge */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-[#06080F] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400/20 group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>
              <span className="font-display font-extrabold text-base tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                Acme<span className="text-indigo-400">.cloud</span>
              </span>
            </a>

            {/* Live System Status Pulse Pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0D111C] border border-white/10 text-[11px] font-mono text-slate-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>v2.4 Live</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400 font-semibold">
                {pulse?.pipelinesExecutedLastHour ? `${pulse.pipelinesExecutedLastHour}/hr` : '1,428/hr'}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('interactive-sandbox-viewport')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Live Sandbox
            </button>
            <button
              onClick={() => scrollToSection('features-matrix')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Workflow Comparator
            </button>
            <button
              onClick={() => scrollToSection('pricing-matrix')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Pricing & ROI
            </button>
            <button
              onClick={() => scrollToSection('proof-wall')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Wall of Love
            </button>
            <button
              onClick={() => scrollToSection('faq-section')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            {/* Cmd+K Quick Jump Pill */}
            <button
              onClick={() => {
                setIsCommandKOpen(true);
                incrementSandboxAction();
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D111C] hover:bg-[#151C2C] border border-white/10 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search</span>
              <kbd className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Sign In Ghost */}
            <button
              onClick={() => scrollToSection('instant-provision-dock')}
              className="hidden sm:inline-block px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Sign In
            </button>

            {/* Primary High-Contrast Shimmer CTA */}
            <button
              onClick={() => scrollToSection('instant-provision-dock')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all group cursor-pointer"
            >
              <span>Start Building Free</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0D111C] border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
              <button
                onClick={() => scrollToSection('interactive-sandbox-viewport')}
                className="text-left py-2 hover:text-white border-b border-white/5 flex items-center justify-between"
              >
                <span>Live Sandbox (Zero Signup)</span>
                <Terminal className="w-4 h-4 text-indigo-400" />
              </button>
              <button
                onClick={() => scrollToSection('features-matrix')}
                className="text-left py-2 hover:text-white border-b border-white/5 flex items-center justify-between"
              >
                <span>Chaos vs. Clarity Scrubber</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={() => scrollToSection('pricing-matrix')}
                className="text-left py-2 hover:text-white border-b border-white/5 flex items-center justify-between"
              >
                <span>Pricing & ROI Simulator</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                onClick={() => scrollToSection('proof-wall')}
                className="text-left py-2 hover:text-white border-b border-white/5 flex items-center justify-between"
              >
                <span>Verified Testimonials</span>
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </button>
              <button
                onClick={() => scrollToSection('faq-section')}
                className="text-left py-2 hover:text-white flex items-center justify-between"
              >
                <span>FAQ & Procurement</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCommandKOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-mono flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Anything (⌘K)</span>
              </button>
              <button
                onClick={() => scrollToSection('instant-provision-dock')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Claim Workspace Free →
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Stage */}
      <main className="flex-1">{children}</main>
    </div>
  );
};
