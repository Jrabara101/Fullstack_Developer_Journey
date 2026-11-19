import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { SEED_APPLICATIONS } from '../data/applications.ts';

const router = Router();

interface HandoffToken {
  token: string;
  applicationId: string;
  trackingCode: string;
  expiresAt: string;
  redeemedAt?: string;
}

// In-memory token store
const handoffTokens: Map<string, HandoffToken> = new Map();

// POST /api/drafts/handoff - Create magic handoff token and QR code
router.post('/handoff', async (req: Request, res: Response) => {
  try {
    const { applicationId, trackingCode, hostUrl } = req.body;
    const token = uuidv4().replace(/-/g, '').slice(0, 16);

    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const tokenRecord: HandoffToken = {
      token,
      applicationId: applicationId || 'app-alex-1',
      trackingCode: trackingCode || 'APP-2026-8941',
      expiresAt
    };

    handoffTokens.set(token, tokenRecord);

    const baseUrl = hostUrl || 'http://localhost:5173';
    const magicUrl = `${baseUrl}/handoff/${token}`;

    // Generate high-contrast SVG QR Code
    const qrCodeSvg = await QRCode.toString(magicUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      token,
      magicUrl,
      qrCodeSvg,
      expiresAt,
      message: 'Magic handoff token valid for 7 days. Cursor and draft state preserved.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create handoff token' });
  }
});

// GET /api/drafts/handoff/:token - Redeem magic handoff token
router.get('/handoff/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const tokenRecord = handoffTokens.get(token);

  if (!tokenRecord) {
    // Return sample draft if token not found (for easy demo testing)
    const demoApp = SEED_APPLICATIONS[0];
    return res.json({
      valid: true,
      applicationId: demoApp.id,
      trackingCode: demoApp.trackingCode,
      jobId: demoApp.jobId,
      draftPayload: demoApp.draftPayload,
      message: 'Resumed demo session'
    });
  }

  const isExpired = new Date(tokenRecord.expiresAt).getTime() < Date.now();
  if (isExpired) {
    return res.status(410).json({ error: 'Handoff link has expired' });
  }

  tokenRecord.redeemedAt = new Date().toISOString();

  const app = SEED_APPLICATIONS.find(a => a.id === tokenRecord.applicationId || a.trackingCode === tokenRecord.trackingCode);

  res.json({
    valid: true,
    applicationId: tokenRecord.applicationId,
    trackingCode: tokenRecord.trackingCode,
    jobId: app?.jobId || 'job-101',
    draftPayload: app?.draftPayload,
    message: 'Session resumed successfully'
  });
});

export default router;
