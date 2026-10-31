import React, { useState, useEffect } from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import {
  Search,
  Zap,
  Terminal,
  DollarSign,
  ShieldCheck,
  Globe,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  X
} from 'lucide-react';

export const CommandKModal: React.FC = () => {
  const {
    isCommandKOpen,
    setIsCommandKOpen,
    setActivePersonaLens,
    setIsEnterpriseModalOpen,
    setIsCfoModalOpen,
    incrementSandboxAction
  } = useMarketingStore();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandKOpen(!isCommandKOpen);
      }
      if (e.key === 'Escape' && isCommandKOpen) {
        setIsCommandKOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandKOpen, setIsCommandKOpen]);

  if (!isCommandKOpen) return null;

  const actions = [
    {
      id: 'sandbox',
      label: 'Play in Live Un-gated Sandbox',
      category: 'Product Demo',
      icon: <Terminal className="w-4 h-4 text-indigo-400" />,
      run: () => {
        document.getElementById('interactive-sandbox-viewport')?.scrollIntoView({ behavior: 'smooth' });
        setIsCommandKOpen(false);
      }
    },
    {
      id: 'comparator',
      label: 'Chaos vs. Clarity Scrubber',
      category: 'Features',
      icon: <Sliders className="w-4 h-4 text-amber-400" />,
      run: () => {
        document.getElementById('features-matrix')?.scrollIntoView({ behavior: 'smooth' });
        setIsCommandKOpen(false);
      }
    },
    {
      id: 'pricing',
      label: 'ROI & Usage Pricing Calculator',
      category: 'Pricing',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      run: () => {
        document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' });
        setIsCommandKOpen(false);
      }
    },
    {
      id: 'quote',
      label: 'Export CFO-Ready Quote Link',
      category: 'Finance',
      icon: <DollarSign className="w-4 h-4 text-cyan-400" />,
      run: () => {
        setIsCommandKOpen(false);
        setIsCfoModalOpen(true);
      }
    },
    {
      id: 'testimonials',
      label: 'Metric-Verified Testimonials & Blueprints',
      category: 'Social Proof',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />,
      run: () => {
        document.getElementById('proof-wall')?.scrollIntoView({ behavior: 'smooth' });
        setIsCommandKOpen(false);
      }
    },
    {
      id: 'provision',
      label: 'Claim Team Workspace Handle',
      category: 'Provisioning',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      run: () => {
        document.getElementById('instant-provision-dock')?.scrollIntoView({ behavior: 'smooth' });
        setIsCommandKOpen(false);
      }
    },
    {
      id: 'lens-founder',
      label: 'Switch Lens: For Founders',
      category: 'Persona Switch',
      icon: <Zap className="w-4 h-4 text-amber-300" />,
      run: () => {
        setActivePersonaLens('founder');
        setIsCommandKOpen(false);
      }
    },
    {
      id: 'lens-eng',
      label: 'Switch Lens: For Engineering',
      category: 'Persona Switch',
      icon: <Layers className="w-4 h-4 text-indigo-300" />,
      run: () => {
        setActivePersonaLens('engineering');
        setIsCommandKOpen(false);
      }
    },
    {
      id: 'lens-fin',
      label: 'Switch Lens: For Ops & Finance',
      category: 'Persona Switch',
      icon: <DollarSign className="w-4 h-4 text-emerald-300" />,
      run: () => {
        setActivePersonaLens('finance');
        setIsCommandKOpen(false);
      }
    },
    {
      id: 'review',
      label: 'Book 1-on-1 Architecture Review',
      category: 'Enterprise',
      icon: <Calendar className="w-4 h-4 text-indigo-400" />,
      run: () => {
        setIsCommandKOpen(false);
        setIsEnterpriseModalOpen(true);
      }
    }
  ];

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-[#0D111C] border border-white/15 shadow-2xl overflow-hidden font-sans">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#06080F]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to section..."
            className="w-full bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setIsCommandKOpen(false)}
            className="p-1 rounded text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  incrementSandboxAction();
                  action.run();
                }}
                className="w-full p-2.5 rounded-xl flex items-center justify-between text-left hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
                    {action.icon}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                      {action.label}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{action.category}</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Bottom Keyboard Guide */}
        <div className="p-2.5 bg-[#06080F] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 px-4">
          <span>Navigate with arrows</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
