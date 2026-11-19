export type LocationType = 'remote' | 'hybrid' | 'onsite';

export interface JobPosting {
  id: string;
  slug: string;
  title: string;
  department: string;
  companyName: string;
  companyLogo: string;
  locationType: LocationType;
  location: string;
  timezoneRange: string;
  salaryMinCents: number;
  salaryMaxCents: number;
  currency: string;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
  responsibilities: string[];
  screeningQuestions: {
    id: string;
    question: string;
    placeholder?: string;
    required: boolean;
    recommendedWordCount?: number;
  }[];
  pipelineStages: string[];
  slaBusinessDays: number;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
}

export interface BoundingBox {
  id: string;
  fieldKey: string;
  page: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number;
  height: number;
  label: string;
  textSnippet: string;
}

export interface ParsedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  workHistory?: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    highlights: string[];
  }[];
  education?: {
    id: string;
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
  }[];
  skills?: string[];
  boundingBoxes: BoundingBox[];
}

export interface ResumeVersion {
  id: string;
  candidateId: string;
  label: string; // e.g. "Staff Frontend & Design Systems CV"
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storageKey?: string;
  extractedText?: string;
  parsedData: ParsedResumeData;
  linkHealthReport: {
    url: string;
    type: 'github' | 'linkedin' | 'portfolio' | 'other';
    status: 'ok' | 'broken' | 'redirect';
    statusCode: number;
    checkedAt: string;
    message: string;
  }[];
  isPrimary: boolean;
  createdAt: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'recruiter_screen'
  | 'technical_interview'
  | 'onsite'
  | 'offer_extended'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface StageEvent {
  id: string;
  applicationId: string;
  fromStage: string;
  toStage: string;
  actorType: 'candidate' | 'recruiter' | 'system_sla';
  publicMessage: string;
  internalNote?: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  trackingCode: string; // e.g. "APP-2026-8941"
  jobId: string;
  candidateId: string;
  resumeVersionId?: string;
  status: ApplicationStatus;
  currentStageIndex: number;
  completionPercent: number;
  draftPayload: {
    activeStepIndex: number;
    identity: {
      fullName: string;
      email: string;
      phone: string;
      timezone: string;
      githubUrl: string;
      linkedinUrl: string;
      portfolioUrl: string;
    };
    workHistory: any[];
    education: any[];
    screeningAnswers: Record<string, string>;
    selectedResumeId?: string;
    updatedAt: string;
  };
  screeningAnswers: Record<string, string>;
  skillMatchScore: number;
  recruiterViewedAt?: string | null;
  stageEnteredAt: string;
  slaDueAt: string;
  submittedAt?: string | null;
  lastAutosavedAt: string;
  scheduledInterview?: {
    date: string;
    timeSlot: string;
    timezone: string;
    interviewerNames: string[];
    meetingUrl: string;
  };
  interviewerBios?: {
    name: string;
    role: string;
    avatarUrl: string;
    githubUrl?: string;
    linkedinUrl?: string;
    bio: string;
  }[];
  redactedView?: boolean;
}
