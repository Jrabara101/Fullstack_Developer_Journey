import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Workspace, OnboardingState, StepDelegation, TelemetryEvent, SampleDataRecord } from './types';
import { generateSampleData } from './sampleData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  workspaces: Record<string, Workspace>;
  onboarding_states: Record<string, OnboardingState>;
  step_delegations: Record<string, StepDelegation>;
  telemetry_events: TelemetryEvent[];
  sample_data_records: SampleDataRecord[];
}

// Initial default state
const DEFAULT_WORKSPACE_ID = 'ws_default_101';
const DEFAULT_USER_ID = 'usr_alex_01';

const INITIAL_DB: DatabaseSchema = {
  workspaces: {
    [DEFAULT_WORKSPACE_ID]: {
      id: DEFAULT_WORKSPACE_ID,
      name: 'Acme Cloud Studio',
      slug: 'acme-studio',
      domain: 'acme.inc',
      brand_color: '#4F46E5',
      logo_url: 'https://avatar.vercel.sh/acme.svg?text=AC',
      industry_template: 'saas',
      has_sample_data: true,
      trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      onboarding_completed_at: null,
      created_at: new Date().toISOString()
    }
  },
  onboarding_states: {
    [DEFAULT_WORKSPACE_ID]: {
      workspace_id: DEFAULT_WORKSPACE_ID,
      user_id: DEFAULT_USER_ID,
      selected_persona: 'engineering',
      selected_goals: ['ci_cd_telemetry', 'api_monitoring'],
      current_step_slug: 'identity',
      steps_status: {
        identity: 'in_progress',
        persona: 'upcoming',
        integrations: 'upcoming',
        team: 'upcoming'
      },
      completion_percent: 20, // Endowed progress starts at 20%!
      reward_claimed: false,
      updated_at: new Date().toISOString()
    }
  },
  step_delegations: {},
  telemetry_events: [],
  sample_data_records: []
};

// Seed initial sample data for default workspace
INITIAL_DB.sample_data_records = generateSampleData(DEFAULT_WORKSPACE_ID, 'saas');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to read db.json, initializing fresh store', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json', e);
    }
  }

  // Workspaces
  getWorkspace(id: string = DEFAULT_WORKSPACE_ID): Workspace {
    if (!this.data.workspaces[id]) {
      this.data.workspaces[id] = {
        ...INITIAL_DB.workspaces[DEFAULT_WORKSPACE_ID],
        id
      };
      this.save();
    }
    return this.data.workspaces[id];
  }

  updateWorkspace(id: string, updates: Partial<Workspace>): Workspace {
    const ws = this.getWorkspace(id);
    this.data.workspaces[id] = { ...ws, ...updates };
    this.save();
    return this.data.workspaces[id];
  }

  // Onboarding States
  getOnboardingState(workspaceId: string = DEFAULT_WORKSPACE_ID): OnboardingState {
    if (!this.data.onboarding_states[workspaceId]) {
      this.data.onboarding_states[workspaceId] = {
        ...INITIAL_DB.onboarding_states[DEFAULT_WORKSPACE_ID],
        workspace_id: workspaceId
      };
      this.save();
    }
    return this.data.onboarding_states[workspaceId];
  }

  updateOnboardingState(workspaceId: string, updates: Partial<OnboardingState>): OnboardingState {
    const state = this.getOnboardingState(workspaceId);
    this.data.onboarding_states[workspaceId] = {
      ...state,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.onboarding_states[workspaceId];
  }

  // Step Delegations
  createDelegation(delegation: Omit<StepDelegation, 'id' | 'status' | 'completed_at'>): StepDelegation {
    const id = `del_${Math.random().toString(36).substring(2, 9)}`;
    const newDelegation: StepDelegation = {
      ...delegation,
      id,
      status: 'pending',
      completed_at: null
    };
    this.data.step_delegations[newDelegation.magic_token_hash] = newDelegation;
    
    // Update step status in onboarding_state
    const state = this.getOnboardingState(delegation.workspace_id);
    state.steps_status[delegation.step_slug] = 'delegated';
    this.updateOnboardingState(delegation.workspace_id, { steps_status: state.steps_status });

    this.save();
    return newDelegation;
  }

  getDelegationByToken(token: string): StepDelegation | null {
    return this.data.step_delegations[token] || null;
  }

  completeDelegation(token: string, assigneeName?: string): StepDelegation | null {
    const delegation = this.data.step_delegations[token];
    if (!delegation) return null;
    
    delegation.status = 'completed';
    delegation.completed_at = new Date().toISOString();
    if (assigneeName) delegation.assignee_name = assigneeName;

    // Update onboarding state
    const state = this.getOnboardingState(delegation.workspace_id);
    state.steps_status[delegation.step_slug] = 'completed';
    this.updateOnboardingState(delegation.workspace_id, { steps_status: state.steps_status });

    this.save();
    return delegation;
  }

  // Sample Data operations
  seedSampleData(workspaceId: string, industry: 'saas' | 'fintech' | 'ecommerce' | 'agency'): SampleDataRecord[] {
    // Clear old sample data first
    this.purgeSampleData(workspaceId);
    const records = generateSampleData(workspaceId, industry);
    this.data.sample_data_records.push(...records);
    
    const ws = this.getWorkspace(workspaceId);
    this.updateWorkspace(workspaceId, { has_sample_data: true, industry_template: industry });
    
    this.save();
    return records;
  }

  purgeSampleData(workspaceId: string): number {
    const beforeCount = this.data.sample_data_records.length;
    this.data.sample_data_records = this.data.sample_data_records.filter(
      r => !(r.workspace_id === workspaceId && r.is_sample_data)
    );
    const purged = beforeCount - this.data.sample_data_records.length;
    
    this.updateWorkspace(workspaceId, { has_sample_data: false });
    this.save();
    return purged;
  }

  getSampleData(workspaceId: string): SampleDataRecord[] {
    return this.data.sample_data_records.filter(r => r.workspace_id === workspaceId);
  }

  // Telemetry
  logTelemetry(event: Omit<TelemetryEvent, 'id' | 'created_at'>): TelemetryEvent {
    const newEvent: TelemetryEvent = {
      ...event,
      id: `tel_${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString()
    };
    this.data.telemetry_events.push(newEvent);
    // Keep max 500 events
    if (this.data.telemetry_events.length > 500) {
      this.data.telemetry_events.shift();
    }
    this.save();
    return newEvent;
  }

  getTelemetryEvents(): TelemetryEvent[] {
    return this.data.telemetry_events;
  }
}

export const db = new Database();
