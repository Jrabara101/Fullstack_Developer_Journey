import Dexie, { type EntityTable } from 'dexie';
import { DraftPayload } from '../types/index.ts';

export interface LocalDraftRecord {
  id: string; // e.g. "draft_job-101"
  jobId: string;
  trackingCode?: string;
  draftPayload: DraftPayload;
  completionPercent: number;
  lastSavedAt: string;
  isSynced: boolean;
}

class AtelierDatabase extends Dexie {
  drafts!: EntityTable<LocalDraftRecord, 'id'>;

  constructor() {
    super('AtelierCandidateDB');
    this.version(1).stores({
      drafts: 'id, jobId, trackingCode, lastSavedAt, isSynced'
    });
  }
}

export const db = new AtelierDatabase();

export async function saveLocalDraft(
  jobId: string,
  draftPayload: DraftPayload,
  completionPercent: number,
  trackingCode?: string
): Promise<LocalDraftRecord> {
  const record: LocalDraftRecord = {
    id: `draft_${jobId}`,
    jobId,
    trackingCode,
    draftPayload,
    completionPercent,
    lastSavedAt: new Date().toISOString(),
    isSynced: false
  };

  await db.drafts.put(record);
  return record;
}

export async function getLocalDraft(jobId: string): Promise<LocalDraftRecord | undefined> {
  return await db.drafts.get(`draft_${jobId}`);
}

export async function markDraftSynced(jobId: string): Promise<void> {
  await db.drafts.update(`draft_${jobId}`, { isSynced: true });
}

export async function getAllLocalDrafts(): Promise<LocalDraftRecord[]> {
  return await db.drafts.toArray();
}
