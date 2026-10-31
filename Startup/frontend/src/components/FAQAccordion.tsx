import React, { useState } from 'react';
import { CLIENT_FAQS } from '../data/clientData.js';
import { HelpCircle, ChevronDown, ShieldCheck, Lock, Globe, Server } from 'lucide-react';

export const FAQAccordion: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-24 relative bg-[#06080F] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Trust Badges & Direct Architecture Assurance */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Objection Busting & Procurement</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Frequently Addressed Technical Questions
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              Everything you need to know about our un-gated sandboxes, transparent pricing guards, and frictionless zero-downtime migration.
            </p>

            {/* Trust Assurances Card */}
            <div className="p-5 rounded-2xl bg-[#0D111C] border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-white text-xs">Continuous Compliance</div>
                  <div className="text-[11px] text-slate-400">SOC2 Type II, ISO 27001, and HIPAA ready</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-white text-xs">Global 35-Region Mesh</div>
                  <div className="text-[11px] text-slate-400">Sub-12ms median global edge latency</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-white text-xs">99.999% Availability SLA</div>
                  <div className="text-[11px] text-slate-400">Contractually backed financial guarantees</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Accordion */}
          <div className="lg:col-span-7 space-y-3">
            {CLIENT_FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#0D111C] border-indigo-500/40 shadow-lg'
                      : 'bg-[#0D111C]/60 border-white/5 hover:border-white/15'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-semibold text-white text-sm sm:text-base leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
