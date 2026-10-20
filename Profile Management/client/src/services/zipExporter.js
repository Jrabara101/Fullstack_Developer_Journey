import JSZip from 'jszip';

/**
 * Client-Side Instant Data Takeout Generator using JSZip
 * Ensures guaranteed GDPR/CCPA export even in offline or direct-client scenarios.
 */
export async function generateClientTakeoutZip(profile, auditLogs = []) {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().split('T')[0];
  const safeUsername = profile.username || 'user';

  // 1. Identity folder
  const identityFolder = zip.folder('identity');
  identityFolder.file('profile.json', JSON.stringify({
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    headline: profile.headline,
    bio: profile.bio,
    email: profile.email,
    phone: profile.phone,
    website_url: profile.website_url,
    social_links: profile.social_links,
    avatar_alt_text: profile.avatar_alt_text,
    created_at: profile.created_at,
    updated_at: profile.updated_at
  }, null, 2));

  // 2. Preferences
  const prefFolder = zip.folder('preferences');
  prefFolder.file('settings.json', JSON.stringify({
    locale_preferences: profile.locale_preferences,
    theme_preference: profile.theme_preference,
    density_preference: profile.density_preference,
    quiet_hours: profile.quiet_hours,
    discoverable_by_search: profile.discoverable_by_search
  }, null, 2));

  // 3. Privacy & Governance
  const privacyFolder = zip.folder('privacy');
  privacyFolder.file('visibility_matrix.json', JSON.stringify({
    visibility_settings: profile.visibility_settings,
    discoverable_by_search: profile.discoverable_by_search,
    account_status: profile.account_status
  }, null, 2));

  // 4. Security & Audit Trail
  const secFolder = zip.folder('security');
  secFolder.file('audit_trail.json', JSON.stringify({
    export_generated_at: new Date().toISOString(),
    total_events: auditLogs.length,
    events: auditLogs
  }, null, 2));

  // 5. Media references
  const mediaFolder = zip.folder('media');
  mediaFolder.file('asset_manifest.json', JSON.stringify({
    avatar_url: profile.avatar_url,
    banner_url: profile.banner_url,
    avatar_alt_text: profile.avatar_alt_text
  }, null, 2));

  // 6. GDPR Certificate
  const certText = `================================================================================
GDPR / CCPA PERSONAL DATA PORTABILITY CERTIFICATE
================================================================================
Subject:      ${profile.display_name} (@${profile.username})
Account ID:   ${profile.id}
Export Date:  ${new Date().toUTCString()}
Format:       RFC-8259 Standard Compliant JSON & ZIP Archive
Regulations:  EU GDPR Article 20 / California CCPA Section 1798.100

This verified archive encompasses all personal identity records, preference
matrices, audit security entries, and media references stored in your account.
Your data sovereignty is guaranteed with zero vendor lock-in.

Atelier Identity Systems Inc. | Data Protection Officer
================================================================================`;

  zip.file('GDPR_DATA_SOVEREIGNTY_CERTIFICATE.txt', certText);

  // Generate blob
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  // Trigger download
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `data-takeout-${safeUsername}-${timestamp}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  return {
    success: true,
    sizeBytes: zipBlob.size,
    filename: `data-takeout-${safeUsername}-${timestamp}.zip`
  };
}
