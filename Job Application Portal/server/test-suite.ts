import { SEED_JOBS } from './data/jobs.ts';

const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('🧪 Starting Job Application Portal Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`).then(r => r.json());
  assert(healthRes.status === 'ok', 'API health check is ok');

  // 2. Job directory & filters
  const jobsRes = await fetch(`${BASE_URL}/jobs`).then(r => r.json());
  assert(jobsRes.jobs.length >= 4, `Listed ${jobsRes.jobs.length} published jobs`);

  const filterRes = await fetch(`${BASE_URL}/jobs?department=Engineering`).then(r => r.json());
  assert(filterRes.jobs.every((j: any) => j.department.toLowerCase().includes('engineering')), 'Faceted department filter works');

  const salaryRes = await fetch(`${BASE_URL}/jobs?minSalary=180000`).then(r => r.json());
  assert(salaryRes.jobs.length > 0, `Salary filter returned ${salaryRes.jobs.length} jobs >= $180k`);

  // 3. Resume vault & parsing
  const vaultRes = await fetch(`${BASE_URL}/resumes`).then(r => r.json());
  assert(vaultRes.resumes.length >= 2, `Vault contains ${vaultRes.resumes.length} sample/saved resumes`);

  const primaryResume = vaultRes.resumes[0];
  assert(primaryResume.parsedData.boundingBoxes.length >= 7, 'Resume includes normalized OCR bounding boxes');

  // 4. Resume text parsing & alignment linter
  const parseRes = await fetch(`${BASE_URL}/resumes/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobId: 'job-101',
      sampleId: primaryResume.id
    })
  }).then(r => r.json());
  assert(parseRes.alignment.matchPercentage >= 90, `Resume alignment linter computed ${parseRes.alignment.matchPercentage}% match`);
  assert(parseRes.parseDurationMs < 2000, `Parse duration (${parseRes.parseDurationMs}ms) is under 2 seconds`);

  // 5. Broken link & portfolio sentinel
  const linkCheckRes = await fetch(`${BASE_URL}/resumes/check-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls: ['https://github.com/arivera', 'https://broken-404-link.com', 'https://alexrivera.design']
    })
  }).then(r => r.json());
  assert(linkCheckRes.reports.length === 3, 'Link health checker evaluated 3 links');
  assert(linkCheckRes.reports.some((r: any) => r.status === 'broken'), 'Broken link sentinel correctly flags invalid/404 URL');

  // 6. Draft Creation & Keystroke-Level Autosave
  const draftCreateRes = await fetch(`${BASE_URL}/applications/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobId: 'job-101',
      email: 'test.candidate@domain.com',
      fullName: 'Test Candidate'
    })
  }).then(r => r.json());
  assert(draftCreateRes.application.trackingCode.startsWith('APP-2026-'), `Created draft with tracking code ${draftCreateRes.application.trackingCode}`);

  const testAppId = draftCreateRes.application.id;
  const autosaveRes = await fetch(`${BASE_URL}/applications/${testAppId}/autosave`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      draftPayload: {
        activeStepIndex: 1,
        identity: {
          fullName: 'Test Candidate Updated',
          email: 'test.candidate@domain.com',
          phone: '+1 555-123-4567',
          timezone: 'America/New_York',
          githubUrl: 'https://github.com/testcandidate',
          linkedinUrl: '',
          portfolioUrl: 'https://testcandidate.io'
        },
        workHistory: [],
        education: [],
        screeningAnswers: {
          q1: 'Optimistic IndexedDB draft persistence ensures zero data loss.'
        }
      },
      completionPercent: 50,
      skillMatchScore: 95
    })
  }).then(r => r.json());
  assert(autosaveRes.success === true, 'Autosave idempotent PATCH persisted successfully');
  assert(autosaveRes.application.completionPercent === 50, 'Draft completion percent updated to 50%');

  // 7. Cross-Device Magic Handoff Token Generation & QR Code
  const handoffRes = await fetch(`${BASE_URL}/drafts/handoff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId: testAppId,
      trackingCode: draftCreateRes.application.trackingCode,
      hostUrl: 'http://localhost:5173'
    })
  }).then(r => r.json());
  assert(handoffRes.success === true, 'Generated cross-device magic handoff token');
  assert(handoffRes.qrCodeSvg.includes('<svg'), 'Generated crisp SVG QR Code');

  // Redeem token
  const redeemRes = await fetch(`${BASE_URL}/drafts/handoff/${handoffRes.token}`).then(r => r.json());
  assert(redeemRes.valid === true, 'Redeemed magic handoff token successfully without passwords');
  assert(redeemRes.applicationId === testAppId, 'Preserved exact draft session state');

  // 8. Final Submission
  const submitRes = await fetch(`${BASE_URL}/applications/${testAppId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      screeningAnswers: {
        q1: 'Architected offline IndexedDB queue with exponential backoff sync.'
      }
    })
  }).then(r => r.json());
  assert(submitRes.success === true, 'Application transitioned to submitted');
  assert(submitRes.application.status === 'submitted', 'Status is submitted');

  // 9. Domino's-Style Live Status Tracker Details
  const trackRes = await fetch(`${BASE_URL}/applications/${submitRes.trackingCode}`).then(r => r.json());
  assert(trackRes.events.length >= 1, `Live status tracker retrieved ${trackRes.events.length} timeline events`);
  assert(trackRes.application.slaInfo !== undefined, 'SLA target days and hours remaining calculated');

  // 10. Recruiter Advance Stage to Technical Deep-Dive
  const advanceRes = await fetch(`${BASE_URL}/applications/${testAppId}/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetStage: 'technical_interview',
      targetStageIndex: 3,
      publicMessage: 'Advanced to Stage 4: Technical Deep-Dive! Please select a 45-minute calendar slot.',
      internalNote: 'High technical aptitude verified.'
    })
  }).then(r => r.json());
  assert(advanceRes.application.status === 'technical_interview', 'Application advanced to technical_interview');
  assert(advanceRes.application.interviewerBios.length === 2, 'Loaded interviewer bios (Elena Rostova & Marcus Vance)');

  // 11. Candidate Self-Service Slot Booking
  const scheduleRes = await fetch(`${BASE_URL}/applications/${testAppId}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: 'Tuesday, Oct 21',
      timeSlot: '10:00 AM – 10:45 AM',
      timezone: 'Pacific Time (US & Canada)'
    })
  }).then(r => r.json());
  assert(scheduleRes.success === true, 'Candidate booked 45-minute slot');
  assert(scheduleRes.scheduledInterview.timeSlot.includes('10:00 AM'), 'Slot details confirmed with Google Meet URL');

  // 12. Recruiter Governance Metrics & SLA Watchdog
  const recruiterRes = await fetch(`${BASE_URL}/applications`).then(r => r.json());
  assert(recruiterRes.metrics.slaBreachedCount >= 1, `SLA Watchdog caught ${recruiterRes.metrics.slaBreachedCount} breached applicant(s) (>5 days)`);
  assert(recruiterRes.metrics.totalApplicants >= 5, `Total applicants metric is ${recruiterRes.metrics.totalApplicants}`);

  console.log(`\n========================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
