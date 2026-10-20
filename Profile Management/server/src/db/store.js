import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultProfile = {
  id: 'usr_7f8a9b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c',
  username: 'alexvance',
  display_name: 'Alex Vance',
  headline: 'Staff Systems Architect & Product Craftsman',
  bio: 'Building resilient distributed web systems, spatial interfaces, and zero-anxiety identity primitives. Obsessed with sub-millisecond tactile UI interactions.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=512&q=80',
  banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
  avatar_alt_text: 'Alex wearing modern architectural studio attire in soft warm daylight',
  website_url: 'https://alexvance.design',
  email: 'alex.vance@atelier.systems',
  phone: '+1 (555) 382-9014',
  social_links: {
    github: 'alexvance',
    x: 'alexvance_dev',
    linkedin: 'alex-vance-arch',
    mastodon: '@alex@indieweb.social'
  },
  visibility_settings: {
    email: 'private',
    phone: 'private',
    real_name: 'public',
    activity_status: 'team',
    social_links: 'public'
  },
  locale_preferences: {
    timezone: 'America/New_York',
    time_format: '24h',
    week_start: 'monday',
    number_separator: 'comma',
    language: 'en'
  },
  theme_preference: 'dark',
  density_preference: 'cozy',
  quiet_hours: {
    enabled: true,
    start: '22:00',
    end: '07:30'
  },
  discoverable_by_search: true,
  account_status: 'active', // 'active' | 'quarantined' | 'pending_deletion'
  created_at: '2024-03-15T10:00:00.000Z',
  updated_at: new Date().toISOString()
};

// Initial state
let state = {
  profiles: {
    [defaultProfile.id]: { ...defaultProfile }
  },
  otherUsernames: ['admin', 'root', 'support', 'linear', 'raycast', 'johndoe', 'sarah'],
  account_deletions: [],
  audit_logs: [
    {
      id: 'log_init_001',
      user_id: defaultProfile.id,
      action: 'account_created',
      details: { method: 'sso_google' },
      ip_address: '192.168.1.42',
      created_at: '2024-03-15T10:00:00.000Z'
    },
    {
      id: 'log_init_002',
      user_id: defaultProfile.id,
      action: 'avatar_updated',
      details: { format: 'webp', size_bytes: 48200 },
      ip_address: '192.168.1.42',
      created_at: '2026-09-01T14:22:00.000Z'
    }
  ]
};

// Load persisted state if exists
function loadState() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      state = JSON.parse(data);
    } else {
      saveState();
    }
  } catch (err) {
    console.error('Failed to load db.json, using defaults:', err);
  }
}

function saveState() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

loadState();

export const store = {
  getProfile(userId = defaultProfile.id) {
    return state.profiles[userId] || null;
  },

  updateProfile(userId = defaultProfile.id, updates = {}) {
    if (!state.profiles[userId]) return null;

    const current = state.profiles[userId];
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };

    state.profiles[userId] = updated;

    // Log audit event
    this.addAuditLog(userId, 'profile_updated', {
      changed_fields: Object.keys(updates)
    });

    saveState();
    return updated;
  },

  isUsernameAvailable(username, currentUserId = defaultProfile.id) {
    const cleanUsername = username.toLowerCase().trim();
    if (state.otherUsernames.includes(cleanUsername)) {
      return false;
    }
    for (const [id, prof] of Object.entries(state.profiles)) {
      if (id !== currentUserId && prof.username.toLowerCase() === cleanUsername) {
        return false;
      }
    }
    return true;
  },

  addAuditLog(userId, action, details = {}, ip = '127.0.0.1') {
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      action,
      details,
      ip_address: ip,
      created_at: new Date().toISOString()
    };
    state.audit_logs.unshift(log);
    // Keep max 100 logs
    if (state.audit_logs.length > 100) state.audit_logs.pop();
    saveState();
    return log;
  },

  getAuditLogs(userId = defaultProfile.id) {
    return state.audit_logs.filter(l => l.user_id === userId);
  },

  deactivateAccount(userId = defaultProfile.id, reason = '') {
    if (!state.profiles[userId]) return null;
    state.profiles[userId].account_status = 'quarantined';
    state.profiles[userId].updated_at = new Date().toISOString();

    this.addAuditLog(userId, 'account_quarantined', { reason });
    saveState();
    return state.profiles[userId];
  },

  reactivateAccount(userId = defaultProfile.id) {
    if (!state.profiles[userId]) return null;
    state.profiles[userId].account_status = 'active';
    state.profiles[userId].updated_at = new Date().toISOString();

    this.addAuditLog(userId, 'account_reactivated', {});
    saveState();
    return state.profiles[userId];
  },

  scheduleAccountDeletion(userId = defaultProfile.id, reason = '') {
    if (!state.profiles[userId]) return null;
    const purgeDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    
    state.profiles[userId].account_status = 'pending_deletion';
    state.profiles[userId].updated_at = new Date().toISOString();

    const deletionRecord = {
      id: `del_${Date.now()}`,
      user_id: userId,
      scheduled_purge_at: purgeDate,
      reason,
      cancelled_at: null,
      created_at: new Date().toISOString()
    };

    state.account_deletions.push(deletionRecord);
    this.addAuditLog(userId, 'deletion_scheduled', { scheduled_purge_at: purgeDate, reason });
    saveState();
    return deletionRecord;
  },

  cancelAccountDeletion(userId = defaultProfile.id) {
    if (!state.profiles[userId]) return null;
    state.profiles[userId].account_status = 'active';
    state.profiles[userId].updated_at = new Date().toISOString();

    const activeDel = state.account_deletions.find(d => d.user_id === userId && !d.cancelled_at);
    if (activeDel) {
      activeDel.cancelled_at = new Date().toISOString();
    }

    this.addAuditLog(userId, 'deletion_cancelled', {});
    saveState();
    return { success: true, profile: state.profiles[userId] };
  },

  getPendingDeletion(userId = defaultProfile.id) {
    return state.account_deletions.find(d => d.user_id === userId && !d.cancelled_at) || null;
  }
};
