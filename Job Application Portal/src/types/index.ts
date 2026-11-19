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

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
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
  workHistory?: WorkExperience[];
  education?: Education[];
  skills?: string[];
  boundingBoxes: BoundingBox[];
}

export interface LinkHealthReport {
  url: string;
  type: 'github' | 'linkedin' | 'portfolio' | 'other';
  status: 'ok' | 'broken' | 'warning';
  statusCode: number;
  checkedAt: string;
  message: string;
}

export interface ResumeVersion {
  id: string;
  candidateId: string;
  label: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storageKey?: string;
  extractedText?: string;
  parsedData: ParsedResumeData;
  linkHealthReport: LinkHealthReport[];
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

export interface InterviewerBio {
  name: string;
  role: string;
  avatarUrl: string;
  githubUrl?: string;
  linkedinUrl?: string;
  bio: string;
}

export interface ScheduledInterview {
  date: string;
  timeSlot: string;
  timezone: string;
  interviewerNames: string[];
  meetingUrl: string;
}

export interface DraftPayload {
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
  workHistory: WorkExperience[];
  education: Education[];
  screeningAnswers: Record<string, string>;
  selectedResumeId?: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  trackingCode: string;
  jobId: string;
  candidateId: string;
  resumeVersionId?: string;
  status: ApplicationStatus;
  currentStageIndex: number;
  completionPercent: number;
  draftPayload: DraftPayload;
  screeningAnswers: Record<string, string>;
  skillMatchScore: number;
  recruiterViewedAt?: string | null;
  stageEnteredAt: string;
  slaDueAt: string;
  submittedAt?: string | null;
  lastAutosavedAt: string;
  interviewerBios?: InterviewerBio[];
  scheduledInterview?: ScheduledInterview;
  slaInfo?: {
    daysInStage: number;
    isBreached: boolean;
    hoursRemaining: number;
    dueFormatted: string;
  };
}

export interface SkillAlignment {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  tip?: string;
}
