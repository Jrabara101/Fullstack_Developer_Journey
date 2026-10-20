import express from 'express';
import { store } from '../db/store.js';

const router = express.Router();

// GET /api/profile - Fetch current profile
router.get('/', (req, res) => {
  try {
    const profile = store.getProfile();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const pendingDeletion = store.getPendingDeletion(profile.id);
    return res.json({
      profile,
      pending_deletion: pendingDeletion
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile - Update profile fields
router.put('/', (req, res) => {
  try {
    const updates = req.body;
    const current = store.getProfile();
    if (!current) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Validate username if changed
    if (updates.username && updates.username !== current.username) {
      const cleanUsername = updates.username.toLowerCase().trim();
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(cleanUsername)) {
        return res.status(400).json({
          error: 'Username must be 3-30 characters alphanumeric, underscores, or hyphens only.'
        });
      }
      if (!store.isUsernameAvailable(cleanUsername, current.id)) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      updates.username = cleanUsername;
    }

    // Bio length restriction
    if (updates.bio && updates.bio.length > 500) {
      return res.status(400).json({ error: 'Bio must not exceed 500 characters' });
    }

    // Display name restriction
    if (updates.display_name && updates.display_name.trim().length === 0) {
      return res.status(400).json({ error: 'Display name cannot be empty' });
    }

    const updatedProfile = store.updateProfile(current.id, updates);
    return res.json({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/profile/check-username?username=...
router.get('/check-username', (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Username parameter required' });
    }

    const clean = username.toString().toLowerCase().trim();
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(clean)) {
      return res.json({
        available: false,
        reason: 'Must be 3-30 chars, letters, numbers, hyphens or underscores only.'
      });
    }

    const current = store.getProfile();
    const available = store.isUsernameAvailable(clean, current?.id);

    return res.json({
      available,
      username: clean,
      reason: available ? 'Username is available' : 'Username is already taken'
    });
  } catch (err) {
    console.error('Error checking username:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
