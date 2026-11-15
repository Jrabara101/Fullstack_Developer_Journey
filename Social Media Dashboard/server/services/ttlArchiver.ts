import type { DatabaseSync } from 'node:sqlite';

export class TtlStoryArchiver {
  private timer: NodeJS.Timeout | null = null;
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  /**
   * Transitions stories past their 24h TTL into archived state while keeping
   * highlighted stories available inside the author's Profile Highlights rail.
   */
  runSweep(now: Date = new Date()): number {
    const nowIso = now.toISOString();
    const res = this.db
      .prepare(
        `UPDATE stories
         SET is_archived = 1
         WHERE expires_at <= ? AND is_archived = 0`
      )
      .run(nowIso);
    return Number(res.changes || 0);
  }

  start(intervalMs = 60_000) {
    this.runSweep();
    this.timer = setInterval(() => {
      const archived = this.runSweep();
      if (archived > 0) {
        console.log(`[TTL Archiver] Archived ${archived} expired story slide(s).`);
      }
    }, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
