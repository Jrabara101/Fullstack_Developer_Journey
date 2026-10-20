// Cognitive Fatigue Shield & Dynamic Event Batching Engine

export class FatigueShieldEngine {
  constructor(preferences) {
    this.preferences = preferences;
    this.aggregationBuffer = new Map(); // entityKey -> Array of raw events
    this.bufferWindowMs = 10 * 60 * 1000; // 10 minutes quiet window
    this.dailyCount = 4; // simulated count today
    this.heldQuietQueue = [];
  }

  updatePreferences(prefs) {
    this.preferences = prefs;
  }

  // Deduplication check: user_id:entity_type:entity_id:action
  generateDedupHash(event) {
    return `${event.targetEntity?.type || 'item'}:${event.targetEntity?.name || 'entity'}:${event.actionType || 'ping'}`;
  }

  // Check if current time falls within Do Not Disturb quiet hours
  isDndActive(currentTime = new Date()) {
    const { dndEnabled, dndStart, dndEnd } = this.preferences.global;
    if (!dndEnabled || !dndStart || !dndEnd) return false;

    const [startH, startM] = dndStart.split(':').map(Number);
    const [endH, endM] = dndEnd.split(':').map(Number);

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes > endMinutes) {
      // Over midnight (e.g. 22:00 to 08:00)
      return nowMinutes >= startMinutes || nowMinutes < endMinutes;
    } else {
      return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    }
  }

  // Rate ceiling burnout safeguard
  hasExceededBurnoutCeiling() {
    const limit = this.preferences.global.burnoutSafeguardMaxPerDay || 15;
    return this.dailyCount >= limit;
  }

  // Evaluate incoming event against policies
  processIncomingEvent(rawEvent, currentTime = new Date()) {
    // 1. Critical security alerts always bypass DND and batching
    if (rawEvent.category === 'security' || rawEvent.metadata?.priority === 'critical') {
      this.dailyCount++;
      return {
        status: 'instant_dispatch',
        reason: 'Critical security alerts bypass all quiet hours and rate ceilings for safety.',
        notification: rawEvent
      };
    }

    // 2. Check DND
    if (this.isDndActive(currentTime)) {
      this.heldQuietQueue.push(rawEvent);
      return {
        status: 'queued_dnd',
        reason: `DND quiet hours active (${this.preferences.global.dndStart} - ${this.preferences.global.dndEnd}). Queued for circadian morning recap.`,
        heldCount: this.heldQuietQueue.length,
        notification: null
      };
    }

    // 3. Burnout check
    if (this.hasExceededBurnoutCeiling() && rawEvent.category === 'product') {
      return {
        status: 'rate_suppressed',
        reason: `Daily notification threshold of ${this.preferences.global.burnoutSafeguardMaxPerDay} reached. Marketing/social ping suppressed to protect attention.`,
        notification: null
      };
    }

    // 4. Batch Aggregation Buffer check (if rapid comments on same entity)
    const entityKey = `${rawEvent.targetEntity?.type || 'item'}:${rawEvent.targetEntity?.name || 'entity'}`;
    const existing = this.aggregationBuffer.get(entityKey) || [];

    if (existing.length > 0) {
      // Aggregate into rolling digest
      const authors = Array.from(new Set([rawEvent.actor.name, ...existing.map(e => e.actor.name)]));
      const firstAuthor = authors[0];
      const othersCount = authors.length - 1;

      const aggregatedTitle = othersCount > 0 
        ? `${firstAuthor} and ${othersCount} other${othersCount > 1 ? 's' : ''} commented on ${rawEvent.targetEntity.name}`
        : `${firstAuthor} commented on ${rawEvent.targetEntity.name}`;

      const aggregatedNotification = {
        ...rawEvent,
        id: `batch-${Date.now()}`,
        title: aggregatedTitle,
        body: `Aggregated activity digest: ${authors.length} updates during the 10-minute quiet buffer.`,
        createdAt: new Date().toISOString(),
        metadata: {
          ...rawEvent.metadata,
          isAggregatedDigest: true,
          batchCount: authors.length,
          contributorNames: authors
        }
      };

      this.aggregationBuffer.set(entityKey, [...existing, rawEvent]);
      this.dailyCount++;

      return {
        status: 'aggregated_digest',
        reason: `Aggregated ${authors.length} rapid-fire events into a unified digest to prevent cognitive fatigue.`,
        notification: aggregatedNotification
      };
    }

    // Normal dispatch
    this.aggregationBuffer.set(entityKey, [rawEvent]);
    setTimeout(() => {
      this.aggregationBuffer.delete(entityKey);
    }, this.bufferWindowMs);

    this.dailyCount++;
    return {
      status: 'instant_dispatch',
      reason: 'Passed all rate limits and fatigue filters. Dispatched directly.',
      notification: rawEvent
    };
  }

  // Release held morning queue
  releaseMorningStack() {
    const items = [...this.heldQuietQueue];
    this.heldQuietQueue = [];
    return items;
  }
}
