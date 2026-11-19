import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Clock, Sparkles, ArrowRight, ShieldCheck, Filter, Check, Briefcase } from 'lucide-react';
import { JobPosting, JobApplication } from '../../types/index.ts';
import { fetchJobs, fetchApplications } from '../../utils/api.ts';
import { formatSalaryRange } from '../../utils/formatters.ts';
import { getAllLocalDrafts } from '../../db/indexedDb.ts';

interface JobPortalDirectoryProps {
  onSelectJobToApply: (job: JobPosting) => void;
  onViewJobDetails?: (job: JobPosting) => void;
  onNavigateToDraft?: (jobId: string) => void;
}

export const JobPortalDirectory: React.FC<JobPortalDirectoryProps> = ({
  onSelectJobToApply,
  onNavigateToDraft
}) => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedLocType, setSelectedLocType] = useState('all');
  const [minSalaryK, setMinSalaryK] = useState(150);
  const [draftJobIds, setDraftJobIds] = useState<Set<string>>(new Set());

  // Load jobs and check local and server drafts
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      fetchJobs({
        search: search || undefined,
        department: selectedDept !== 'all' ? selectedDept : undefined,
        locationType: selectedLocType !== 'all' ? selectedLocType : undefined,
        minSalary: minSalaryK > 0 ? minSalaryK * 1000 : undefined
      }),
      getAllLocalDrafts(),
      fetchApplications({ status: 'draft' }).catch(() => ({ applications: [] }))
    ])
      .then(([jobsRes, localDrafts, serverDrafts]) => {
        if (!mounted) return;
        setJobs(jobsRes.jobs);

        const drafts = new Set<string>();
        localDrafts.forEach(d => drafts.add(d.jobId));
        serverDrafts.applications?.forEach(a => drafts.add(a.jobId));
        setDraftJobIds(drafts);
      })
      .catch(err => {
        console.error('Failed to load directory:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [search, selectedDept, selectedLocType, minSalaryK]);

  const departments = ['all', 'Engineering', 'Product', 'Infrastructure', 'Design'];
  const locationTypes = [
    { id: 'all', label: 'All Locations' },
    { id: 'remote', label: 'Remote Only' },
    { id: 'hybrid', label: 'Hybrid' },
    { id: 'onsite', label: 'Onsite' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Hero Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Zero-Anxiety Candidate Platform • Transparent SLAs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Craft Careers Without the Black Hole.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload your resume once for instant side-by-side auto-fill, keystroke-level progress persistence across devices, and live Domino&apos;s-style status updates.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 p-4 bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-2xl border border-divider-light dark:border-divider-dark shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, skill (e.g. React, TypeScript), or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto md:col-span-4 py-1">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedDept === dept
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-surface-secondary-light dark:bg-surface-secondary-dark text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {dept === 'all' ? 'All Depts' : dept}
              </button>
            ))}
          </div>

          {/* Location Type Filter */}
          <div className="md:col-span-3 flex justify-end">
            <select
              value={selectedLocType}
              onChange={e => setSelectedLocType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {locationTypes.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary Slider & Micro-metrics */}
        <div className="pt-3 border-t border-divider-light dark:border-divider-dark flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              Min Compensation:
            </span>
            <input
              type="range"
              min="140"
              max="220"
              step="5"
              value={minSalaryK}
              onChange={e => setMinSalaryK(Number(e.target.value))}
              className="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100 font-semibold">
              ${minSalaryK}k+ USD
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Showing {jobs.length} published roles</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Salary Transparency
            </span>
          </div>
        </div>
      </div>

      {/* Role Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              className="h-56 bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-2xl">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No matching positions found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map(job => {
            const hasDraft = draftJobIds.has(job.id);

            return (
              <div
                key={job.id}
                className="group relative bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark hover:border-brand-500/40 rounded-2xl p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Dept & Draft Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                      {job.department}
                    </span>

                    {hasDraft && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Draft in Progress
                      </span>
                    )}
                  </div>

                  {/* Title & Company */}
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {job.title}
                  </h3>

                  {/* Meta: Location, Salary, SLA */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span className="font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
                      {formatSalaryRange(job.salaryMinCents, job.salaryMaxCents, job.currency)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      <Clock className="w-3 h-3" />
                      {job.slaBusinessDays}-day SLA
                    </span>
                  </div>

                  {/* Description snippet */}
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required Skills Chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.requiredSkills.map(skill => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-surface-secondary-light dark:bg-surface-secondary-dark text-slate-700 dark:text-slate-300 border border-divider-light dark:border-divider-dark"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Row */}
                <div className="mt-6 pt-4 border-t border-divider-light dark:border-divider-dark flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    ⏱ ~3 min to complete
                  </span>

                  <button
                    onClick={() => {
                      if (hasDraft && onNavigateToDraft) {
                        onNavigateToDraft(job.id);
                      } else {
                        onSelectJobToApply(job);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                  >
                    <span>{hasDraft ? 'Resume Draft' : 'Apply with Auto-Fill'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
