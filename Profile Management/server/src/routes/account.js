import express from 'express';
import { store } from '../db/store.js';

const router = express.Router();

// POST /api/account/deactivate
// Soft temporary account freezing (preserves all data, hides public presence)
router.post('/deactivate', (req, res) => {
  try {
    const { reason = 'User requested temporary quarantine' } = req.body;
    const profile = store.getProfile();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const updated = store.deactivateAccount(profile.id, reason);
    return res.json({
      success: true,
      profile: updated,
      message: 'Account has been quarantined. Public profile is now hidden.'
    });
  } catch (err) {
    console.error('Error deactivating account:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/account/reactivate
// Restores account to active status
router.post('/reactivate', (req, res) => {
  try {
    const profile = store.getProfile();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const updated = store.reactivateAccount(profile.id);
    return res.json({
      success: true,
      profile: updated,
      message: 'Account restored to active status.'
    });
  } catch (err) {
    console.error('Error reactivating account:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/account/delete-intent
// Schedules permanent purge with 14-day recovery grace period
router.post('/delete-intent', (req, res) => {
  try {
    const { confirmation_phrase, reason = '' } = req.body;
    const profile = store.getProfile();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (confirmation_phrase !== 'delete my account') {
      return res.status(400).json({
        error: "Confirmation phrase does not match. You must type 'delete my account' exactly."
      });
    }

    const deletion = store.scheduleAccountDeletion(profile.id, reason);
    return res.json({
      success: true,
      deletion,
      profile: store.getProfile(),
      message: 'Account scheduled for permanent purge in 14 days. You may cancel anytime before this horizon.'
    });
  } catch (err) {
    console.error('Error scheduling account deletion:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/account/cancel-deletion
// Cancels scheduled purge
router.post('/cancel-deletion', (req, res) => {
  try {
    const profile = store.getProfile();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const result = store.cancelAccountDeletion(profile.id);
    return res.json({
      success: true,
      profile: result.profile,
      message: 'Account deletion cancelled successfully. Your profile remains active and secure.'
    });
  } catch (err) {
    console.error('Error cancelling deletion:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/account/audit-logs
router.get('/audit-logs', (req, res) => {
  try {
    const profile = store.getProfile();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const logs = store.getAuditLogs(profile.id);
    return res.json({ logs });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
