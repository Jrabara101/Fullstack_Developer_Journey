import React, { useState } from 'react';
import { GameProject } from '../types';
import { ProjectCard } from './ProjectCard';
import { Filter, Flame, Sparkles, Layers, Cpu } from 'lucide-react';

interface ProjectBentoGridProps {
  projects: GameProject[];
  xrayMode: boolean;
  onLaunchDemo: (project: GameProject) => void;
  onSelectProject: (project: GameProject) => void;
}

export const ProjectBentoGrid: React.FC<ProjectBentoGridProps> = ({
  projects,
  xrayMode,
  onLaunchDemo,
  onSelectProject,
}) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
  const [selectedEngine, setSelectedEngine] = useState('All');

  const disciplines = [
    'All',
    'Gameplay Systems',
    'Technical Art',
    'AI & Pathfinding',
    'Shipped Titles',
  ];

  const engines = ['All', 'Godot', 'Unity', 'Unreal', 'WebGL / TypeScript'];

  const filteredProjects = projects.filter((p) => {
    // Discipline filter
    if (selectedDiscipline === 'Shipped Titles') {
      if (p.releaseStatus !== 'Shipped') return false;
    } else if (selectedDiscipline !== 'All') {
      const hasMechanic = p.mechanics.some((m) => m.discipline === selectedDiscipline);
      const hasDevLog = p.devLogs.some((d) => d.tags.includes(selectedDiscipline as any));
      if (!hasMechanic && !hasDevLog) return false;
    }

    // Engine filter
    if (selectedEngine !== 'All') {
      if (!p.engine.includes(selectedEngine)) return false;
    }

    return true;
  });

  return (
    <section id="games" className="w-full py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Title & Discipline Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-cyan-400" />
            Interactive Portfolio Matrix
          </div>
          <h2 className="text-3xl font-bold font-display tracking-wide text-white">
            CURATED PRODUCTION DOSSIER
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Filter through specialized engineering lenses. Hover over any project card to trigger instant zero-latency micro-trailer scrubbing or launch in-browser game slices.
          </p>
        </div>

        {/* Engine Dropdown & Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500">Engine:</span>
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="bg-transparent text-cyan-400 focus:outline-none cursor-pointer"
            >
              {engines.map((eng) => (
                <option key={eng} value={eng} className="bg-slate-900 text-slate-200">
                  {eng}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Discipline Tag Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {disciplines.map((disc) => (
          <button
            key={disc}
            onClick={() => setSelectedDiscipline(disc)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all flex items-center gap-1.5 ${
              selectedDiscipline === disc
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10 font-semibold'
                : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>{disc}</span>
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            xrayMode={xrayMode}
            onLaunchDemo={onLaunchDemo}
            onSelectProject={onSelectProject}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="w-full py-16 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 font-mono text-slate-500">
          No projects matched the selected discipline / engine filter.
        </div>
      )}
    </section>
  );
};
