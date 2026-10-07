import type { GameSavePayload } from '../types/save';

/**
 * Computes SHA-256 checksum in browser using SubtleCrypto
 */
export async function calculateSha256(data: any): Promise<string> {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  const msgUint8 = new TextEncoder().encode(jsonStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates an encrypted/packed Base64 portable Save Capsule string
 */
export function encodeSaveCapsule(payload: GameSavePayload): string {
  try {
    const rawJson = JSON.stringify(payload);
    // Add signature header and base64 encode
    const base64 = btoa(encodeURIComponent(rawJson));
    return `CRYO_CAPSULE_V1.${payload.metadata.checksum.slice(0, 8)}.${base64}`;
  } catch (err) {
    console.error('Failed to encode save capsule:', err);
    throw new Error('Encoding failure');
  }
}

/**
 * Decodes and validates a portable Save Capsule string
 */
export function decodeSaveCapsule(capsuleStr: string): GameSavePayload {
  try {
    const trimmed = capsuleStr.trim();
    if (!trimmed.startsWith('CRYO_CAPSULE_V1.')) {
      // Fallback: check if direct JSON string
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.metadata && parsed.worldState) return parsed;
      } catch {
        // Not plain JSON
      }
      throw new Error('Invalid Capsule Header: Format must begin with CRYO_CAPSULE_V1.');
    }

    const parts = trimmed.split('.');
    if (parts.length < 3) {
      throw new Error('Malformed capsule tokens.');
    }

    const base64Data = parts.slice(2).join('.');
    const decodedJson = decodeURIComponent(atob(base64Data));
    const payload = JSON.parse(decodedJson) as GameSavePayload;

    if (!payload.metadata || !payload.worldState) {
      throw new Error('Capsule is missing required game state structures.');
    }

    return payload;
  } catch (err: any) {
    throw new Error(err.message || 'Decryption failed: Capsule data corrupted or tampered.');
  }
}
