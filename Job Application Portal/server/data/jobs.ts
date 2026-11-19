import { JobPosting } from './types.ts';

export const SEED_JOBS: JobPosting[] = [
  {
    id: 'job-101',
    slug: 'staff-frontend-engineer-design-systems',
    title: 'Staff Frontend Engineer — Design Systems',
    department: 'Core Frontend & Design Engineering',
    companyName: 'Atelier Labs',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80',
    locationType: 'remote',
    location: 'Remote (UTC-8 to UTC+2)',
    timezoneRange: 'UTC-8 to UTC+2',
    salaryMinCents: 17500000,
    salaryMaxCents: 20500000,
    currency: 'USD',
    requiredSkills: ['React', 'TypeScript', 'Vite', 'Design Systems', 'Accessibility', 'GraphQL'],
    preferredSkills: ['Tailwind CSS', 'Figma Tokens', 'Micro-Frontends', 'Performance Profiling'],
    description: `We are seeking an exceptional Staff Frontend Engineer to lead our Core Design System and UI Component Ergonomics across the Atelier platform. You will spearhead our transition into sub-millisecond, accessible, tactile user interfaces inspired by Linear, Ashby, and Stripe.

In this role, you will champion zero-latency client state synchronization, lead our WCAG 2.1 AAA accessibility initiatives, and empower product teams with composable, rock-solid primitive components.`,
    responsibilities: [
      'Architect and evolve our foundational design system token pipeline from Figma tokens down to CSS variables and React primitives.',
      'Enforce keystroke-level local draft persistence and resilient offline sync across web and mobile browsers.',
      'Partner closely with Product Designers and Engineering Leads to ensure pixel-perfect rendering and sub-16ms frame times.',
      'Mentor senior engineers on accessibility (a11y), keyboard-first navigation patterns, and polymorphic UI composition.',
      'Establish robust automated visual regression and component-level accessibility testing suites.'
    ],
    screeningQuestions: [
      {
        id: 'q1',
        question: 'Tell us about a complex UI state or design system architecture problem you solved recently (150–300 words).',
        placeholder: 'Describe the context, the trade-offs you evaluated (e.g. state persistence, bundle size, composability), and the tangible impact on user experience...',
        required: true,
        recommendedWordCount: 200,
      },
      {
        id: 'q2',
        question: 'How do you evaluate and maintain WCAG 2.1 AA accessibility standards across high-frequency release cycles?',
        placeholder: 'Discuss your tooling, keyboard navigation patterns, ARIA live announcements, and contrast audit workflows...',
        required: true,
        recommendedWordCount: 150,
      }
    ],
    pipelineStages: [
      'Application Received',
      'Resume Reviewed by Hiring Team',
      'Recruiter Screen',
      'Technical / Architecture Deep-Dive',
      'Team Onsite & Collaborative Review',
      'Decision & Offer'
    ],
    slaBusinessDays: 5,
    status: 'published',
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'job-102',
    slug: 'senior-fullstack-product-engineer',
    title: 'Senior Full-Stack Product Engineer',
    department: 'Product Growth & Candidate Experience',
    companyName: 'Atelier Labs',
    companyLogo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=128&q=80',
    locationType: 'remote',
    location: 'Remote (US & Canada)',
    timezoneRange: 'America/New_York to America/Los_Angeles',
    salaryMinCents: 16500000,
    salaryMaxCents: 19000000,
    currency: 'USD',
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Tailwind CSS'],
    preferredSkills: ['Supabase', 'BullMQ', 'Docker', 'REST / GraphQL'],
    description: `Join our fast-moving Product Growth team building high-trust candidate onboarding and recruiter governance software. You will craft end-to-end features connecting high-frequency React client workflows with resilient PostgreSQL, Redis, and event queues.`,
    responsibilities: [
      'Build end-to-end features from real-time collaborative candidate evaluation dashboards to resume parsing worker pipelines.',
      'Design idempotent APIs with optimistic concurrency controls for multi-device form drafting.',
      'Maintain sub-100ms p95 latency across candidate pipeline queries with smart PostgreSQL indexing and Redis caching.'
    ],
    screeningQuestions: [
      {
        id: 'q1',
        question: 'What is your preferred strategy for managing optimistic client state updates and background sync with failure recovery?',
        placeholder: 'Walk through an example of handling offline queues or rollback mechanisms...',
        required: true,
        recommendedWordCount: 150,
      }
    ],
    pipelineStages: [
      'Application Received',
      'Resume Reviewed by Hiring Team',
      'Recruiter Screen',
      'Technical Deep-Dive',
      'Team Onsite',
      'Decision & Offer'
    ],
    slaBusinessDays: 5,
    status: 'published',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'job-103',
    slug: 'lead-systems-infrastructure-engineer',
    title: 'Lead Systems & Distributed Infrastructure Engineer',
    department: 'Platform & Reliability',
    companyName: 'Atelier Labs',
    companyLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=128&q=80',
    locationType: 'hybrid',
    location: 'Hybrid (San Francisco, CA or New York, NY)',
    timezoneRange: 'America/Los_Angeles or America/New_York',
    salaryMinCents: 19000000,
    salaryMaxCents: 23000000,
    currency: 'USD',
    requiredSkills: ['Go', 'Kubernetes', 'PostgreSQL', 'Distributed Systems', 'Redis', 'AWS / S3'],
    preferredSkills: ['Terraform', 'Prometheus', 'Kafka', 'eBPF'],
    description: `Help build the resilient backbone that processes millions of candidate resumes, asynchronous OCR pipelines, and real-time candidate notifications with zero downtime.`,
    responsibilities: [
      'Architect highly resilient distributed worker clusters for document OCR and text embeddings.',
      'Optimize database scaling, connection pooling, and multi-region replication.',
      'Drive enterprise security compliance, data encryption at rest/transit, and SOC2 readiness.'
    ],
    screeningQuestions: [
      {
        id: 'q1',
        question: 'How do you structure worker queues and rate limiting to handle spiky batch document processing workloads?',
        required: true,
        recommendedWordCount: 180,
      }
    ],
    pipelineStages: [
      'Application Received',
      'Resume Reviewed by Hiring Team',
      'Technical Deep-Dive',
      'Team Onsite',
      'Decision & Offer'
    ],
    slaBusinessDays: 4,
    status: 'published',
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'job-104',
    slug: 'staff-product-designer-design-ops',
    title: 'Staff Product Designer — Design Systems & Tooling',
    department: 'Product Design',
    companyName: 'Atelier Labs',
    companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=128&q=80',
    locationType: 'remote',
    location: 'Remote (Global)',
    timezoneRange: 'UTC-5 to UTC+3',
    salaryMinCents: 16000000,
    salaryMaxCents: 19500000,
    currency: 'USD',
    requiredSkills: ['Figma Tokens', 'Design Systems', 'UX Research', 'Prototyping', 'Accessibility'],
    preferredSkills: ['HTML / CSS', 'Design Tokens Format', 'Motion Design'],
    description: `Shape the future of candidate-respectful talent interfaces. You will define the design patterns, micro-interactions, and visual guidelines that make applying for a job feel as delightful as ordering from a high-craft bakery.`,
    responsibilities: [
      'Create and maintain the Atelier Design System component kit, documentation, and usage guidelines.',
      'Conduct candidate user research to identify and eliminate cognitive friction and application fatigue.',
      'Collaborate with frontend engineers to bridge the gap between design tokens and production code.'
    ],
    screeningQuestions: [
      {
        id: 'q1',
        question: 'Please link 1–2 case studies showcasing complex enterprise or developer tooling interfaces you have designed.',
        required: true,
      }
    ],
    pipelineStages: [
      'Application Received',
      'Portfolio Reviewed',
      'Design Director Screen',
      'Collaborative Design Session',
      'Team Onsite',
      'Decision & Offer'
    ],
    slaBusinessDays: 5,
    status: 'published',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  }
];
