import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../common/BrandIcons.tsx';
import { JobApplication, JobPosting, StageEvent, ResumeVersion, ScheduledInterview } from '../../types/index.ts';
import { fetchApplicationByIdOrCode, fetchResumes } from '../../utils/api.ts';
import { StageStepper } from './StageStepper.tsx';
import { SlotBookingCard } from './SlotBookingCard.tsx';
import { ActivityTimeline } from './ActivityTimeline.tsx';
import { GracefulWithdrawModal } from './GracefulWithdrawModal.tsx';
import { EditResumeModal } from './EditResumeModal.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface CandidateStatusPortalProps {
  applicationIdOrCode: string;
  onBackToDirectory: () => void;
  onNavigateToJob?: (slug: string) => void;
}

export const CandidateStatusPortal: React.FC<CandidateStatusPortalProps> = ({
  applicationIdOrCode,
  onBackToDirectory,
  onNavigateToJob
}) => {
  const { success, info } = useToast();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [events, setEvents] = useState<StageEvent[]>([]);
  const [resumesList, setResumesList] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [editResumeOpen, setEditResumeOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [expectationsExpanded, setExpectationsExpanded] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appRes, resumesRes] = await Promise.all([
        fetchApplicationByIdOrCode(applicationIdOrCode),
        fetchResumes().catch(() => ({ resumes: [] }))
      ]);

      setApplication(appRes.application);
      setJob(appRes.job);
      setEvents(appRes.events);
      setResumesList(resumesRes.resumes);
    } catch (err) {
      console.error('Failed to load application status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [applicationIdOrCode]);

  const handleMessageSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    info('Message sent to Talent Lead', 'Sarah Jenkins will reply within 1 business day.');
    setMessageText('');
    setMessageOpen(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-8 bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-xl w-64 mx-auto" />
        <div className="h-48 bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-2xl" />
      </div>
    );
  }

  if (!application || !job) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-surface-elevated-light dark:bg-surface-elevated-dark rounded-2xl border border-divider-light dark:border-divider-dark">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Application Not Found</h3>
        <p className="text-xs text-slate-500 mt-2">
          Could not find an application with code &ldquo;{applicationIdOrCode}&rdquo;.
        </p>
        <button
          onClick={onBackToDirectory}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const stages = job.pipelineStages || [
    'Application Received',
    'Resume Reviewed',
    'Recruiter Screen',
    'Technical Deep-Dive',
    'Team Onsite',
    'Decision & Offer'
  ];

  const currentStageLabel = stages[application.currentStageIndex] || 'Under Review';
  const isInterviewStage = application.status === 'technical_interview' || application.currentStageIndex === 3;
  const isOfferStage = application.status === 'offer_extended';
  const isWithdrawn = application.status === 'withdrawn';
  const isRejected = application.status === 'rejected';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Explore Jobs</span>
        </button>
      </div>

      {/* Top Identity & Application Header Card */}
      <div className="rounded-2xl border border-divider-light dark:border-divider-dark bg-surface-elevated-light dark:bg-surface-elevated-dark p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-surface-secondary-light dark:bg-surface-secondary-dark text-slate-800 dark:text-slate-200 border border-divider-light dark:border-divider-dark tabular-nums">
              {application.trackingCode}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 ${
                isOfferStage
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : isWithdrawn || isRejected
                  ? 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20'
                  : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>
                Stage {application.currentStageIndex + 1} of {stages.length}: {currentStageLabel}
              </span>
            </span>
          </div>

          {/* SLA countdown badge */}
          {!isWithdrawn && !isRejected && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              <span>
                ⏱ SLA Target: Response by{' '}
                {application.slaInfo?.dueFormatted || 'Friday, Oct 24'}
              </span>
            </div>
          )}
        </div>

        {/* Main Title & Role Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
              {job.title} — {job.companyName}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span>Applied {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'recently'}</span>
              <span>•</span>
              <span>Attached: Alex_Rivera_Staff_FE_2026.pdf</span>
              <span>•</span>
              <button
                onClick={() => setEditResumeOpen(true)}
                className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                [ 👁 Swap Updated PDF ]
              </button>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessageOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-divider-light dark:border-divider-dark bg-surface-secondary-light dark:bg-surface-secondary-dark text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
              <span>Message Recruiter</span>
            </button>
          </div>
        </div>

        {/* 6-Node Horizontal Domino's-Style Pipeline Stepper */}
        <div className="pt-4 border-t border-divider-light dark:border-divider-dark">
          <StageStepper
            currentStageIndex={application.currentStageIndex}
            stages={stages}
            status={application.status}
          />
        </div>
      </div>

      {/* 2-Column Candidate Action & Transparency Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: Current Stage Action & Interview Prep Packet (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Action Card: Embedded Self-Service Slot Picker (Unlocked when in interview stage) */}
          {isInterviewStage && (
            <SlotBookingCard
              applicationId={application.id}
              scheduledInterview={application.scheduledInterview}
              onSlotConfirmed={scheduled => {
                setApplication({ ...application, scheduledInterview: scheduled });
                loadData();
              }}
            />
          )}

          {/* Offer Celebration Card */}
          {isOfferStage && (
            <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 p-6 animate-fade-in space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-base">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span>Congratulations! Offer Package Extended</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                The Atelier leadership team is thrilled to extend an official offer for{' '}
                <strong>{job.title}</strong>. An email containing your full equity, base compensation, and comprehensive benefits packet has been delivered to your inbox.
              </p>
            </div>
          )}

          {/* "What to Expect" Transparency Accordion */}
          <div className="rounded-2xl border border-divider-light dark:border-divider-dark bg-surface-elevated-light dark:bg-surface-elevated-dark p-6 shadow-xs space-y-5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpectationsExpanded(!expectationsExpanded)}
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  <span>Stage Expectations & Interview Prep Packet</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full transparency into who you will meet, session structure, and how we evaluate.
                </p>
              </div>
              <button className="text-slate-400 p-1">
                {expectationsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {expectationsExpanded && (
              <div className="space-y-5 pt-2 border-t border-divider-light dark:border-divider-dark">
                {/* Interviewer Bios */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Your Interviewers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {application.interviewerBios?.map((bio, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark text-xs space-y-2"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={bio.avatarUrl}
                            alt={bio.name}
                            className="w-10 h-10 rounded-full object-cover border border-divider-light dark:border-divider-dark"
                          />
                          <div>
                            <h5 className="font-semibold text-slate-900 dark:text-slate-100">{bio.name}</h5>
                            <p className="text-[11px] text-slate-500">{bio.role}</p>
                          </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                          {bio.bio}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-brand-600 dark:text-brand-400 font-mono">
                          {bio.githubUrl && (
                            <a href={bio.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                              <GithubIcon className="w-3 h-3" />
                              <span>GitHub</span>
                            </a>
                          )}
                          {bio.linkedinUrl && (
                            <a href={bio.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                              <LinkedinIcon className="w-3 h-3" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Breakdown */}
                <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 text-xs space-y-2">
                  <h4 className="font-semibold text-brand-900 dark:text-brand-200">
                    Session Agenda (Zero LeetCode Riddles)
                  </h4>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-brand-600 font-bold shrink-0">15 min:</span>
                      <span>Walkthrough of a project or design system architecture you are proud of.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-brand-600 font-bold shrink-0">25 min:</span>
                      <span>Collaborative state-modeling and token architecture discussion for an actual Atelier feature.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-brand-600 font-bold shrink-0">05 min:</span>
                      <span>Open floor for any questions you have for us.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Activity Feed & Candidate Controls (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Verified Activity Timeline */}
          <ActivityTimeline events={events} />

          {/* Self-Service Candidate Controls Card */}
          <div className="rounded-2xl border border-divider-light dark:border-divider-dark bg-surface-elevated-light dark:bg-surface-elevated-dark p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Candidate Controls
            </h4>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => setEditResumeOpen(true)}
                className="w-full text-left px-3 py-2.5 rounded-xl border border-divider-light dark:border-divider-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Update Attached Resume</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Grace window</span>
              </button>

              <button
                onClick={() => setMessageOpen(true)}
                className="w-full text-left px-3 py-2.5 rounded-xl border border-divider-light dark:border-divider-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300"
              >
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Message Hiring Lead</span>
              </button>

              {!isWithdrawn && !isRejected && (
                <button
                  onClick={() => setWithdrawOpen(true)}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-divider-light dark:border-divider-dark hover:bg-red-500/10 text-slate-500 hover:text-red-600 transition-colors flex items-center gap-2 text-xs"
                >
                  <AlertTriangle className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                  <span>Withdraw Application</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GracefulWithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        applicationId={application.id}
        onWithdrawnSuccess={loadData}
      />

      <EditResumeModal
        isOpen={editResumeOpen}
        onClose={() => setEditResumeOpen(false)}
        applicationId={application.id}
        resumesList={resumesList}
        onUpdatedSuccess={loadData}
      />

      {/* Recruiter Message Drawer/Modal */}
      {messageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-surface-elevated-light dark:bg-surface-elevated-dark border border-divider-light dark:border-divider-dark rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Message Talent Partner
            </h3>
            <p className="text-xs text-slate-500 mb-4">Direct thread to Sarah Jenkins (Talent Partner).</p>
            <form onSubmit={handleMessageSend} className="space-y-3">
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Ask about interview scheduling, role requirements, or share updated availability..."
                className="w-full p-3 text-xs bg-surface-secondary-light dark:bg-surface-secondary-dark border border-divider-light dark:border-divider-dark rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMessageOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
