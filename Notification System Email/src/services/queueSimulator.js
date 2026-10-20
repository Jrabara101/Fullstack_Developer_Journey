// BullMQ + Redis Queue Simulation Architecture
export class QueueSimulator {
  constructor() {
    this.jobs = [
      {
        id: 'job-1094',
        queue: 'instant-dispatch',
        name: 'send-inapp-websocket',
        status: 'completed',
        latencyMs: 14,
        dedupHash: 'comment:Q4 Product Strategy Roadmap:quick_reply',
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toLocaleTimeString(),
        payload: { userId: 'usr_8819', channel: 'in_app' }
      },
      {
        id: 'job-1095',
        queue: 'instant-dispatch',
        name: 'render-resend-transactional-email',
        status: 'completed',
        latencyMs: 82,
        dedupHash: 'comment:Q4 Product Strategy Roadmap:quick_reply',
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toLocaleTimeString(),
        payload: { template: 'comment.mention', provider: 'resend', recipient: 'dev@acme.corp' }
      },
      {
        id: 'job-1096',
        queue: 'escalation-fallback',
        name: 'check-unread-escalation',
        status: 'delayed',
        delayRemainingMinutes: 2,
        dedupHash: 'pull_request:PR #412:approve_pr',
        timestamp: new Date(Date.now() - 28 * 60 * 1000).toLocaleTimeString(),
        payload: { notificationId: 'notif-2', fallbackChannel: 'email', escalationTimeoutMin: 30 }
      },
      {
        id: 'job-1097',
        queue: 'instant-dispatch',
        name: 'send-security-sms-and-push',
        status: 'completed',
        latencyMs: 9,
        dedupHash: 'auth_session:Suspicious Session Login Detected:security_action',
        timestamp: new Date(Date.now() - 52 * 60 * 1000).toLocaleTimeString(),
        payload: { priority: 'critical', provider: 'postmark' }
      },
      {
        id: 'job-1098',
        queue: 'digest-cron',
        name: 'compile-daily-summary',
        status: 'completed',
        latencyMs: 310,
        timestamp: '08:30:00 AM',
        payload: { usersProcessed: 1420, digestRecipients: 890 }
      }
    ];
  }

  getJobs() {
    return [...this.jobs];
  }

  addJob(jobData) {
    const newJob = {
      id: `job-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      latencyMs: Math.floor(10 + Math.random() * 70),
      status: jobData.status || 'completed',
      ...jobData
    };
    this.jobs.unshift(newJob);
    if (this.jobs.length > 30) this.jobs.pop();
    return newJob;
  }
}

export const queueSimulator = new QueueSimulator();
