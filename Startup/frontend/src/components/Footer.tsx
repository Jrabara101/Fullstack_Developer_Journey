import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPulse } from '../api/client.js';
import { Zap, ShieldCheck, Globe, Activity, Heart, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { data: pulse } = useQuery({
    queryKey: ['pulse-footer'],
    queryFn: fetchPulse,
    refetchInterval: 12000,
    staleTime: 6000
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#04060A] border-t border-white/10 text-slate-400 text-xs font-mono py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Live System Pulse Strip */}
        <div className="p-4 rounded-2xl bg-[#0D111C] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-white font-semibold">
              Live Edge Network Status: 99.994% Global Availability
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
            <span>⚡ Pipelines Executed: <strong className="text-emerald-400 font-bold">{pulse?.pipelinesExecutedLastHour?.toLocaleString() || '1,428'}/hr</strong></span>
            <span>·</span>
            <span>🌐 PoPs Active: <strong className="text-cyan-400 font-bold">{pulse?.activeEdgeNodes || 312} Nodes</strong></span>
            <span>·</span>
            <span>⏱️ P99 Latency: <strong className="text-indigo-300 font-bold">{pulse?.medianColdStartMs || 11.4}ms</strong></span>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 font-sans">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base font-display">
              <div className="p-1 rounded-lg bg-indigo-600 text-white">
                <Zap className="w-4 h-4" />
              </div>
              <span>Acme Cloud</span>
            </div>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              The high-velocity browser-native proving ground and edge deployment engine for modern software teams.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-mono text-white font-semibold uppercase tracking-wider">Product</div>
            <ul className="space-y-2 text-xs">
              <li><a href="#interactive-sandbox-viewport" className="hover:text-white transition-colors">Zero-Signup Sandbox</a></li>
              <li><a href="#features-matrix" className="hover:text-white transition-colors">Chaos vs. Clarity Scrubber</a></li>
              <li><a href="#pricing-matrix" className="hover:text-white transition-colors">Dynamic ROI Simulator</a></li>
              <li><a href="#proof-wall" className="hover:text-white transition-colors">Verified Telemetry Wall</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-mono text-white font-semibold uppercase tracking-wider">Governance</div>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">SOC2 Type II Report</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">ISO 27001 Certification</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">HIPAA Business Agreement</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">GDPR Data Processing</span></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-mono text-white font-semibold uppercase tracking-wider">Platform</div>
            <ul className="space-y-2 text-xs">
              <li><a href="/api/health" target="_blank" className="hover:text-white transition-colors">Backend API Status (/api)</a></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Anycast Edge Network</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Blue/Green Canary Mesh</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Purchasing Power Parity</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            © {new Date().getFullYear()} Acme Cloud Inc. Built for high-velocity founders and engineers.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
