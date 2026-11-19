import { Router, Request, Response } from 'express';
import { SEED_JOBS } from '../data/jobs.ts';

const router = Router();

// GET /api/jobs - List published jobs with query filters
router.get('/', (req: Request, res: Response) => {
  const { search, department, locationType, maxSalary, minSalary } = req.query;

  let jobs = SEED_JOBS.filter(j => j.status === 'published');

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    jobs = jobs.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.department.toLowerCase().includes(q) ||
      j.requiredSkills.some(s => s.toLowerCase().includes(q)) ||
      j.description.toLowerCase().includes(q)
    );
  }

  if (department && typeof department === 'string' && department !== 'all') {
    jobs = jobs.filter(j => j.department.toLowerCase().includes(department.toLowerCase()));
  }

  if (locationType && typeof locationType === 'string' && locationType !== 'all') {
    jobs = jobs.filter(j => j.locationType === locationType);
  }

  if (minSalary) {
    const min = Number(minSalary);
    if (!isNaN(min)) {
      jobs = jobs.filter(j => j.salaryMaxCents >= min * 100);
    }
  }

  res.json({ jobs, total: jobs.length });
});

// GET /api/jobs/:slug - Get single job by slug or ID
router.get('/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const job = SEED_JOBS.find(j => j.slug === slug || j.id === slug);

  if (!job) {
    return res.status(404).json({ error: 'Job posting not found' });
  }

  res.json({ job });
});

export default router;
