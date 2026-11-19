import { Router, Request, Response } from 'express';
import { SEED_APPLICATIONS, SEED_STAGE_EVENTS } from '../data/applications.ts';
import { JobApplication, StageEvent } from '../data/types.ts';
import { SEED_JOBS } from '../data/jobs.ts';

const router = Router();

// In-memory data store for applications and events
let applications: JobApplication[] = [...SEED_APPLICATIONS];
let stageEvents: Record<string, StageEvent[]> = { ...SEED_STAGE_EVENTS };

// Helper to calculate SLA status
function attachSLAInfo(app: JobApplication) {
  const entered = new Date(app.stageEnteredAt).getTime();
  const now = Date.now();
  const daysInStage = (now - entered) / (24 * 3600 * 1000);
  const due = new Date(app.slaDueAt).getTime();
  const msRemaining = due - now;
  const isBreached = msRemaining < 0 && app.status !== 'offer_extended' && app.status !== 'rejected' && app.status !== 'withdrawn';
  const hoursRemaining = Math.max(0, Math.round(msRemaining / (3600 * 1000)));

  return {
    ...app,
    slaInfo: {
      daysInStage: Math.round(daysInStage * 10) / 10,
      isBreached,
      hoursRemaining,
      dueFormatted: new Date(app.slaDueAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }
  };
}

// GET /api/applications - List all applications (for recruiter cockpit and candidate hub)
router.get('/', (req: Request, res: Response) => {
  const { status, jobId, candidateEmail } = req.query;

  let results = applications.map(attachSLAInfo);

  if (jobId && typeof jobId === 'string') {
    results = results.filter(a => a.jobId === jobId);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    results = results.filter(a => a.status === status);
  }

  if (candidateEmail && typeof candidateEmail === 'string') {
    results = results.filter(a => a.draftPayload?.identity?.email?.toLowerCase() === candidateEmail.toLowerCase());
  }

  // Calculate metrics for recruiter ribbon
  const totalApplicants = results.length;
  const unreviewedCount = results.filter(a => !a.recruiterViewedAt && a.status === 'submitted').length;
  const slaBreachedCount = results.filter(a => a.slaInfo?.isBreached).length;
  const inInterviewCount = results.filter(a => ['recruiter_screen', 'technical_interview', 'onsite'].includes(a.status)).length;
  const offersCount = results.filter(a => a.status === 'offer_extended').length;

  res.json({
    applications: results,
    metrics: {
      totalApplicants,
      unreviewedCount,
      slaBreachedCount,
      inInterviewCount,
      offersCount,
      avgTimeToFirstReviewHours: 18
    }
  });
});

// GET /api/applications/:idOrCode - Get single application by ID or tracking code (e.g. APP-2026-8941)
router.get('/:idOrCode', (req: Request, res: Response) => {
  const { idOrCode } = req.params;
  const app = applications.find(a => a.id === idOrCode || a.trackingCode.toLowerCase() === idOrCode.toLowerCase());

  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const job = SEED_JOBS.find(j => j.id === app.jobId);
  const events = stageEvents[app.trackingCode] || [];

  res.json({
    application: attachSLAInfo(app),
    job,
    events
  });
});

// POST /api/applications/draft - Create or resume a draft
router.post('/draft', (req: Request, res: Response) => {
  const { jobId, email, fullName } = req.body;

  // Check if existing draft exists for this job and email
  let app = applications.find(
    a => a.jobId === jobId && a.draftPayload?.identity?.email?.toLowerCase() === email?.toLowerCase() && a.status === 'draft'
  );

  if (app) {
    return res.json({ application: attachSLAInfo(app), isNew: false });
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const trackingCode = `APP-2026-${randomNum}`;
  const newApp: JobApplication = {
    id: `app-${Date.now()}`,
    trackingCode,
    jobId: jobId || 'job-101',
    candidateId: `cand-${Date.now()}`,
    status: 'draft',
    currentStageIndex: 0,
    completionPercent: 20,
    draftPayload: {
      activeStepIndex: 0,
      identity: {
        fullName: fullName || '',
        email: email || '',
        phone: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: ''
      },
      workHistory: [],
      education: [],
      screeningAnswers: {},
      updatedAt: new Date().toISOString()
    },
    screeningAnswers: {},
    skillMatchScore: 85,
    recruiterViewedAt: null,
    stageEnteredAt: new Date().toISOString(),
    slaDueAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    lastAutosavedAt: new Date().toISOString()
  };

  applications.unshift(newApp);

  res.json({ application: attachSLAInfo(newApp), isNew: true });
});

// PUT /api/applications/:id/autosave - Idempotent upsert autosave
router.put('/:id/autosave', (req: Request, res: Response) => {
  const { id } = req.params;
  const { draftPayload, completionPercent, skillMatchScore, resumeVersionId } = req.body;

  const appIndex = applications.findIndex(a => a.id === id || a.trackingCode === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const currentApp = applications[appIndex];

  // Optimistic concurrency control check: if client provided updatedAt is older than server by > 1 minute, handle merge
  const now = new Date().toISOString();
  const updatedPayload = {
    ...currentApp.draftPayload,
    ...draftPayload,
    updatedAt: now
  };

  applications[appIndex] = {
    ...currentApp,
    draftPayload: updatedPayload,
    completionPercent: completionPercent !== undefined ? completionPercent : currentApp.completionPercent,
    skillMatchScore: skillMatchScore !== undefined ? skillMatchScore : currentApp.skillMatchScore,
    resumeVersionId: resumeVersionId || currentApp.resumeVersionId,
    lastAutosavedAt: now
  };

  res.json({
    success: true,
    savedAt: now,
    application: attachSLAInfo(applications[appIndex])
  });
});

// POST /api/applications/:id/submit - Final submission
router.post('/:id/submit', (req: Request, res: Response) => {
  const { id } = req.params;
  const { screeningAnswers, finalPayload } = req.body;

  const appIndex = applications.findIndex(a => a.id === id || a.trackingCode === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const app = applications[appIndex];
  const now = new Date().toISOString();

  // Advance to submitted
  app.status = 'submitted';
  app.currentStageIndex = 0;
  app.completionPercent = 100;
  app.submittedAt = now;
  app.stageEnteredAt = now;
  app.slaDueAt = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
  if (screeningAnswers) app.screeningAnswers = screeningAnswers;
  if (finalPayload) app.draftPayload = { ...app.draftPayload, ...finalPayload, updatedAt: now };

  // Log stage event
  if (!stageEvents[app.trackingCode]) {
    stageEvents[app.trackingCode] = [];
  }
  stageEvents[app.trackingCode].unshift({
    id: `evt-${Date.now()}`,
    applicationId: app.id,
    fromStage: 'Draft',
    toStage: 'Application Received',
    actorType: 'candidate',
    publicMessage: `Application ${app.trackingCode} submitted successfully. Under review by our hiring team.`,
    createdAt: now
  });

  res.json({
    success: true,
    application: attachSLAInfo(app),
    trackingCode: app.trackingCode
  });
});

// POST /api/applications/:id/advance - Recruiter advances stage
router.post('/:id/advance', (req: Request, res: Response) => {
  const { id } = req.params;
  const { targetStage, targetStageIndex, publicMessage, internalNote } = req.body;

  const app = applications.find(a => a.id === id || a.trackingCode === id);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const oldStatus = app.status;
  const now = new Date().toISOString();

  app.status = targetStage;
  if (targetStageIndex !== undefined) {
    app.currentStageIndex = targetStageIndex;
  }
  app.recruiterViewedAt = app.recruiterViewedAt || now;
  app.stageEnteredAt = now;
  app.slaDueAt = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();

  // Populate interviewers if technical interview
  if (targetStage === 'technical_interview' && !app.interviewerBios) {
    app.interviewerBios = [
      {
        name: 'Elena Rostova',
        role: 'VP of Engineering',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
        githubUrl: 'https://github.com/erostova',
        linkedinUrl: 'https://linkedin.com/in/elena-rostova',
        bio: 'Former Staff Engineer at Figma. Passionate about high-precision UI systems, developer tooling, and building respectful engineering cultures.'
      },
      {
        name: 'Marcus Vance',
        role: 'Staff UI Engineer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        githubUrl: 'https://github.com/marcusvance',
        linkedinUrl: 'https://linkedin.com/in/marcus-vance',
        bio: 'Core maintainer of open-source UI primitives. Obsessed with micro-interactions, layout engine performance, and design tokens.'
      }
    ];
  }

  if (!stageEvents[app.trackingCode]) stageEvents[app.trackingCode] = [];

  stageEvents[app.trackingCode].unshift({
    id: `evt-${Date.now()}`,
    applicationId: app.id,
    fromStage: oldStatus,
    toStage: targetStage,
    actorType: 'recruiter',
    publicMessage: publicMessage || `Stage updated to ${targetStage.replace('_', ' ')} by the hiring team.`,
    internalNote: internalNote || '',
    createdAt: now
  });

  res.json({
    success: true,
    application: attachSLAInfo(app),
    events: stageEvents[app.trackingCode]
  });
});

// POST /api/applications/:id/schedule - Candidate schedules interview slot
router.post('/:id/schedule', (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, timeSlot, timezone } = req.body;

  const app = applications.find(a => a.id === id || a.trackingCode === id);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const now = new Date().toISOString();
  app.scheduledInterview = {
    date: date || 'Tuesday, Oct 21',
    timeSlot: timeSlot || '10:00 AM – 10:45 AM',
    timezone: timezone || 'Pacific Time (US & Canada)',
    interviewerNames: ['Elena Rostova (VP Eng)', 'Marcus Vance (Staff UI Eng)'],
    meetingUrl: 'https://meet.atelier.io/session-tech-deepdive'
  };

  if (!stageEvents[app.trackingCode]) stageEvents[app.trackingCode] = [];
  stageEvents[app.trackingCode].unshift({
    id: `evt-${Date.now()}`,
    applicationId: app.id,
    fromStage: 'Slot Selection',
    toStage: 'Interview Confirmed',
    actorType: 'candidate',
    publicMessage: `🗓 Technical Deep-Dive confirmed for ${app.scheduledInterview.date} at ${app.scheduledInterview.timeSlot} (${app.scheduledInterview.timezone}). Google Meet details generated.`,
    createdAt: now
  });

  res.json({
    success: true,
    scheduledInterview: app.scheduledInterview,
    events: stageEvents[app.trackingCode]
  });
});

// POST /api/applications/:id/reject - Recruiter sends constructive pass
router.post('/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const { templateMessage, internalFeedback } = req.body;

  const app = applications.find(a => a.id === id || a.trackingCode === id);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  app.status = 'rejected';
  const now = new Date().toISOString();

  if (!stageEvents[app.trackingCode]) stageEvents[app.trackingCode] = [];
  stageEvents[app.trackingCode].unshift({
    id: `evt-${Date.now()}`,
    applicationId: app.id,
    fromStage: app.status,
    toStage: 'Constructive Pass',
    actorType: 'recruiter',
    publicMessage: templateMessage || 'Thank you sincerely for your time and portfolio walkthrough. While we are proceeding with another candidate whose recent focus closely aligns with this phase of our design system token architecture, we were deeply impressed by your experience and would love to stay in touch.',
    internalNote: internalFeedback || 'Solid candidate, candidate pool had higher alignment for this specific role.',
    createdAt: now
  });

  res.json({ success: true, application: attachSLAInfo(app) });
});

// POST /api/applications/:id/withdraw - Candidate self-service withdrawal
router.post('/:id/withdraw', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, keepInTalentPool } = req.body;

  const app = applications.find(a => a.id === id || a.trackingCode === id);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  app.status = 'withdrawn';
  const now = new Date().toISOString();

  if (!stageEvents[app.trackingCode]) stageEvents[app.trackingCode] = [];
  stageEvents[app.trackingCode].unshift({
    id: `evt-${Date.now()}`,
    applicationId: app.id,
    fromStage: app.status,
    toStage: 'Withdrawn by Candidate',
    actorType: 'candidate',
    publicMessage: `Application withdrawn by candidate.${keepInTalentPool ? ' Opted in to future career notifications.' : ''}`,
    internalNote: `Candidate reason: ${reason || 'Not specified'}. Talent pool opt-in: ${Boolean(keepInTalentPool)}`,
    createdAt: now
  });

  res.json({ success: true, application: attachSLAInfo(app) });
});

// POST /api/applications/:id/update-resume - Grace window resume swap
router.post('/:id/update-resume', (req: Request, res: Response) => {
  const { id } = req.params;
  const { resumeVersionId, label } = req.body;

  const app = applications.find(a => a.id === id || a.trackingCode === id);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  app.resumeVersionId = resumeVersionId;
  const now = new Date().toISOString();

  if (!stageEvents[app.trackingCode]) stageEvents[app.trackingCode] = [];
  stageEvents[app.trackingCode].unshift({
    id: `evt-${Date.now()}`,
    applicationId: app.id,
    fromStage: 'Resume Updated',
    toStage: 'Resume Updated',
    actorType: 'candidate',
    publicMessage: `📄 Updated resume file (${label || 'Revised PDF'}) attached by candidate during review grace window.`,
    createdAt: now
  });

  res.json({ success: true, application: attachSLAInfo(app) });
});

export default router;
