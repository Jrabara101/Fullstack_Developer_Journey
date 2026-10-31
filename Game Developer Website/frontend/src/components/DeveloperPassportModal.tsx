import React, { useState } from 'react';
import { GameProject } from '../types';
import { 
  X, 
  DownloadCloud, 
  Copy, 
  Check, 
  Award, 
  Gamepad2, 
  Layers, 
  Cpu, 
  ExternalLink, 
  FileText, 
  Share2,
  Mail
} from 'lucide-react';

interface DeveloperPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: GameProject[];
}

export const DeveloperPassportModal: React.FC<DeveloperPassportModalProps> = ({
  isOpen,
  onClose,
  projects,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 3000);
  };

  const discordEmbedText = `**ALEX VANCE // Senior Game Architect & Interactive Mechanics Lead**
🕹️ *Shipped Titles*: ChronoShift: Protocol 8, Neon Ronin, Aetherial
⚡ *Core Stack*: Godot 4 (C#), Unity (C#), WebGL / TypeScript, Unreal (C++)
🔬 *Specialties*: Continuous Collision CCD, Sub-tick Hitboxes, State Machines, Volumetric Shaders
🌐 *Interactive Portfolio & In-Browser Slices*: https://gamedev-portfolio.local`;

  const downloadPressKitJson = () => {
    const data = {
      developer: {
        name: 'Alex Vance',
        title: 'Senior Game Architect & Interactive Mechanics Engineer',
        availability: 'Open For Senior Roles & High-Impact Contracts',
        location: 'Remote / Hybrid (Global)',
        contact: 'alex.vance.gamedev@nexus.studio',
      },
      engineProficiencies: [
        { engine: 'Godot 4 (C#)', level: 'Expert (Architecture & State Machines)' },
        { engine: 'Unity (C#)', level: 'Expert (Job System, Profiling, Mecanim)' },
        { engine: 'WebGL / TypeScript', level: 'Advanced (Custom Shaders & WebAssembly)' },
        { engine: 'Unreal Engine 5 (C++)', level: 'Proficient (Voxel Generation & Optimization)' },
      ],
      shippedProjects: projects.map((p) => ({
        title: p.title,
        role: p.role,
        engine: p.engine,
        releaseStatus: p.releaseStatus,
        teamSize: p.teamSize,
        developmentDuration: p.developmentDuration,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Alex_Vance_Gamedev_Passport_${new Date().getFullYear()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#0a0d16] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Passport Header Banner */}
        <div className="w-full bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 px-6 py-4 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-black flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/30">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-bold text-lg tracking-wider text-white">
                RECRUITER & PUBLISHER PASSPORT
              </div>
              <div className="text-xs font-mono text-cyan-400">
                Nexus Engineering Credentials • Verified Interactive Portfolio
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Passport Dossier */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Identity & Availability Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Open For Full-Time / Lead Contract Roles
                </span>
              </div>
              <h3 className="font-display font-bold text-2xl text-white">
                Alex Vance
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Senior Gameplay Systems Architect • Combat Feel Engineer • Technical Artist
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadPressKitJson}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <DownloadCloud className="w-4 h-4 text-black" />
                Export Press Kit JSON
              </button>
            </div>
          </div>

          {/* Engine Proficiency Matrix */}
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Engine & Systems Proficiency
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-[#478cbf]/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-[#478cbf]">Godot 4.x (C#)</span>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Hierarchical State Machines, Continuous Collision (CCD), Custom Physics Solvers.
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-mono text-emerald-400 font-bold">● Production Shipped</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400">Unity (C#)</span>
                  <div className="text-[11px] text-slate-300 mt-1">
                    C# Job System, Burst Compiler, Mecanim Playable Graphs, Zero-Alloc Profiling.
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-mono text-emerald-400 font-bold">● Production Shipped</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-amber-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400">WebGL / WebGPU</span>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Volumetric Cloud Raymarching, GLSL/WGSL Shaders, Rust WASM Interop.
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-mono text-cyan-400 font-bold">● Active Sandbox</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-purple-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-purple-400">Unreal Engine 5</span>
                  <div className="text-[11px] text-slate-300 mt-1">
                    C++ Gameplay Framework, TaskGraph Multithreading, Voxel Dual Contouring.
                  </div>
                </div>
                <div className="mt-3 text-[10px] font-mono text-purple-400 font-bold">● Jam Winner</div>
              </div>
            </div>
          </div>

          {/* Shipped Productions Overview */}
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Flagship Portfolio Slices
            </h4>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Project Title</th>
                    <th className="p-3">Role & Scope</th>
                    <th className="p-3">Engine</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 text-slate-300">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        {p.title}
                      </td>
                      <td className="p-3 text-slate-400">{p.role}</td>
                      <td className="p-3 text-cyan-300">{p.engine}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px]">
                          {p.releaseStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* One-Click Embed Formats for Discord / Socials */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                Copyable Social & Discord Embed Snippet
              </span>
              <button
                onClick={() => copyToClipboard(discordEmbedText, 'discord')}
                className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                {copiedType === 'discord' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Copy Discord Embed</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-black/70 rounded-lg text-slate-400 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
              {discordEmbedText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Direct Inquiries: alex.vance.gamedev@nexus.studio</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            Close Passport
          </button>
        </div>

      </div>
    </div>
  );
};
