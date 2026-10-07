import crypto from 'crypto';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedSummary?: any;
}

export function computeSha256(data: any): string {
  const serialized = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

export function validateAndSanitizeSavePayload(payload: any, rawByteLength: number): ValidationResult {
  // 1. Max payload size (< 2MB)
  const MAX_BYTES = 2 * 1024 * 1024;
  if (rawByteLength > MAX_BYTES) {
    return { valid: false, error: `Payload exceeds maximum allowable threshold (2MB). Actual: ${(rawByteLength / 1024 / 1024).toFixed(2)}MB` };
  }

  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Malformed JSON payload structure.' };
  }

  const { metadata, worldState, inventory, questJournal } = payload;
  if (!metadata || typeof metadata !== 'object') {
    return { valid: false, error: 'Save metadata object missing or invalid.' };
  }

  // 2. Schema version validation
  if (!metadata.version || typeof metadata.version !== 'string') {
    return { valid: false, error: 'Missing save schema version.' };
  }

  // 3. Progression variable sanitization & anti-tamper
  const summary = metadata.summary;
  if (!summary || typeof summary !== 'object') {
    return { valid: false, error: 'Player progress summary is required.' };
  }

  const sanitized = { ...summary };

  // Level bounds
  if (typeof sanitized.level !== 'number' || isNaN(sanitized.level) || sanitized.level < 1) {
    sanitized.level = 1;
  } else if (sanitized.level > 100) {
    sanitized.level = 100;
  }

  // HP bounds
  sanitized.maxHp = typeof sanitized.maxHp === 'number' && sanitized.maxHp > 0 ? Math.min(sanitized.maxHp, 999999) : 100;
  sanitized.hp = typeof sanitized.hp === 'number' ? Math.max(0, Math.min(sanitized.hp, sanitized.maxHp)) : sanitized.maxHp;

  // Completion percentage
  sanitized.completionPercentage = typeof sanitized.completionPercentage === 'number' 
    ? Math.max(0, Math.min(100, Math.round(sanitized.completionPercentage))) 
    : 0;

  // Gold & Playtime
  sanitized.gold = typeof sanitized.gold === 'number' ? Math.max(0, Math.min(999999999, Math.floor(sanitized.gold))) : 0;
  sanitized.playtimeSeconds = typeof sanitized.playtimeSeconds === 'number' ? Math.max(0, Math.floor(sanitized.playtimeSeconds)) : 0;

  // 4. State integrity verification
  const stateToHash = {
    worldState: worldState || {},
    inventory: inventory || {},
    questJournal: questJournal || {}
  };
  const computedHash = computeSha256(stateToHash);

  // If checksum was provided, verify it or enforce it
  if (metadata.checksum && metadata.checksum !== computedHash) {
    return {
      valid: false,
      error: `State checksum mismatch detected (Tampering / Transmission Error). Expected: ${metadata.checksum.slice(0, 8)}..., Calculated: ${computedHash.slice(0, 8)}...`
    };
  }

  return {
    valid: true,
    sanitizedSummary: sanitized
  };
}
