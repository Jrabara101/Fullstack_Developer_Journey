export type RolePersona = 'founder' | 'engineering' | 'product' | 'operations';
export type IndustryTemplate = 'saas' | 'fintech' | 'ecommerce' | 'agency';
export type StepStatus = 'upcoming' | 'in_progress' | 'completed' | 'skipped' | 'delegated';
export type ProgressStyle = 'segmented' | 'radial' | 'milestones';

export interface WorkspaceDraft {
  name: string;
  slug: string;
  domain: string;
  brandColor: string;
  logoUrl: string;
  industryTemplate: IndustryTemplate;
  hasSampleData: boolean;
  trialDaysLeft: number;
}

export interface EnrichedCompanyData {
  domain: string;
  name: string;
  slug: string;
  brandColor: string;
  logoUrl: string;
  industry: IndustryTemplate;
  teamSize: string;
  description: string;
  teammatesAvailable: Array<{
    name: string;
    email: string;
    avatar: string;
    role: string;
  }>;
}

export interface DelegatedStepInfo {
  email: string;
  token: string;
  status: 'pending' | 'completed';
  completedBy?: string;
  completedAt?: string;
  note?: string;
}

export interface TelemetryEvent {
  id: string;
  step_slug: string;
  event_type: 'step_viewed' | 'step_completed' | 'step_skipped' | 'step_delegated' | 'validation_error';
  duration_ms: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SampleRecord {
  id: string;
  entity_type: 'metric' | 'activity' | 'pipeline' | 'team';
  title: string;
  status: string;
  value: string;
  is_sample_data: boolean;
  created_at: string;
}
