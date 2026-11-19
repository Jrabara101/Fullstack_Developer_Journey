import { ResumeVersion } from './types.ts';

export const SAMPLE_RESUMES: ResumeVersion[] = [
  {
    id: 'resume-alex-fe',
    candidateId: 'cand-alex-rivera',
    label: 'Staff Frontend & Design Systems CV (2026)',
    fileName: 'Alex_Rivera_Staff_FE_2026.pdf',
    fileSizeBytes: 1420580, // 1.4 MB
    mimeType: 'application/pdf',
    extractedText: `ALEX RIVERA
Staff Frontend Engineer & Design Technologist
San Francisco, CA • alex.rivera@atelier-dev.io • +1 (415) 890-4412 • Timezone: America/Los_Angeles
GitHub: https://github.com/arivera • ReadCV: https://read.cv/arivera • Portfolio: https://alexrivera.design

SUMMARY
Staff-level Frontend Engineer with 8+ years crafting high-velocity design systems, zero-latency client state synchronization engines, and accessible web experiences for millions of users. Passionate about software ergonomics inspired by Linear, Ashby, and Stripe.

WORK EXPERIENCE
Senior Frontend Engineer | Vercel
2023 – Present | Remote
- Spearheaded the Next.js Design System primitive token architecture, reducing bundle overhead by 34% across 80+ packages.
- Built keystroke-level local draft persistence and multi-tab sync using IndexedDB and BroadcastChannel.
- Championed WCAG 2.1 AAA compliance across all enterprise dashboards, increasing keyboard accessibility score to 100%.

Frontend Systems Engineer | Stripe
2020 – 2023 | San Francisco, CA
- Architected merchant checkout components processing $40B+ annually with 99.999% uptime and sub-100ms first input delay.
- Implemented real-time form validation telemetry and predictive error prevention for high-conversion payment flows.
- Authored internal documentation and led interactive architecture workshops for 200+ engineers.

UI Engineer | Airbnb
2018 – 2020 | San Francisco, CA
- Developed responsive guest booking flows and high-performance design system components used by 150M+ travelers.

EDUCATION
University of California, Berkeley
B.S. in Computer Science & Human-Computer Interaction | 2018

CORE SKILLS
React, TypeScript, Vite, Design Systems, Accessibility, GraphQL, Tailwind CSS, Zustand, Figma Tokens, Web Performance`,
    parsedData: {
      fullName: 'Alex Rivera',
      email: 'alex.rivera@atelier-dev.io',
      phone: '+1 (415) 890-4412',
      location: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      githubUrl: 'https://github.com/arivera',
      linkedinUrl: 'https://linkedin.com/in/alex-rivera-fe',
      portfolioUrl: 'https://alexrivera.design',
      summary: 'Staff-level Frontend Engineer with 8+ years crafting high-velocity design systems, zero-latency client state synchronization engines, and accessible web experiences for millions of users.',
      workHistory: [
        {
          id: 'work-1',
          company: 'Vercel',
          role: 'Senior Frontend Engineer',
          startDate: '2023-01',
          endDate: 'Present',
          isCurrent: true,
          description: 'Spearheaded Next.js Design System primitive token architecture and multi-tab draft sync.',
          highlights: [
            'Reduced bundle overhead by 34% across 80+ packages.',
            'Built keystroke-level local draft persistence using IndexedDB.',
            'Enforced WCAG 2.1 AAA compliance with 100% keyboard accessibility.'
          ]
        },
        {
          id: 'work-2',
          company: 'Stripe',
          role: 'Frontend Systems Engineer',
          startDate: '2020-03',
          endDate: '2023-01',
          isCurrent: false,
          description: 'Architected merchant checkout components processing $40B+ annually.',
          highlights: [
            'Maintained sub-100ms first input delay and 99.999% uptime.',
            'Implemented real-time form validation telemetry and predictive error recovery.'
          ]
        },
        {
          id: 'work-3',
          company: 'Airbnb',
          role: 'UI Engineer',
          startDate: '2018-06',
          endDate: '2020-02',
          isCurrent: false,
          description: 'Developed responsive guest booking flows and high-performance design system components.',
          highlights: ['Supported 150M+ travelers with responsive, localized booking interfaces.']
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
      skills: ['React', 'TypeScript', 'Vite', 'Design Systems', 'Accessibility', 'GraphQL', 'Tailwind CSS', 'Zustand', 'Figma Tokens', 'Web Performance'],
      boundingBoxes: [
        {
          id: 'bb-name',
          fieldKey: 'identity.fullName',
          page: 1,
          x: 8,
          y: 5.5,
          width: 32,
          height: 4.2,
          label: 'Candidate Name',
          textSnippet: 'ALEX RIVERA'
        },
        {
          id: 'bb-email',
          fieldKey: 'identity.email',
          page: 1,
          x: 8,
          y: 10.5,
          width: 36,
          height: 2.8,
          label: 'Email & Contact Info',
          textSnippet: 'alex.rivera@atelier-dev.io • +1 (415) 890-4412'
        },
        {
          id: 'bb-links',
          fieldKey: 'identity.githubUrl',
          page: 1,
          x: 8,
          y: 13.5,
          width: 82,
          height: 3.2,
          label: 'Portfolio & Public Links',
          textSnippet: 'GitHub: https://github.com/arivera • ReadCV: https://read.cv/arivera'
        },
        {
          id: 'bb-summary',
          fieldKey: 'identity.summary',
          page: 1,
          x: 8,
          y: 18.5,
          width: 84,
          height: 8.5,
          label: 'Executive Summary',
          textSnippet: 'Staff-level Frontend Engineer with 8+ years crafting high-velocity design systems...'
        },
        {
          id: 'bb-work-vercel',
          fieldKey: 'workHistory.0',
          page: 1,
          x: 8,
          y: 29.5,
          width: 84,
          height: 15.5,
          label: 'Recent Role: Senior Frontend Engineer @ Vercel',
          textSnippet: 'Senior Frontend Engineer | Vercel (2023 – Present)'
        },
        {
          id: 'bb-work-stripe',
          fieldKey: 'workHistory.1',
          page: 1,
          x: 8,
          y: 47.0,
          width: 84,
          height: 14.5,
          label: 'Role: Frontend Systems Engineer @ Stripe',
          textSnippet: 'Frontend Systems Engineer | Stripe (2020 – 2023)'
        },
        {
          id: 'bb-work-airbnb',
          fieldKey: 'workHistory.2',
          page: 1,
          x: 8,
          y: 63.5,
          width: 84,
          height: 8.5,
          label: 'Role: UI Engineer @ Airbnb',
          textSnippet: 'UI Engineer | Airbnb (2018 – 2020)'
        },
        {
          id: 'bb-education',
          fieldKey: 'education.0',
          page: 1,
          x: 8,
          y: 74.5,
          width: 84,
          height: 7.2,
          label: 'Education: UC Berkeley',
          textSnippet: 'University of California, Berkeley — B.S. in Computer Science'
        },
        {
          id: 'bb-skills',
          fieldKey: 'skills',
          page: 1,
          x: 8,
          y: 84.0,
          width: 84,
          height: 9.5,
          label: 'Core Skills Matrix',
          textSnippet: 'React, TypeScript, Vite, Design Systems, Accessibility, GraphQL...'
        }
      ]
    },
    linkHealthReport: [
      {
        url: 'https://github.com/arivera',
        type: 'github',
        status: 'ok',
        statusCode: 200,
        checkedAt: new Date().toISOString(),
        message: 'Active GitHub profile (24 public repos, 1.2k stars)'
      },
      {
        url: 'https://read.cv/arivera',
        type: 'portfolio',
        status: 'ok',
        statusCode: 200,
        checkedAt: new Date().toISOString(),
        message: 'Verified Read.cv profile page'
      },
      {
        url: 'https://alexrivera.design',
        type: 'portfolio',
        status: 'ok',
        statusCode: 200,
        checkedAt: new Date().toISOString(),
        message: 'Portfolio SSL valid, response time 64ms'
      }
    ],
    isPrimary: true,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'resume-alex-fullstack',
    candidateId: 'cand-alex-rivera',
    label: 'Full-Stack Product & Growth CV (Tailored)',
    fileName: 'Alex_Rivera_FullStack_Product_2026.pdf',
    fileSizeBytes: 1250300,
    mimeType: 'application/pdf',
    extractedText: `ALEX RIVERA
Full-Stack Product Engineer
San Francisco, CA • alex.rivera@atelier-dev.io • GitHub: https://github.com/arivera
Core: React, Node.js, TypeScript, PostgreSQL, Redis, GraphQL, Docker, Tailwind CSS`,
    parsedData: {
      fullName: 'Alex Rivera',
      email: 'alex.rivera@atelier-dev.io',
      phone: '+1 (415) 890-4412',
      location: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      githubUrl: 'https://github.com/arivera',
      portfolioUrl: 'https://alexrivera.design',
      summary: 'Product-focused full-stack engineer experienced in building scalable multi-tenant SaaS backends paired with snappy frontend interactions.',
      workHistory: [
        {
          id: 'work-fs-1',
          company: 'Vercel',
          role: 'Full-Stack Engineer',
          startDate: '2023-01',
          endDate: 'Present',
          isCurrent: true,
          description: 'Shipped edge rendering and server actions integration.',
          highlights: ['Architected PostgreSQL queue integration with Redis caching.']
        }
      ],
      education: [
        {
          id: 'edu-fs-1',
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          graduationYear: '2018'
        }
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Tailwind CSS', 'GraphQL'],
      boundingBoxes: [
        {
          id: 'bb-fs-name',
          fieldKey: 'identity.fullName',
          page: 1,
          x: 8,
          y: 6,
          width: 35,
          height: 5,
          label: 'Candidate Name',
          textSnippet: 'ALEX RIVERA'
        },
        {
          id: 'bb-fs-skills',
          fieldKey: 'skills',
          page: 1,
          x: 8,
          y: 30,
          width: 80,
          height: 12,
          label: 'Skills Matrix',
          textSnippet: 'React, Node.js, TypeScript, PostgreSQL, Redis...'
        }
      ]
    },
    linkHealthReport: [
      {
        url: 'https://github.com/arivera',
        type: 'github',
        status: 'ok',
        statusCode: 200,
        checkedAt: new Date().toISOString(),
        message: 'Active profile'
      }
    ],
    isPrimary: false,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  }
];
