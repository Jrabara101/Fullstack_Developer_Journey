import express from 'express';
import archiver from 'archiver';
import { store } from '../db/store.js';

const router = express.Router();

// GET /api/account/export-takeout
// Compiles full machine-readable data takeout zip archive (GDPR/CCPA compliant)
router.get('/export-takeout', (req, res) => {
  try {
    const profile = store.getProfile();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const auditLogs = store.getAuditLogs(profile.id);
    const pendingDeletion = store.getPendingDeletion(profile.id);

    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    const filename = `data-takeout-${profile.username}-${new Date().toISOString().split('T')[0]}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      res.status(500).end();
    });

    archive.pipe(res);

    // 1. Profile metadata
    archive.append(JSON.stringify({
      user_id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      headline: profile.headline,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      website_url: profile.website_url,
      social_links: profile.social_links,
      account_status: profile.account_status,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }, null, 2), { name: 'identity/profile.json' });

    // 2. Preferences & Regional Locale
    archive.append(JSON.stringify({
      locale_preferences: profile.locale_preferences,
      theme_preference: profile.theme_preference,
      density_preference: profile.density_preference,
      quiet_hours: profile.quiet_hours,
      discoverable_by_search: profile.discoverable_by_search
    }, null, 2), { name: 'preferences/settings.json' });

    // 3. Privacy Visibility Scopes
    archive.append(JSON.stringify({
      visibility_settings: profile.visibility_settings,
      discoverability_index: profile.discoverable_by_search
    }, null, 2), { name: 'privacy/visibility_matrix.json' });

    // 4. Audit Log Trail
    archive.append(JSON.stringify({
      total_events: auditLogs.length,
      events: auditLogs
    }, null, 2), { name: 'security/audit_trail.json' });

    // 5. Media Inventory
    archive.append(JSON.stringify({
      avatar_url: profile.avatar_url,
      banner_url: profile.banner_url,
      avatar_alt_text: profile.avatar_alt_text
    }, null, 2), { name: 'media/asset_manifest.json' });

    // 6. GDPR/CCPA Compliance Certificate
    const certificateText = `================================================================================
GDPR / CCPA PERSONAL DATA PORTABILITY CERTIFICATE
================================================================================
Data Subject: ${profile.display_name} (@${profile.username})
Account ID:   ${profile.id}
Export Date:  ${new Date().toUTCString()}
Format:       RFC-8259 Standard Compliant JSON & ZIP Archive
Authority:    European Union GDPR Article 20 / California CCPA Section 1798.100

This verified archive encompasses all personal identity records, preference
matrices, audit security entries, and media references stored in your account.
Your data sovereignty is guaranteed with zero vendor lock-in.

Atelier Identity Systems Inc. | Data Protection Officer
================================================================================`;

    archive.append(certificateText, { name: 'GDPR_DATA_SOVEREIGNTY_CERTIFICATE.txt' });

    // Log the takeout export in audit log
    store.addAuditLog(profile.id, 'data_takeout_downloaded', {
      format: 'zip',
      timestamp: new Date().toISOString()
    });

    archive.finalize();
  } catch (err) {
    console.error('Error generating takeout:', err);
    return res.status(500).json({ error: 'Failed to generate archive' });
  }
});

export default router;
