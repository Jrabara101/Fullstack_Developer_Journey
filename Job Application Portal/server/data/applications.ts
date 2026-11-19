import { JobApplication, StageEvent } from './types.ts';

export const SEED_STAGE_EVENTS: Record<string, StageEvent[]> = {
  'APP-2026-8941': [
    {
      id: 'evt-1',
      applicationId: 'app-alex-1',
      fromStage: 'none',
      toStage: 'Application Received',
      actorType: 'candidate',
      publicMessage: 'Application APP-2026-8941 received & confirmation receipt logged.',
      internalNote: 'Candidate applied via Web with Staff Frontend & Design Systems CV.',
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'evt-2',
      applicationId: 'app-alex-1',
      fromStage: 'Application Received',
      toStage: 'Resume Reviewed by Hiring Team',
      actorType: 'recruiter',
      publicMessage: '👁 Your resume, GitHub, and portfolio were reviewed by the Engineering Hiring Team.',
      internalNote: 'Exceptional background at Vercel & Stripe. Strong fit for token architecture.',
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'evt-3',
      applicationId: 'app-alex-1',
      fromStage: 'Resume Reviewed by Hiring Team',
      toStage: 'Recruiter Screen',
      actorType: 'recruiter',
      publicMessage: 'Recruiter introductory conversation completed with @sarah (Talent Lead).',
      internalNote: 'Super clear communicator, target compensation matches band ($175k-$205k).',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'evt-4',
      applicationId: 'app-alex-1',
      fromStage: 'Recruiter Screen',
      toStage: 'Technical / Architecture Deep-Dive',
      actorType: 'recruiter',
      publicMessage: '🎉 Advanced to Stage 4: Technical Deep-Dive! Please select a 45-minute calendar slot below.',
      internalNote: 'Invited to 45m system design with Elena and Marcus.',
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ],
  'APP-2026-4192': [
    {
      id: 'evt-sc-1',
      applicationId: 'app-sarah-1',
      fromStage: 'none',
      toStage: 'Application Received',
      actorType: 'candidate',
      publicMessage: 'Application received and securely queued.',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'evt-sc-2',
      applicationId: 'app-sarah-1',
      fromStage: 'Application Received',
      toStage: 'Resume Reviewed by Hiring Team',
      actorType: 'recruiter',
      publicMessage: '👁 Resume under active review by Hiring Manager.',
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ],
  'APP-2026-1049': [
    {
      id: 'evt-jl-1',
      applicationId: 'app-jordan-1',
      fromStage: 'none',
      toStage: 'Application Received',
      actorType: 'candidate',
      publicMessage: 'Application received.',
      internalNote: 'Applied 6 days ago. SLA limit exceeded (5 days) — needs immediate review!',
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
    }
  ],
  'APP-2026-7731': [
    {
      id: 'evt-ml-1',
      applicationId: 'app-maya-1',
      fromStage: 'Team Onsite',
      toStage: 'Decision & Offer',
      actorType: 'recruiter',
      publicMessage: '🎊 Congratulations! Offer package extended by VP of People and VP of Engineering.',
      internalNote: 'Top candidate. Unanimous hire recommendation across all 4 onsite interviewers.',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    }
  ]
};

export const SEED_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-alex-1',
    trackingCode: 'APP-2026-8941',
    jobId: 'job-101',
    candidateId: 'cand-alex-rivera',
    resumeVersionId: 'resume-alex-fe',
    status: 'technical_interview',
    currentStageIndex: 3, // 0: Received, 1: Reviewed, 2: Screen, 3: Tech Deep-Dive, 4: Onsite, 5: Offer
    completionPercent: 100,
    draftPayload: {
      activeStepIndex: 3,
      identity: {
        fullName: 'Alex Rivera',
        email: 'alex.rivera@atelier-dev.io',
        phone: '+1 (415) 890-4412',
        timezone: 'America/Los_Angeles',
        githubUrl: 'https://github.com/arivera',
        linkedinUrl: 'https://linkedin.com/in/alex-rivera-fe',
        portfolioUrl: 'https://alexrivera.design'
      },
      workHistory: [
        {
          id: 'work-1',
          company: 'Vercel',
          role: 'Senior Frontend Engineer',
          startDate: '2023-01',
          endDate: 'Present',
          isCurrent: true,
          description: 'Spearheaded Next.js Design System primitive token architecture and multi-tab draft sync.',
          highlights: ['Reduced bundle overhead by 34% across 80+ packages.', 'Enforced WCAG 2.1 AAA compliance.']
        }
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science & HCI',
          graduationYear: '2018'
        }
      ],
      screeningAnswers: {
        q1: 'At Vercel, I architected a zero-latency form state engine that combined optimistic IndexedDB persistence with debounced REST sync. To prevent race conditions across multiple browser tabs, we used BroadcastChannel for leader-election tab synchronization. When offline, changes queued in IndexedDB with exponential backoff retries upon reconnection. This eliminated user data loss across 10M+ sessions and reduced support tickets related to abandoned forms by 88%.',
        q2: 'We integrated axe-core into our pull request linting gates, requiring zero high-severity accessibility violations before merge. In addition, we built keyboard-first navigation primitives with roving tabindex and ARIA live regions for screen readers, backed by monthly manual audits with VoiceOver and NVDA users.'
      },
      selectedResumeId: 'resume-alex-fe',
      updatedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
    },
    screeningAnswers: {
      q1: 'At Vercel, I architected a zero-latency form state engine that combined optimistic IndexedDB persistence with debounced REST sync. To prevent race conditions across multiple browser tabs, we used BroadcastChannel for leader-election tab synchronization. When offline, changes queued in IndexedDB with exponential backoff retries upon reconnection. This eliminated user data loss across 10M+ sessions and reduced support tickets related to abandoned forms by 88%.',
      q2: 'We integrated axe-core into our pull request linting gates, requiring zero high-severity accessibility violations before merge. In addition, we built keyboard-first navigation primitives with roving tabindex and ARIA live regions for screen readers, backed by monthly manual audits with VoiceOver and NVDA users.'
    },
    skillMatchScore: 100,
    recruiterViewedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    stageEnteredAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    slaDueAt: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    lastAutosavedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    interviewerBios: [
      {
        name: 'Elena Rostova',
        role: 'VP of Engineering',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
        githubUrl: 'https://github.com/erostova',
        linkedinUrl: 'https://linkedin.com/in/elena-rostova',
        bio: 'Former Staff Engineer at Figma. Passionate about high-precision UI systems, developer tooling, and building respectful engineering cultures.'
      },
      {
        name: 'Marcus Vance',
        role: 'Staff UI Engineer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        githubUrl: 'https://github.com/marcusvance',
        linkedinUrl: 'https://linkedin.com/in/marcus-vance',
        bio: 'Core maintainer of open-source UI primitives. Obsessed with micro-interactions, layout engine performance, and design tokens.'
      }
    ]
  },
  {
    id: 'app-sarah-1',
    trackingCode: 'APP-2026-4192',
    jobId: 'job-102',
    candidateId: 'cand-sarah-chen',
    status: 'under_review',
    currentStageIndex: 1,
    completionPercent: 100,
    draftPayload: {
      activeStepIndex: 3,
      identity: {
        fullName: 'Sarah Chen',
        email: 'sarah.chen@devmail.io',
        phone: '+1 (206) 555-0198',
        timezone: 'America/Los_Angeles',
        githubUrl: 'https://github.com/sarahchen',
        linkedinUrl: 'https://linkedin.com/in/sarah-chen-dev',
        portfolioUrl: 'https://sarahchen.io'
      },
      workHistory: [
        {
          id: 'work-sc-1',
          company: 'Linear Labs',
          role: 'Senior Full-Stack Engineer',
          startDate: '2022-04',
          endDate: 'Present',
          isCurrent: true,
          description: 'Engineered synchronization protocols and local SQLite cache.',
          highlights: ['Built offline-first issue tracking and instantaneous search.']
        }
      ],
      education: [],
      screeningAnswers: {
        q1: 'We use optimistic UI updates with an event-sourced command bus. Every action mutates local state immediately and enters an outgoing queue. If the server rejects the mutation or times out, the local store can either auto-retry with exponential backoff or prompt the user with a 1-click retry pill.'
      },
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    screeningAnswers: {
      q1: 'We use optimistic UI updates with an event-sourced command bus. Every action mutates local state immediately and enters an outgoing queue. If the server rejects the mutation or times out, the local store can either auto-retry with exponential backoff or prompt the user with a 1-click retry pill.'
    },
    skillMatchScore: 92,
    recruiterViewedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    stageEnteredAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    slaDueAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    lastAutosavedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'app-jordan-1',
    trackingCode: 'APP-2026-1049',
    jobId: 'job-101',
    candidateId: 'cand-jordan-lee',
    status: 'submitted',
    currentStageIndex: 0,
    completionPercent: 100,
    draftPayload: {
      activeStepIndex: 3,
      identity: {
        fullName: 'Jordan Lee',
        email: 'jordan.lee@domain.co',
        phone: '+1 (512) 800-9922',
        timezone: 'America/Chicago',
        githubUrl: 'https://github.com/jordanlee',
        linkedinUrl: 'https://linkedin.com/in/jordanlee',
        portfolioUrl: 'https://jordanlee.me'
      },
      workHistory: [
        {
          id: 'work-jl-1',
          company: 'Figma Community Contributor',
          role: 'Design Technologist',
          startDate: '2021-03',
          endDate: 'Present',
          isCurrent: true,
          description: 'Published widely used component libraries and token sync plugins.',
          highlights: ['Over 100k plugin installs across design systems teams.']
        }
      ],
      education: [],
      screeningAnswers: {
        q1: 'Built a dynamic token generator converting Figma tokens to styled-components and Tailwind classes automatically.',
        q2: 'Automated CI contrast checker and screen reader script reviews.'
      },
      updatedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
    },
    screeningAnswers: {
      q1: 'Built a dynamic token generator converting Figma tokens to styled-components and Tailwind classes automatically.',
      q2: 'Automated CI contrast checker and screen reader script reviews.'
    },
    skillMatchScore: 85,
    recruiterViewedAt: null,
    stageEnteredAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    slaDueAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), // BREACHED SLA!
    submittedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    lastAutosavedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'app-maya-1',
    trackingCode: 'APP-2026-7731',
    jobId: 'job-103',
    candidateId: 'cand-maya-lin',
    status: 'offer_extended',
    currentStageIndex: 4,
    completionPercent: 100,
    draftPayload: {
      activeStepIndex: 3,
      identity: {
        fullName: 'Maya Lin',
        email: 'maya.lin@systems.org',
        phone: '+1 (415) 332-9011',
        timezone: 'America/Los_Angeles',
        githubUrl: 'https://github.com/mayalin-sys',
        linkedinUrl: 'https://linkedin.com/in/mayalin',
        portfolioUrl: 'https://mayalin.engineering'
      },
      workHistory: [
        {
          id: 'work-ml-1',
          company: 'Datadog',
          role: 'Staff Distributed Systems Engineer',
          startDate: '2021-02',
          endDate: 'Present',
          isCurrent: true,
          description: 'High-throughput stream processing with Go and Kubernetes.',
          highlights: ['Processed 2M events/sec with sub-5ms p99 latency.']
        }
      ],
      education: [],
      screeningAnswers: {
        q1: 'We partitioned ingestion topics by tenant and employed priority token-bucket rate limiters at the edge gateway to safeguard downstream processing workers during massive surges.'
      },
      updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    screeningAnswers: {
      q1: 'We partitioned ingestion topics by tenant and employed priority token-bucket rate limiters at the edge gateway to safeguard downstream processing workers during massive surges.'
    },
    skillMatchScore: 98,
    recruiterViewedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    stageEnteredAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    slaDueAt: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    lastAutosavedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 'app-david-draft',
    trackingCode: 'APP-2026-3390',
    jobId: 'job-104',
    candidateId: 'cand-david-kim',
    status: 'draft',
    currentStageIndex: 0,
    completionPercent: 65,
    draftPayload: {
      activeStepIndex: 2, // Step 3: Role questions
      identity: {
        fullName: 'David Kim',
        email: 'david.kim@designtooling.io',
        phone: '+1 (650) 441-2983',
        timezone: 'America/Los_Angeles',
        githubUrl: 'https://github.com/davidkimdesign',
        linkedinUrl: 'https://linkedin.com/in/davidkim-design',
        portfolioUrl: 'https://davidkim.design'
      },
      workHistory: [
        {
          id: 'work-dk-1',
          company: 'Airbnb Design Operations',
          role: 'Staff Product Designer',
          startDate: '2022-01',
          endDate: 'Present',
          isCurrent: true,
          description: 'Unified cross-platform design token architecture for web, iOS, and Android.',
          highlights: ['Built interactive Figma token inspector used across 40 design squads.']
        }
      ],
      education: [
        {
          id: 'edu-dk-1',
          institution: 'Rhode Island School of Design (RISD)',
          degree: 'BFA',
          field: 'Graphic Design & Interaction',
          graduationYear: '2019'
        }
      ],
      screeningAnswers: {
        q1: 'https://davidkim.design/case-studies/airbnb-tokens and https://davidkim.design/case-studies/fluid-motion'
      },
      updatedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString() // Saved 14m ago on mobile
    },
    screeningAnswers: {},
    skillMatchScore: 90,
    recruiterViewedAt: null,
    stageEnteredAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    slaDueAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    submittedAt: null,
    lastAutosavedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString()
  }
];
