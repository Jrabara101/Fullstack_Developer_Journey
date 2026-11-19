import { JobPosting, JobApplication, ResumeVersion, StageEvent, SkillAlignment, LinkHealthReport } from '../types/index.ts';

const API_BASE = '/api';

export async function fetchJobs(params?: { search?: string; department?: string; locationType?: string; minSalary?: number }): Promise<{ jobs: JobPosting[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.department) query.set('department', params.department);
  if (params?.locationType) query.set('locationType', params.locationType);
  if (params?.minSalary) query.set('minSalary', String(params.minSalary));

  const res = await fetch(`${API_BASE}/jobs?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function fetchJobBySlug(slug: string): Promise<{ job: JobPosting }> {
  const res = await fetch(`${API_BASE}/jobs/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
}

export async function fetchResumes(): Promise<{ resumes: ResumeVersion[] }> {
  const res = await fetch(`${API_BASE}/resumes`);
  if (!res.ok) throw new Error('Failed to fetch resumes');
  return res.json();
}

export async function parseResume(payload: { text?: string; jobId?: string; sampleId?: string }): Promise<{
  resume: ResumeVersion;
  alignment: SkillAlignment;
  parseDurationMs: number;
}> {
  const res = await fetch(`${API_BASE}/resumes/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to parse resume');
  return res.json();
}

export async function verifyLink(url: string): Promise<{ report: LinkHealthReport }> {
  const res = await fetch(`${API_BASE}/resumes/check-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!res.ok) throw new Error('Failed to verify link');
  return res.json();
}

export async function fetchApplications(params?: { status?: string; jobId?: string; candidateEmail?: string }): Promise<{
  applications: JobApplication[];
  metrics: {
    totalApplicants: number;
    unreviewedCount: number;
    slaBreachedCount: number;
    inInterviewCount: number;
    offersCount: number;
    avgTimeToFirstReviewHours: number;
  };
}> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.jobId) query.set('jobId', params.jobId);
  if (params?.candidateEmail) query.set('candidateEmail', params.candidateEmail);

  const res = await fetch(`${API_BASE}/applications?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function fetchApplicationByIdOrCode(idOrCode: string): Promise<{
  application: JobApplication;
  job: JobPosting;
  events: StageEvent[];
}> {
  const res = await fetch(`${API_BASE}/applications/${idOrCode}`);
  if (!res.ok) throw new Error('Failed to fetch application');
  return res.json();
}

export async function getOrCreateDraft(payload: { jobId: string; email?: string; fullName?: string }): Promise<{
  application: JobApplication;
  isNew: boolean;
}> {
  const res = await fetch(`${API_BASE}/applications/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to get/create draft');
  return res.json();
}

export async function autosaveDraft(
  applicationId: string,
  payload: {
    draftPayload: any;
    completionPercent?: number;
    skillMatchScore?: number;
    resumeVersionId?: string;
  }
): Promise<{ success: boolean; savedAt: string; application: JobApplication }> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/autosave`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Autosave failed');
  return res.json();
}

export async function submitApplication(
  applicationId: string,
  payload: { screeningAnswers?: Record<string, string>; finalPayload?: any }
): Promise<{ success: boolean; application: JobApplication; trackingCode: string }> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to submit application');
  return res.json();
}

export async function advanceApplicationStage(
  applicationId: string,
  payload: { targetStage: string; targetStageIndex?: number; publicMessage?: string; internalNote?: string }
): Promise<{ success: boolean; application: JobApplication; events: StageEvent[] }> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to advance application stage');
  return res.json();
}

export async function scheduleInterviewSlot(
  applicationId: string,
  payload: { date: string; timeSlot: string; timezone?: string }
): Promise<{ success: boolean; scheduledInterview: any; events: StageEvent[] }> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to schedule slot');
  return res.json();
}

export async function createHandoffToken(payload: {
  applicationId: string;
  trackingCode: string;
  hostUrl?: string;
}): Promise<{
  success: boolean;
  token: string;
  magicUrl: string;
  qrCodeSvg: string;
  expiresAt: string;
}> {
  const res = await fetch(`${API_BASE}/drafts/handoff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create handoff token');
  return res.json();
}

export async function redeemHandoffToken(token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/drafts/handoff/${token}`);
  if (!res.ok) throw new Error('Failed to redeem handoff token');
  return res.json();
}

export async function withdrawApplication(
  applicationId: string,
  payload: { reason?: string; keepInTalentPool?: boolean }
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to withdraw application');
  return res.json();
}

export async function updateApplicationResume(
  applicationId: string,
  payload: { resumeVersionId: string; label?: string }
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/update-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update resume');
  return res.json();
}
