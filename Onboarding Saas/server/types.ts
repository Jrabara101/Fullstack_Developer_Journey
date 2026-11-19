export interface Workspace {
  id: string;
  name: string;
  slug: string;
  domain: string;
  brand_color: string;
  logo_url: string;
  industry_template: 'saas' | 'fintech' | 'ecommerce' | 'agency';
  has_sample_data: boolean;
  trial_ends_at: string;
  onboarding_completed_at: string | null;
  created_at: string;
}

export type StepStatus = 'upcoming' | 'in_progress' | 'completed' | 'skipped' | 'delegated';

export interface OnboardingState {
  workspace_id: string;
  user_id: string;
  selected_persona: 'founder' | 'engineering' | 'product' | 'operations' | null;
  selected_goals: string[];
  current_step_slug: string;
  steps_status: Record<string, StepStatus>;
  completion_percent: number;
  reward_claimed: boolean;
  updated_at: string;
}

export interface StepDelegation {
  id: string;
  workspace_id: string;
  step_slug: string;
  invited_by_user_id: string;
  assignee_email: string;
  magic_token_hash: string;
  note: string;
  status: 'pending' | 'viewed' | 'completed';
  expires_at: string;
  completed_at: string | null;
  assignee_name?: string;
}

export interface TelemetryEvent {
  id: string;
  workspace_id: string;
  user_id: string;
  step_slug: string;
  event_type: 'step_viewed' | 'step_completed' | 'step_skipped' | 'step_delegated' | 'validation_error';
  duration_ms: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SampleDataRecord {
  id: string;
  workspace_id: string;
  entity_type: 'metric' | 'activity' | 'pipeline' | 'team';
  title: string;
  status: string;
  value: string;
  is_sample_data: boolean;
  created_at: string;
}
