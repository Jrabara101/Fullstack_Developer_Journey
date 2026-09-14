import React from 'react';
import AccordionGallery from '../react-bits/AccordionGallery';
import { REGIONAL_NODES } from '../../data/mockData';
import { Globe, Server, Activity, ShieldCheck, ExternalLink } from 'lucide-react';

export default function InfrastructureGallery({ onSelectNode }) {
  const galleryItems = REGIONAL_NODES.map(node => ({
    image: node.image,
    label: `${node.label} · ${node.latency}`,
    link: node.link,
    alt: `${node.label} Datacenter Node`
  }));

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container shadow-subtle flex flex-col space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-low pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-base text-on-surface">
                Global Edge Infrastructure & Regional Nodes
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-low text-primary font-mono text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-outline">
              React Bits AccordionGallery with GSAP 3D perspective, interactive panel expansion, and node telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-outline hidden md:inline">Hover/tap to expand node</span>
          <a
            href="#live-ops"
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-mono text-xs transition-colors"
          >
            <span>Inspect Edge Map</span>
            <ExternalLink className="w-3.5 h-3.5 text-outline" />
          </a>
        </div>
      </div>

      {/* React Bits AccordionGallery Component */}
      <div className="w-full overflow-hidden rounded-xl border border-surface-container/60 shadow-inner bg-[#0a0713]">
        <AccordionGallery
          items={galleryItems}
          defaultIndex={0}
          expandRatio={0.46}
          trigger="hover"
          height={320}
          radius={12}
          gap={8}
          tilt={6}
          parallax={0.4}
          accentColor="#2563eb"
          overlayColor="#060010"
          textColor="#ffffff"
          grayscale={true}
        />
      </div>

      {/* Regional Status Indicators below the gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
        {REGIONAL_NODES.map(node => (
          <div
            key={node.code}
            className="p-2.5 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low border border-surface-container/60 transition-colors flex flex-col justify-between space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-medium text-on-surface truncate">
                {node.code}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-mono text-[9px] font-bold ${
                  node.status === 'Healthy'
                    ? 'bg-emerald-500/10 text-emerald-700'
                    : 'bg-amber-500/15 text-amber-700'
                }`}
              >
                <span
                  className={`w-1 h-1 rounded-full ${
                    node.status === 'Healthy' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                />
                {node.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-outline">Ping:</span>
              <span className="font-mono text-xs font-semibold text-on-surface">
                {node.latency}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-outline border-t border-surface-container pt-1">
              <span>Nodes: {node.nodes}</span>
              <span>Util: {node.utilization}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
