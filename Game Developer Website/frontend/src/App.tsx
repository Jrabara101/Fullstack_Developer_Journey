import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameProject, DevLogEntry, CommunityStats } from './types';
import { Header } from './components/Header';
import { HeroSpotlightStage } from './components/HeroSpotlightStage';
import { ProjectBentoGrid } from './components/ProjectBentoGrid';
import { MechanicDissectorLab } from './components/MechanicDissectorLab';
import { DevLogChronicle } from './components/DevLogChronicle';
import { CommunityStatsBar } from './components/CommunityStatsBar';
import { PlayableSliceModal } from './components/PlayableSliceModal';
import { DeveloperPassportModal } from './components/DeveloperPassportModal';
import { FeedbackModal } from './components/FeedbackModal';
import { CommandPalette } from './components/CommandPalette';
import { Footer } from './components/Footer';

export function App() {
  const [projects, setProjects] = useState<GameProject[]>([]);
  const [devlogs, setDevlogs] = useState<DevLogEntry[]>([]);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Global State
  const [xrayMode, setXrayMode] = useState<boolean>(false);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [activeSliceProject, setActiveSliceProject] = useState<GameProject | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<{ project: GameProject; timestampSec: number } | null>(null);
  const [activeSection, setActiveSection] = useState<string>('games');

  // Fetch API data from Fastify backend
  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, devRes, statsRes] = await Promise.all([
          fetch('/api/projects').then((r) => r.json()),
          fetch('/api/devlogs').then((r) => r.json()),
          fetch('/api/telemetry/stats').then((r) => r.json()),
        ]);

        if (projRes.projects) setProjects(projRes.projects);
        if (devRes.devlogs) setDevlogs(devRes.devlogs);
        if (statsRes.totalSessions !== undefined) setCommunityStats(statsRes);
      } catch (err) {
        console.error('Error loading portfolio data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Global Keyboard Shortcuts: [~] for X-Ray, [Cmd+K] for Command Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setXrayMode((prev) => !prev);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenPassport = () => {
    setIsPassportOpen(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#06b6d4', '#10b981', '#a855f7'],
    });
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(section === 'lab' ? 'mechanics-lab' : section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Flagship Hero Project (ChronoShift: Protocol 8)
  const heroProject = projects[0] || null;

  // Flattened mechanic breakdowns for Dissector Lab
  const allMechanics = projects.flatMap((p) => p.mechanics);

  return (
    <div className={`min-h-screen bg-[#090b10] text-[#f3f4f6] relative ${xrayMode ? 'xray-active xray-wireframe-bg' : ''}`}>
      {/* Top Sticky Header */}
      <Header
        xrayMode={xrayMode}
        onToggleXray={() => setXrayMode(!xrayMode)}
        onOpenCommand={() => setIsCommandOpen(true)}
        onOpenPassport={handleOpenPassport}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Community Stats Bar */}
      <CommunityStatsBar stats={communityStats} />

      {/* Hero Spotlight Stage */}
      {heroProject && (
        <HeroSpotlightStage
          project={heroProject}
          onLaunchDemo={(p) => setActiveSliceProject(p)}
          onOpenFeedback={(p, sec) => setFeedbackTarget({ project: p, timestampSec: sec })}
          xrayMode={xrayMode}
        />
      )}

      {/* Bento Grid: Curated Game Projects */}
      {projects.length > 0 && (
        <ProjectBentoGrid
          projects={projects}
          xrayMode={xrayMode}
          onLaunchDemo={(p) => setActiveSliceProject(p)}
          onSelectProject={(p) => setActiveSliceProject(p)}
        />
      )}

      {/* The Mechanic Dissector & Interactive Game-Feel Lab */}
      {allMechanics.length > 0 && (
        <MechanicDissectorLab
          mechanics={allMechanics}
          xrayMode={xrayMode}
        />
      )}

      {/* Living Dev-Log Chronicle */}
      {devlogs.length > 0 && (
        <DevLogChronicle
          devlogs={devlogs}
          onOpenFeedback={(d) => {
            const linked = projects.find((p) => p.id === d.projectId) || projects[0];
            setFeedbackTarget({ project: linked, timestampSec: 0 });
          }}
        />
      )}

      {/* Footer */}
      <Footer
        onOpenPassport={handleOpenPassport}
        xrayMode={xrayMode}
        onToggleXray={() => setXrayMode(!xrayMode)}
      />

      {/* Modals & Dialogs */}
      <PlayableSliceModal
        project={activeSliceProject}
        isOpen={!!activeSliceProject}
        onClose={() => setActiveSliceProject(null)}
      />

      <DeveloperPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        projects={projects}
      />

      <FeedbackModal
        isOpen={!!feedbackTarget}
        onClose={() => setFeedbackTarget(null)}
        project={feedbackTarget?.project || null}
        timestampSec={feedbackTarget?.timestampSec || 0}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        projects={projects}
        devlogs={devlogs}
        onSelectProject={(p) => setActiveSliceProject(p)}
        onLaunchDemo={(p) => setActiveSliceProject(p)}
        onToggleXray={() => setXrayMode(!xrayMode)}
        onOpenPassport={handleOpenPassport}
        onNavigateSection={handleNavigate}
      />
    </div>
  );
}

export default App;
