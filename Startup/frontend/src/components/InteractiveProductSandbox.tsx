import React, { useState, useEffect, useRef } from 'react';
import { useMarketingStore } from '../store/marketingStore.js';
import {
  Terminal,
  Activity,
  ShieldCheck,
  Globe,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Server,
  Layers,
  Lock,
  Cpu,
  ArrowRight
} from 'lucide-react';

export const InteractiveProductSandbox: React.FC = () => {
  const {
    activePersonaLens,
    activeSandboxTab,
    setActiveSandboxTab,
    sandboxToggles,
    toggleSandboxFeature,
    sandboxTerminalLogs,
    addTerminalLog,
    clearTerminalLogs,
    incrementSandboxAction
  } = useMarketingStore();

  const [isRunningCommand, setIsRunningCommand] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('iad-1');
  const [canaryTraffic, setCanaryTraffic] = useState(100);
  const [isSimulatingRollback, setIsSimulatingRollback] = useState(false);
  const [customCommand, setCustomCommand] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sandboxTerminalLogs]);

  // Execute terminal preset commands
  const runCommand = (cmd: string) => {
    if (isRunningCommand) return;
    setIsRunningCommand(true);
    incrementSandboxAction();
    addTerminalLog(`$ ${cmd}`);

    if (cmd.includes('deploy')) {
      setTimeout(() => addTerminalLog('⚡ Packaging container layers (5.2MB)...'), 300);
      setTimeout(() => addTerminalLog('✓ Distributing container to 35 global edge PoPs'), 700);
      setTimeout(() => addTerminalLog('● Initializing canary: 5% traffic steered to revision #v2.4.1'), 1100);
      setTimeout(() => {
        addTerminalLog('✓ Health checks verified (0.00% error rate). Promoted to 100% traffic.');
        setIsRunningCommand(false);
      }, 1600);
    } else if (cmd.includes('benchmark')) {
      setTimeout(() => addTerminalLog('🚀 Simulating 10,000 req/s global synthetic load...'), 300);
      setTimeout(() => addTerminalLog('→ SFO-1: 8.2ms | IAD-1: 9.1ms | LHR-1: 12.4ms | FRA-1: 11.8ms'), 700);
      setTimeout(() => addTerminalLog('→ NRT-1: 14.2ms | SIN-1: 15.1ms | SYD-1: 18.0ms'), 1100);
      setTimeout(() => {
        addTerminalLog('✓ Benchmark Complete. P95: 11.2ms, P99: 14.8ms. Zero packet drops.');
        setIsRunningCommand(false);
      }, 1500);
    } else if (cmd.includes('rollback')) {
      setIsSimulatingRollback(true);
      setTimeout(() => addTerminalLog('⚠️ Anomaly tripwire detected: 0.08% HTTP 502 in preview revision'), 250);
      setTimeout(() => addTerminalLog('🛡️ Initiating auto-rollback sequence (Policy: Zero-Downtime)...'), 600);
      setTimeout(() => addTerminalLog('✓ Traffic restored to healthy snapshot #v2.4.0 in 380ms'), 950);
      setTimeout(() => {
        addTerminalLog('● Incident mitigated. Zero user requests dropped.');
        setIsSimulatingRollback(false);
        setIsRunningCommand(false);
      }, 1300);
    } else {
      setTimeout(() => {
        addTerminalLog(`✓ Command executed: ${cmd} (Exit code: 0)`);
        setIsRunningCommand(false);
      }, 400);
    }
  };

  const handleCustomCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommand.trim()) return;
    runCommand(customCommand.trim());
    setCustomCommand('');
  };

  // Regions for edge mesh
  const edgeRegions = [
    { id: 'iad-1', name: 'US East (Virginia)', ping: '8.4ms', status: 'Optimal' },
    { id: 'sfo-1', name: 'US West (San Francisco)', ping: '7.9ms', status: 'Optimal' },
    { id: 'lhr-1', name: 'EU West (London)', ping: '11.8ms', status: 'Optimal' },
    { id: 'fra-1', name: 'EU Central (Frankfurt)', ping: '12.4ms', status: 'Optimal' },
    { id: 'nrt-1', name: 'Asia East (Tokyo)', ping: '14.1ms', status: 'Optimal' },
    { id: 'sin-1', name: 'Asia South (Singapore)', ping: '15.6ms', status: 'Optimal' }
  ];

  // Dynamic P99 Latency based on Edge AI Cache toggle
  const currentP99 = sandboxToggles.edgeAiCache ? '11.4ms' : '42.8ms';

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0D111C]/95 backdrop-blur-xl shadow-2xl shadow-indigo-950/40 overflow-hidden">
      {/* Top Window Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#06080F]/80">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/40" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40" />
          </div>
          <span className="text-xs font-mono text-slate-400 pl-2 border-l border-white/10 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            live-sandbox-instance // acme-edge-cluster-01
          </span>
        </div>

        {/* Persona lens context indicator */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Persona View:</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold uppercase tracking-wider">
            {activePersonaLens}
          </span>
        </div>
      </div>

      {/* Sandbox Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-[#090D17] overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveSandboxTab('workflows')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 whitespace-nowrap transition-colors ${
            activeSandboxTab === 'workflows'
              ? 'border-indigo-500 text-white bg-indigo-500/10 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Workflows & Deployments</span>
        </button>

        <button
          onClick={() => setActiveSandboxTab('edge-mesh')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 whitespace-nowrap transition-colors ${
            activeSandboxTab === 'edge-mesh'
              ? 'border-indigo-500 text-white bg-indigo-500/10 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Global Edge Mesh (35 PoPs)</span>
        </button>

        <button
          onClick={() => setActiveSandboxTab('observability')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 whitespace-nowrap transition-colors ${
            activeSandboxTab === 'observability'
              ? 'border-indigo-500 text-white bg-indigo-500/10 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>P99 & Circuit Breaker</span>
        </button>

        <button
          onClick={() => setActiveSandboxTab('vault')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 whitespace-nowrap transition-colors ${
            activeSandboxTab === 'vault'
              ? 'border-indigo-500 text-white bg-indigo-500/10 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>SOC2 & KMS Vault</span>
        </button>
      </div>

      {/* Main Sandbox Interactive Bays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10 min-h-[420px]">
        {/* Left Side: Playable Feature Canvas & Controls (7 Cols) */}
        <div className="lg:col-span-7 p-5 flex flex-col justify-between space-y-5">
          {/* TAB 1: WORKFLOWS */}
          {activeSandboxTab === 'workflows' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Automated Release Pipeline
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click steps or run triggers to simulate blue/green canary rollout.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Status: All Systems Operational
                </span>
              </div>

              {/* Pipeline Visual Graph */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <div className="font-mono text-[10px] text-slate-400">STAGE 01</div>
                    <div className="font-semibold text-white mt-1">Git Push</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">✓ 0.4s verified</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <div className="font-mono text-[10px] text-slate-400">STAGE 02</div>
                    <div className="font-semibold text-white mt-1">Edge Build</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">✓ Cached Layer</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 animate-pulse">
                    <div className="font-mono text-[10px] text-slate-400">STAGE 03</div>
                    <div className="font-semibold text-white mt-1">Canary Gate</div>
                    <div className="text-[10px] text-indigo-300 mt-0.5">● 100% Active</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <div className="font-mono text-[10px] text-slate-400">STAGE 04</div>
                    <div className="font-semibold text-white mt-1">Global Anycast</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">✓ 35 Regions</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-400 font-mono">
                  <span>Current Revision: commit-a7f2e4b</span>
                  <span className="text-emerald-400">Zero Downtime Guaranteed</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GLOBAL EDGE MESH */}
          {activeSandboxTab === 'edge-mesh' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Distributed Edge Clusters
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click a region to test anycast routing and real-time DNS latency.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  Anycast: Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {edgeRegions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => {
                      setSelectedRegion(region.id);
                      incrementSandboxAction();
                      addTerminalLog(`[EDGE] Switched benchmark target to ${region.name} (${region.ping})`);
                    }}
                    className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                      selectedRegion === region.id
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <span>{region.id.toUpperCase()}</span>
                      <span className="text-emerald-400 font-bold">{region.ping}</span>
                    </div>
                    <div className="font-semibold text-white mt-1 truncate">{region.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{region.status}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OBSERVABILITY & P99 */}
          {activeSandboxTab === 'observability' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Telemetry & Circuit Breakers
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live P99 response curves across 12,000 requests/second.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">Current P99: </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{currentP99}</span>
                </div>
              </div>

              {/* Live SVG Graph Visualization */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 relative overflow-hidden">
                <svg className="w-full h-24 stroke-current" viewBox="0 0 300 80">
                  <defs>
                    <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={
                      sandboxToggles.edgeAiCache
                        ? 'M 0 65 Q 40 58, 80 62 T 160 55 T 240 58 T 300 52 L 300 80 L 0 80 Z'
                        : 'M 0 35 Q 40 20, 80 45 T 160 25 T 240 38 T 300 20 L 300 80 L 0 80 Z'
                    }
                    fill="url(#gradient-area)"
                  />
                  <path
                    d={
                      sandboxToggles.edgeAiCache
                        ? 'M 0 65 Q 40 58, 80 62 T 160 55 T 240 58 T 300 52'
                        : 'M 0 35 Q 40 20, 80 45 T 160 25 T 240 38 T 300 20'
                    }
                    fill="none"
                    stroke={sandboxToggles.edgeAiCache ? '#10B981' : '#F59E0B'}
                    strokeWidth="2.5"
                  />
                  <line x1="0" y1="40" x2="300" y2="40" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                </svg>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                  <span>T-60s</span>
                  <span className={sandboxToggles.edgeAiCache ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                    {sandboxToggles.edgeAiCache ? '⚡ Edge AI Cache Active (-68% latency)' : '⚠️ Cold Path (Cache Disabled)'}
                  </span>
                  <span>Now</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOC2 & KMS VAULT */}
          {activeSandboxTab === 'vault' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    Enterprise Security & KMS Vault
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Continuous automated compliance proof and hardware secret isolation.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  SOC2 Type II: Compliant
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                    <span>KMS KEY ROTATION</span>
                    <span className="text-emerald-400">Automated</span>
                  </div>
                  <div className="font-semibold text-white">AES-256-GCM Hardware Vault</div>
                  <div className="text-[11px] text-slate-400">Rotated every 24h with zero downtime</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                    <span>ACCESS CONTROL</span>
                    <span className="text-emerald-400">Strict RBAC</span>
                  </div>
                  <div className="font-semibold text-white">Zero-Trust Network Perimeter</div>
                  <div className="text-[11px] text-slate-400">Mutual TLS & ephemeral JWT tokens</div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Feature Toggles Strip */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
              Micro-Instance Runtime Toggles:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => toggleSandboxFeature('zeroDowntimeCanary')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium border flex items-center justify-between transition-all ${
                  sandboxToggles.zeroDowntimeCanary
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                    : 'bg-slate-950/60 border-white/10 text-slate-400'
                }`}
              >
                <span>Zero-Downtime</span>
                <span className={`w-2 h-2 rounded-full ${sandboxToggles.zeroDowntimeCanary ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              </button>

              <button
                onClick={() => toggleSandboxFeature('edgeAiCache')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium border flex items-center justify-between transition-all ${
                  sandboxToggles.edgeAiCache
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                    : 'bg-slate-950/60 border-white/10 text-slate-400'
                }`}
              >
                <span>Edge AI Cache</span>
                <span className={`w-2 h-2 rounded-full ${sandboxToggles.edgeAiCache ? 'bg-cyan-400' : 'bg-slate-600'}`} />
              </button>

              <button
                onClick={() => toggleSandboxFeature('databaseBranching')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium border flex items-center justify-between transition-all ${
                  sandboxToggles.databaseBranching
                    ? 'bg-amber-500/20 border-amber-500/50 text-white'
                    : 'bg-slate-950/60 border-white/10 text-slate-400'
                }`}
              >
                <span>DB Branching</span>
                <span className={`w-2 h-2 rounded-full ${sandboxToggles.databaseBranching ? 'bg-amber-400' : 'bg-slate-600'}`} />
              </button>

              <button
                onClick={() => toggleSandboxFeature('soc2AuditTrail')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium border flex items-center justify-between transition-all ${
                  sandboxToggles.soc2AuditTrail
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                    : 'bg-slate-950/60 border-white/10 text-slate-400'
                }`}
              >
                <span>SOC2 Audit</span>
                <span className={`w-2 h-2 rounded-full ${sandboxToggles.soc2AuditTrail ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Command Runner & Real-Time Terminal (5 Cols) */}
        <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-[#06080F]/90 font-mono text-xs">
          <div className="space-y-3">
            {/* Terminal Header & Action Presets */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Live Command Runner
              </span>
              <button
                onClick={clearTerminalLogs}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Clickable Quick Command Chips */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Quick Simulations:</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  disabled={isRunningCommand}
                  onClick={() => runCommand('acme deploy --env prod --canary')}
                  className="px-2 py-1 rounded bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                >
                  <Play className="w-2.5 h-2.5" />
                  deploy --canary
                </button>
                <button
                  disabled={isRunningCommand}
                  onClick={() => runCommand('acme benchmark --p99 --load 10k')}
                  className="px-2 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                >
                  <Play className="w-2.5 h-2.5" />
                  benchmark p99
                </button>
                <button
                  disabled={isRunningCommand}
                  onClick={() => runCommand('acme simulate --anomaly --rollback')}
                  className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1 transition-all disabled:opacity-50"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  test rollback (380ms)
                </button>
              </div>
            </div>

            {/* Terminal Console Output Bay */}
            <div className="h-44 overflow-y-auto rounded-lg bg-black/60 border border-white/5 p-2.5 space-y-1 font-mono text-[11px] leading-relaxed">
              {sandboxTerminalLogs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.startsWith('$')
                      ? 'text-indigo-400 font-bold'
                      : log.includes('✓')
                      ? 'text-emerald-400'
                      : log.includes('⚠️')
                      ? 'text-amber-400'
                      : log.includes('●')
                      ? 'text-cyan-400'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
              {isRunningCommand && (
                <div className="text-indigo-300 animate-pulse flex items-center gap-1">
                  <span className="inline-block w-1.5 h-3 bg-indigo-400 animate-bounce" />
                  Executing telemetry simulation...
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Interactive Input Prompt Form */}
          <form onSubmit={handleCustomCommandSubmit} className="mt-3 pt-2.5 border-t border-white/10 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">$</span>
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder="acme deploy --branch stage"
                disabled={isRunningCommand}
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-6 pr-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isRunningCommand || !customCommand.trim()}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1 disabled:opacity-40 transition-colors"
            >
              Run <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
