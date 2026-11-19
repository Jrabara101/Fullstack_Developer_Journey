import { Router, Request, Response } from 'express';
import { SAMPLE_RESUMES } from '../data/sampleResumes.ts';
import { parseResumeContent } from '../services/parser.ts';
import { checkLinksInBatch, checkUrlHealth } from '../services/linkChecker.ts';
import { SEED_JOBS } from '../data/jobs.ts';

const router = Router();

// In-memory vault of candidate resumes
let resumes = [...SAMPLE_RESUMES];

// GET /api/resumes - List saved resumes for vault
router.get('/', (req: Request, res: Response) => {
  res.json({ resumes });
});

// GET /api/resumes/:id
router.get('/:id', (req: Request, res: Response) => {
  const resume = resumes.find(r => r.id === req.params.id);
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  res.json({ resume });
});

// POST /api/resumes/parse - Parse resume text or sample
router.post('/parse', async (req: Request, res: Response) => {
  try {
    const { text, jobId, sampleId } = req.body;

    if (sampleId) {
      const existing = resumes.find(r => r.id === sampleId);
      if (existing) {
        // Recalculate alignment for specific job if provided
        let alignment = {
          matchedSkills: existing.parsedData.skills || [],
          missingSkills: [] as string[],
          matchPercentage: 100,
          tip: '6 of 6 core skills detected'
        };
        if (jobId) {
          const targetJob = SEED_JOBS.find(j => j.id === jobId || j.slug === jobId);
          if (targetJob) {
            const parsed = parseResumeContent(existing.extractedText || '', targetJob.requiredSkills);
            alignment = parsed.alignment;
          }
        }
        return res.json({
          resume: existing,
          alignment,
          parseDurationMs: 1100
        });
      }
    }

    const targetJob = jobId ? SEED_JOBS.find(j => j.id === jobId || j.slug === jobId) : undefined;
    const requiredSkills = targetJob ? targetJob.requiredSkills : ['React', 'TypeScript', 'Vite', 'Design Systems', 'Accessibility', 'GraphQL'];

    const contentToParse = text || SAMPLE_RESUMES[0].extractedText || '';
    const { parsedData, extractedText, alignment } = parseResumeContent(contentToParse, requiredSkills);

    // Run link check on parsed URLs
    const urlsToCheck: string[] = [];
    if (parsedData.githubUrl) urlsToCheck.push(parsedData.githubUrl);
    if (parsedData.linkedinUrl) urlsToCheck.push(parsedData.linkedinUrl);
    if (parsedData.portfolioUrl) urlsToCheck.push(parsedData.portfolioUrl);

    const linkHealthReport = await checkLinksInBatch(urlsToCheck);

    const newResume = {
      id: `resume-${Date.now()}`,
      candidateId: 'cand-alex-rivera',
      label: `Parsed Upload (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      fileName: 'Uploaded_Resume.pdf',
      fileSizeBytes: Math.floor(800000 + Math.random() * 600000),
      mimeType: 'application/pdf',
      extractedText,
      parsedData,
      linkHealthReport,
      isPrimary: false,
      createdAt: new Date().toISOString()
    };

    resumes.unshift(newResume);

    res.json({
      resume: newResume,
      alignment,
      parseDurationMs: 1180
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to parse resume' });
  }
});

// POST /api/resumes/check-links - Single URL or batch link verification sentinel
router.post('/check-links', async (req: Request, res: Response) => {
  const { urls, url } = req.body;
  if (url) {
    const report = await checkUrlHealth(url);
    return res.json({ report });
  }
  if (Array.isArray(urls)) {
    const reports = await checkLinksInBatch(urls);
    return res.json({ reports });
  }
  res.status(400).json({ error: 'Missing url or urls array' });
});

export default router;
