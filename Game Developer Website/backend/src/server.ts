import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { SessionTelemetryPayload, FeedbackPayload } from './types.js';

const prisma = new PrismaClient();
const app = Fastify({
  logger: true,
});

// Register CORS
await app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
});

// Helper to deserialize DB project to GameProject
function formatProject(project: any) {
  const externalLinks = project.externalLinksJson ? JSON.parse(project.externalLinksJson) : {};
  const pressKit = project.pressKitJson ? JSON.parse(project.pressKitJson) : undefined;

  const chapters = (project.chapters || []).map((ch: any) => ({
    id: ch.id,
    title: ch.title,
    timestampSec: ch.timestampSec,
    description: ch.description,
    orderIndex: ch.orderIndex,
  }));

  const mechanics = (project.mechanics || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    summary: m.summary,
    discipline: m.discipline,
    greyboxMediaUrl: m.greyboxMediaUrl,
    polishedMediaUrl: m.polishedMediaUrl,
    interactiveParams: m.interactiveParamsJson ? JSON.parse(m.interactiveParamsJson) : [],
    codeSnippet: m.codeSnippetJson ? JSON.parse(m.codeSnippetJson) : undefined,
    telemetryStats: m.telemetryStatsJson ? JSON.parse(m.telemetryStatsJson) : { frameBudgetMs: 1.0, drawCalls: 10, memoryFootprintMb: 5 },
    orderIndex: m.orderIndex,
  }));

  const devLogs = (project.devLogs || []).map((d: any) => ({
    id: d.id,
    slug: d.slug,
    projectId: d.projectId,
    versionTag: d.versionTag,
    title: d.title,
    publishedAt: d.publishedAt.toISOString(),
    readingTimeMinutes: d.readingTimeMinutes,
    tags: d.tagsJson ? JSON.parse(d.tagsJson) : [],
    summary: d.summary,
    contentMarkdown: d.contentMarkdown,
    benchmarks: d.benchmarksJson ? JSON.parse(d.benchmarksJson) : undefined,
    interactiveWidgetType: d.interactiveWidgetType,
  }));

  // Aggregate telemetry
  let totalPlaytestSessions = 0;
  let medianPlayDurationSec = 0;
  let avgFps = 60.0;
  if (project.telemetrySessions && project.telemetrySessions.length > 0) {
    totalPlaytestSessions = project.telemetrySessions.length;
    const durations = project.telemetrySessions.map((s: any) => s.durationSeconds).sort((a: number, b: number) => a - b);
    medianPlayDurationSec = durations[Math.floor(durations.length / 2)] || 0;
    const totalFps = project.telemetrySessions.reduce((acc: number, s: any) => acc + s.averageFps, 0);
    avgFps = Number((totalFps / project.telemetrySessions.length).toFixed(1));
  }

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    releaseStatus: project.releaseStatus,
    engine: project.engine,
    role: project.role,
    teamSize: project.teamSize,
    developmentDuration: project.developmentDuration,
    heroTrailerUrl: project.heroTrailerUrl,
    playableDemoUrl: project.playableDemoUrl,
    externalLinks,
    pressKit,
    chapters,
    mechanics,
    devLogs,
    feedbackPins: project.feedbackPins || [],
    telemetryStats: {
      totalPlaytestSessions,
      medianPlayDurationSec,
      avgFps,
    },
  };
}

// 1. GET /api/projects
app.get('/api/projects', async (request, reply) => {
  const query = request.query as {
    engine?: string;
    role?: string;
    discipline?: string;
    releaseStatus?: string;
  };

  const whereClause: any = {};
  if (query.engine && query.engine !== 'All') {
    whereClause.engine = { contains: query.engine };
  }
  if (query.releaseStatus && query.releaseStatus !== 'All') {
    whereClause.releaseStatus = query.releaseStatus;
  }
  if (query.role && query.role !== 'All') {
    whereClause.role = { contains: query.role };
  }

  const projects = await prisma.project.findMany({
    where: whereClause,
    include: {
      chapters: { orderBy: { orderIndex: 'asc' } },
      mechanics: { orderBy: { orderIndex: 'asc' } },
      devLogs: { orderBy: { publishedAt: 'desc' } },
      telemetrySessions: true,
      feedbackPins: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { featuredOrder: 'asc' },
  });

  let formatted = projects.map(formatProject);

  if (query.discipline && query.discipline !== 'All') {
    formatted = formatted.filter((p) =>
      p.mechanics.some((m: any) => m.discipline === query.discipline) ||
      p.devLogs.some((d: any) => d.tags.includes(query.discipline))
    );
  }

  return { projects: formatted };
});

// 2. GET /api/projects/:slug
app.get('/api/projects/:slug', async (request, reply) => {
  const { slug } = request.params as { slug: string };

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      chapters: { orderBy: { orderIndex: 'asc' } },
      mechanics: { orderBy: { orderIndex: 'asc' } },
      devLogs: { orderBy: { publishedAt: 'desc' } },
      telemetrySessions: true,
      feedbackPins: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!project) {
    return reply.status(404).send({ error: `Project '${slug}' not found` });
  }

  return { project: formatProject(project) };
});

// 3. GET /api/devlogs
app.get('/api/devlogs', async (request, reply) => {
  const query = request.query as { projectId?: string; tag?: string };

  const whereClause: any = {};
  if (query.projectId) {
    whereClause.projectId = query.projectId;
  }

  const devlogs = await prisma.devLogEntry.findMany({
    where: whereClause,
    include: {
      project: {
        select: {
          id: true,
          slug: true,
          title: true,
          engine: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  });

  const formatted = devlogs.map((d) => ({
    id: d.id,
    slug: d.slug,
    projectId: d.projectId,
    projectTitle: d.project.title,
    projectSlug: d.project.slug,
    projectEngine: d.project.engine,
    versionTag: d.versionTag,
    title: d.title,
    publishedAt: d.publishedAt.toISOString(),
    readingTimeMinutes: d.readingTimeMinutes,
    tags: d.tagsJson ? JSON.parse(d.tagsJson) : [],
    summary: d.summary,
    contentMarkdown: d.contentMarkdown,
    benchmarks: d.benchmarksJson ? JSON.parse(d.benchmarksJson) : undefined,
    interactiveWidgetType: d.interactiveWidgetType,
  }));

  if (query.tag && query.tag !== 'All') {
    return { devlogs: formatted.filter((d) => d.tags.includes(query.tag)) };
  }

  return { devlogs: formatted };
});

// 4. GET /api/devlogs/:slug
app.get('/api/devlogs/:slug', async (request, reply) => {
  const { slug } = request.params as { slug: string };

  const devlog = await prisma.devLogEntry.findUnique({
    where: { slug },
    include: {
      project: {
        include: {
          chapters: true,
          mechanics: true,
        },
      },
    },
  });

  if (!devlog) {
    return reply.status(404).send({ error: `DevLog '${slug}' not found` });
  }

  // Find adjacent devlogs for version time-travel
  const allLogs = await prisma.devLogEntry.findMany({
    orderBy: { publishedAt: 'asc' },
    select: { slug: true, title: true, versionTag: true },
  });
  const currentIndex = allLogs.findIndex((l) => l.slug === slug);
  const prevLog = currentIndex > 0 ? allLogs[currentIndex - 1] : null;
  const nextLog = currentIndex < allLogs.length - 1 ? allLogs[currentIndex + 1] : null;

  return {
    devlog: {
      id: devlog.id,
      slug: devlog.slug,
      projectId: devlog.projectId,
      projectTitle: devlog.project.title,
      projectSlug: devlog.project.slug,
      projectEngine: devlog.project.engine,
      versionTag: devlog.versionTag,
      title: devlog.title,
      publishedAt: devlog.publishedAt.toISOString(),
      readingTimeMinutes: devlog.readingTimeMinutes,
      tags: devlog.tagsJson ? JSON.parse(devlog.tagsJson) : [],
      summary: devlog.summary,
      contentMarkdown: devlog.contentMarkdown,
      benchmarks: devlog.benchmarksJson ? JSON.parse(devlog.benchmarksJson) : undefined,
      interactiveWidgetType: devlog.interactiveWidgetType,
      prevLog,
      nextLog,
    },
  };
});

// 5. POST /api/telemetry/session
app.post('/api/telemetry/session', async (request, reply) => {
  const body = request.body as SessionTelemetryPayload;
  if (!body.projectId || typeof body.durationSeconds !== 'number') {
    return reply.status(400).send({ error: 'Invalid telemetry payload' });
  }

  // Find project by id or slug
  const project = await prisma.project.findFirst({
    where: {
      OR: [{ id: body.projectId }, { slug: body.projectId }],
    },
  });

  if (!project) {
    return reply.status(404).send({ error: 'Project not found' });
  }

  const session = await prisma.playtestSession.create({
    data: {
      projectId: project.id,
      durationSeconds: Math.max(1, body.durationSeconds),
      averageFps: Math.min(240, Math.max(10, body.averageFps || 60)),
      hardwareRenderer: body.hardwareRenderer || 'WebGL 2.0 (Generic Display Device)',
    },
  });

  return { success: true, sessionId: session.id };
});

// 6. POST /api/feedback
const recentFeedbackIps = new Map<string, number>();

app.post('/api/feedback', async (request, reply) => {
  const ip = request.ip || 'anonymous';
  const now = Date.now();
  const lastTime = recentFeedbackIps.get(ip) || 0;
  if (now - lastTime < 3000) {
    return reply.status(429).send({ error: 'Rate limit exceeded. Please wait a few seconds before leaving more feedback.' });
  }
  recentFeedbackIps.set(ip, now);

  const body = request.body as FeedbackPayload;
  if (!body.projectId || !body.feedbackText || body.feedbackText.trim().length === 0) {
    return reply.status(400).send({ error: 'Missing feedback text or projectId' });
  }

  const project = await prisma.project.findFirst({
    where: {
      OR: [{ id: body.projectId }, { slug: body.projectId }],
    },
  });

  if (!project) {
    return reply.status(404).send({ error: 'Project not found' });
  }

  const pin = await prisma.feedbackPin.create({
    data: {
      projectId: project.id,
      targetType: body.targetType || 'trailer',
      timestampSec: body.timestampSec ?? null,
      devlogSectionId: body.devlogSectionId ?? null,
      authorName: (body.authorName || 'Guest Playtester').trim(),
      feedbackText: body.feedbackText.trim(),
      rating: body.rating ?? 5,
    },
  });

  return { success: true, pin };
});

// 7. GET /api/projects/:slug/presskit
app.get('/api/projects/:slug/presskit', async (request, reply) => {
  const { slug } = request.params as { slug: string };
  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) {
    return reply.status(404).send({ error: 'Project not found' });
  }

  const pressKit = project.pressKitJson ? JSON.parse(project.pressKitJson) : {};
  const externalLinks = project.externalLinksJson ? JSON.parse(project.externalLinksJson) : {};

  // Generate copyable markdown & embed snippets
  const markdownEmbed = `### ${project.title}\n*${project.tagline}*\n\n- **Engine**: ${project.engine}\n- **Role**: ${project.role}\n- **Status**: ${project.releaseStatus}\n- [Play In-Browser Demo](https://gamedev-portfolio.local/demo/${project.slug})\n`;

  const discordEmbed = {
    title: project.title,
    description: project.tagline,
    color: 0x06b6d4,
    fields: [
      { name: 'Engine', value: project.engine, inline: true },
      { name: 'Status', value: project.releaseStatus, inline: true },
      { name: 'Role', value: project.role, inline: false },
    ],
    footer: { text: 'Nexus Studio Portfolio // Interactive Slice' },
  };

  return {
    game: {
      title: project.title,
      slug: project.slug,
      tagline: project.tagline,
      engine: project.engine,
      role: project.role,
      developmentDuration: project.developmentDuration,
      links: externalLinks,
    },
    pressKit,
    embedSnippets: {
      markdown: markdownEmbed,
      discordJson: JSON.stringify(discordEmbed, null, 2),
      iframeHtml: `<iframe src="https://gamedev-portfolio.local/embed/${project.slug}" width="800" height="450" frameborder="0" allow="gamepad; fullscreen"></iframe>`,
    },
  };
});

// 8. GET /api/telemetry/stats
app.get('/api/telemetry/stats', async (request, reply) => {
  const sessions = await prisma.playtestSession.findMany();
  const feedbackCount = await prisma.feedbackPin.count();

  const totalSessions = sessions.length;
  const totalPlaytimeMinutes = Math.round(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);
  const avgFps = totalSessions > 0 ? Number((sessions.reduce((acc, s) => acc + s.averageFps, 0) / totalSessions).toFixed(1)) : 60;
  const sixtyFpsRate = totalSessions > 0 ? Math.round((sessions.filter((s) => s.averageFps >= 58.5).length / totalSessions) * 100) : 98;

  return {
    totalSessions,
    totalPlaytimeMinutes,
    avgFps,
    sixtyFpsRate: `${sixtyFpsRate}%`,
    totalFeedbackPins: feedbackCount,
  };
});

const PORT = 3001;
try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🎮 GameDev Portfolio Fastify Backend running on http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
