import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, Sparkles, ExternalLink, ChevronDown } from 'lucide-react';
import { ResumeVersion, BoundingBox, SkillAlignment } from '../../types/index.ts';
import { BoundingBoxOverlay } from '../common/BoundingBoxOverlay.tsx';
import { formatFileSize } from '../../utils/formatters.ts';

interface ResumeViewerPaneProps {
  currentResume: ResumeVersion | null;
  resumesList: ResumeVersion[];
  onSelectResume: (resumeId: string) => void;
  onUploadFile: (file: File) => void;
  onLoadSample: (sampleId: string) => void;
  isScanning: boolean;
  activeFieldKey: string | null;
  onSelectField: (fieldKey: string) => void;
  alignment: SkillAlignment | null;
  isRedacted: boolean;
  onToggleRedacted: () => void;
}

export const ResumeViewerPane: React.FC<ResumeViewerPaneProps> = ({
  currentResume,
  resumesList,
  onSelectResume,
  onUploadFile,
  onLoadSample,
  isScanning,
  activeFieldKey,
  onSelectField,
  alignment,
  isRedacted,
  onToggleRedacted
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const parsed = currentResume?.parsedData;
  const boundingBoxes = parsed?.boundingBoxes || [];

  return (
    <div className="flex flex-col h-full bg-surface-secondary-light dark:bg-surface-secondary-dark border-r border-divider-light dark:border-divider-dark p-4 sm:p-6 overflow-hidden">
      {/* Top Resume Vault Switcher & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 shrink-0">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark text-slate-800 dark:text-slate-200 shadow-xs hover:border-brand-500/40 transition-all max-w-[260px] truncate"
          >
            <FileText className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate">{currentResume?.fileName || 'Select Resume'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-xl shadow-xl z-30 p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Tailored Resume Vault
              </div>
              {resumesList.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    onSelectResume(r.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    currentResume?.id === r.id
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate mr-2">
                    <p className="truncate font-medium">{r.label}</p>
                    <p className="text-[10px] text-slate-400">{formatFileSize(r.fileSizeBytes)} • {r.fileName}</p>
                  </div>
                  {currentResume?.id === r.id && <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
                </button>
              ))}

              <div className="pt-1 border-t border-divider-light dark:border-divider-dark">
                <label className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Alternate PDF...</span>
                  <input type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={handleFileInput} />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Redacted View & Upload */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleRedacted}
            title={isRedacted ? 'Switch to Standard View' : 'Preview Blind Screening Redacted View'}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              isRedacted
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                : 'bg-surface-elevated-light dark:bg-surface-elevated-dark text-slate-600 dark:text-slate-300 border-divider-light dark:border-divider-dark hover:border-slate-400'
            }`}
          >
            {isRedacted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isRedacted ? 'Unbiased View On' : 'Blind Review'}</span>
          </button>

          <label className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Swap</span>
            <input type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={handleFileInput} />
          </label>
        </div>
      </div>

      {/* Document Inspection Stage (Simulated Rendered PDF Document Canvas) */}
      <div className="flex-1 relative bg-white dark:bg-slate-900 rounded-xl border border-divider-light dark:border-divider-dark shadow-sm overflow-y-auto p-6 sm:p-8 select-none">
        {/* Laser Scan Animation Overlay */}
        {isScanning && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden bg-brand-500/5 backdrop-blur-[0.5px]">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent shadow-[0_0_15px_#6366f1] animate-laser-scan absolute" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/90 text-white text-xs font-mono rounded-full flex items-center gap-2 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-spin" />
              <span>Laser OCR & Bounding Box Extraction...</span>
            </div>
          </div>
        )}

        {/* Document Content Canvas */}
        <div className="relative max-w-full text-slate-800 dark:text-slate-200">
          {/* Header block */}
          <div className="mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              {parsed?.fullName || 'ALEX RIVERA'}
            </h2>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
              Staff Frontend Engineer & Design Technologist
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isRedacted ? '[Demographic Address Redacted]' : (parsed?.location || 'San Francisco, CA')} •{' '}
              {parsed?.email || 'alex.rivera@atelier-dev.io'} • {parsed?.phone || '+1 (415) 890-4412'}
            </p>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              GitHub: {parsed?.githubUrl || 'https://github.com/arivera'} • Portfolio:{' '}
              {parsed?.portfolioUrl || 'https://alexrivera.design'}
            </p>
          </div>

          <hr className="my-3 border-slate-200 dark:border-slate-800" />

          {/* Executive Summary */}
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-1">
              Summary
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              {parsed?.summary ||
                'Staff-level Frontend Engineer with 8+ years crafting high-velocity design systems, zero-latency client state synchronization engines, and accessible web experiences for millions of users.'}
            </p>
          </div>

          {/* Work Experience */}
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">
              Work Experience
            </h3>
            <div className="space-y-3">
              {parsed?.workHistory && parsed.workHistory.length > 0 ? (
                parsed.workHistory.map((work, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="flex justify-between items-baseline font-semibold text-slate-800 dark:text-slate-200">
                      <span>
                        {work.role} | {work.company}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {work.startDate} – {work.endDate}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{work.description}</p>
                    {work.highlights && (
                      <ul className="list-disc list-inside mt-1 text-slate-600 dark:text-slate-400 space-y-0.5">
                        {work.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-500">
                  Senior Frontend Engineer | Vercel (2023 – Present)
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-1">
              Education
            </h3>
            {parsed?.education?.map((edu, idx) => (
              <div key={idx} className="text-[11px] flex justify-between">
                <span>
                  {edu.institution} — {edu.degree} in {edu.field}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {isRedacted ? '[Redacted]' : edu.graduationYear}
                </span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-1">
              Core Skills Matrix
            </h3>
            <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
              {parsed?.skills?.join(', ') || 'React, TypeScript, Vite, Design Systems, Accessibility, GraphQL'}
            </p>
          </div>

          {/* Bounding Box Highlights SVG / Interactive Canvas */}
          <BoundingBoxOverlay
            boundingBoxes={boundingBoxes}
            activeFieldKey={activeFieldKey}
            onSelectField={onSelectField}
            isRedacted={isRedacted}
          />
        </div>
      </div>

      {/* Bottom Resume Health & Alignment Strip */}
      <div className="mt-4 shrink-0 rounded-xl bg-surface-elevated-light dark:bg-surface-elevated-dark p-3.5 border border-divider-light dark:border-divider-dark space-y-2 text-xs">
        {/* Skill Alignment Meter */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            Skill Alignment:
          </span>
          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            {alignment ? `${alignment.matchPercentage}% Matched` : '100% Core Match'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${alignment ? alignment.matchPercentage : 100}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          {alignment?.tip || '✨ 6/6 Core Role Skills Detected (React, TypeScript, Vite, Design Systems, Accessibility, GraphQL)'}
        </p>

        {/* Link Verification Status */}
        <div className="pt-2 border-t border-divider-light dark:border-divider-dark flex items-center justify-between text-[11px] text-slate-500">
          <span>🔗 Resume Links Sentinel:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono">
            {currentResume?.linkHealthReport?.length || 3}/3 Verified Active
          </span>
        </div>
      </div>
    </div>
  );
};
