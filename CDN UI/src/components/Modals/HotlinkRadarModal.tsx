import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Tag, 
  Ban, 
  Check, 
  Search, 
  Plus, 
  Sparkles,
  ExternalLink,
  Flame
} from 'lucide-react';
import { HotlinkDomain, MediaAsset } from '../../types';
import { HOTLINK_DOMAINS } from '../../data/mockAssets';
import { EdgeService } from '../../services/edgeService';

interface HotlinkRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: MediaAsset;
}

export const HotlinkRadarModal: React.FC<HotlinkRadarModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const [domains, setDomains] = useState<HotlinkDomain[]>(HOTLINK_DOMAINS);
  const [selectedDomain, setSelectedDomain] = useState<HotlinkDomain>(HOTLINK_DOMAINS[0]);
  const [newDomainInput, setNewDomainInput] = useState('');

  if (!isOpen) return null;

  const handleStatusChange = (domainName: string, newStatus: 'blocked' | 'watermarked' | 'whitelisted') => {
    setDomains(prev => prev.map(d => {
      if (d.domain === domainName) {
        const updated = { ...d, status: newStatus };
        if (selectedDomain.domain === domainName) {
          setSelectedDomain(updated);
        }
        return updated;
      }
      return d;
    }));
  };

  const handleAddDomain = () => {
    if (!newDomainInput.trim()) return;
    const cleanDomain = newDomainInput.trim().replace(/^https?:\/\//, '');
    const newEntry: HotlinkDomain = {
      domain: cleanDomain,
      avatar: '🌐',
      requestsCount: 120,
      bandwidthBytes: 150000000,
      status: 'blocked',
      threatLevel: 'medium',
      lastAttempt: 'Just now'
    };
    setDomains(prev => [newEntry, ...prev]);
    setSelectedDomain(newEntry);
    setNewDomainInput('');
  };

  const totalBandwidthProtected = domains
    .filter(d => d.status !== 'whitelisted')
    .reduce((acc, d) => acc + d.bandwidthBytes, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-edge-panel border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-edge-obsidian/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-edge-rose/20 border border-edge-rose/30 flex items-center justify-center text-edge-rose">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>"Bandwidth Thief" & Hotlink Shield Radar</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-edge-rose/15 text-edge-rose border border-edge-rose/30 font-bold uppercase">
                  Active Edge Firewall
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Identify external websites leeching your media and control responses in real time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split view (Domain list + Simulated Response Preview) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
          {/* Top Summary Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-edge-well border border-white/5 gap-3">
            <div>
              <div className="font-semibold text-white text-sm">Protected Bandwidth Economics</div>
              <p className="text-gray-400 mt-0.5">
                Saved <strong className="text-edge-emerald">{EdgeService.formatBytes(totalBandwidthProtected)}</strong> of egress by denying unauthorized scrapers
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Add domain (e.g. leecher.com)"
                value={newDomainInput}
                onChange={(e) => setNewDomainInput(e.target.value)}
                className="bg-edge-obsidian border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-edge-cyan"
              />
              <button
                onClick={handleAddDomain}
                className="px-3 py-1.5 rounded-lg bg-edge-cyan/20 text-edge-cyan border border-edge-cyan/40 hover:bg-edge-cyan/30 font-semibold"
              >
                Add Rule
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Domain List Column */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Detected Referring Domains
              </div>

              {domains.map((d) => {
                const isSelected = selectedDomain.domain === d.domain;
                return (
                  <div
                    key={d.domain}
                    onClick={() => setSelectedDomain(d)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-edge-well border-edge-cyan ring-1 ring-edge-cyan/40 shadow-md'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{d.avatar}</span>
                        <div className="min-w-0">
                          <div className="font-mono font-semibold text-gray-200 truncate">{d.domain}</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {d.requestsCount.toLocaleString()} requests • {EdgeService.formatBytes(d.bandwidthBytes)}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        d.status === 'blocked' ? 'bg-edge-rose/20 text-edge-rose border border-edge-rose/30' :
                        d.status === 'watermarked' ? 'bg-edge-amber/20 text-edge-amber border border-edge-amber/30' :
                        'bg-edge-emerald/20 text-edge-emerald border border-edge-emerald/30'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    {/* 1-Click Response Action Bar */}
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(d.domain, 'blocked'); }}
                        className={`flex-1 py-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all ${
                          d.status === 'blocked' ? 'bg-edge-rose text-white border-edge-rose' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Ban className="w-3 h-3" />
                        <span>Block</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(d.domain, 'watermarked'); }}
                        className={`flex-1 py-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all ${
                          d.status === 'watermarked' ? 'bg-edge-amber text-edge-obsidian border-edge-amber font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>Watermark</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(d.domain, 'whitelisted'); }}
                        className={`flex-1 py-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all ${
                          d.status === 'whitelisted' ? 'bg-edge-emerald text-edge-obsidian border-edge-emerald font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Whitelist</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Client Simulation Column */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Simulated Response for {selectedDomain.domain}</span>
                <span className="text-[10px] font-mono text-edge-cyan">Live Simulation</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-edge-obsidian p-4 h-[300px] flex flex-col items-center justify-center relative overflow-hidden text-center">
                {selectedDomain.status === 'blocked' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-edge-rose/20 border border-edge-rose/40 flex items-center justify-center text-edge-rose mx-auto">
                      <Ban className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-edge-rose font-mono">HTTP 403 Forbidden</div>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs">
                        Hotlink request intercepted by EdgeStream Shield. Zero media bytes delivered.
                      </p>
                    </div>
                  </div>
                )}

                {selectedDomain.status === 'watermarked' && (
                  <div className="relative w-full h-full rounded-lg overflow-hidden border border-white/10 animate-fade-in flex items-center justify-center">
                    <img
                      src={asset.originUrl}
                      alt="Watermarked"
                      className="w-full h-full object-cover filter blur-[2px] opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                      <div className="px-3 py-1.5 rounded-lg bg-edge-amber text-edge-obsidian font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>PREVIEW ONLY • VISIT ORIGINAL SITE</span>
                      </div>
                      <p className="text-[10px] text-gray-300 font-mono mt-2">
                        Low-res 30% quality with prominent brand watermark
                      </p>
                    </div>
                  </div>
                )}

                {selectedDomain.status === 'whitelisted' && (
                  <div className="relative w-full h-full rounded-lg overflow-hidden border border-edge-emerald/30 animate-fade-in flex items-center justify-center">
                    <img
                      src={asset.originUrl}
                      alt="Whitelisted"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-edge-emerald text-edge-obsidian font-bold text-[10px] font-mono shadow-md">
                      ORIGINAL DELIVERED
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-edge-obsidian/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

