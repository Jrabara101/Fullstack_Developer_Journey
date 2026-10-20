import React, { useState } from 'react';
import {
  X, Eye, Globe, Users, Lock, Bot, Monitor, Smartphone,
  CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, Mail, Phone, Calendar
} from 'lucide-react';

export function ViewAsSimulatorModal({ isOpen, onClose, profile }) {
  if (!isOpen || !profile) return null;

  const [audience, setAudience] = useState('stranger'); // 'stranger' | 'colleague' | 'crawler' | 'owner'
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'mobile'

  const visibility = profile.visibility_settings || {};
  const isDiscoverable = profile.discoverable_by_search !== false;

  // Filtered values based on audience
  const canSeeRealName = audience === 'owner' || visibility.real_name === 'public' || (audience === 'colleague' && visibility.real_name === 'team');
  const canSeeEmail = audience === 'owner' || visibility.email === 'public' || (audience === 'colleague' && visibility.email === 'team');
  const canSeePhone = audience === 'owner' || visibility.phone === 'public' || (audience === 'colleague' && visibility.phone === 'team');
  const canSeeSocial = audience === 'owner' || visibility.social_links === 'public' || (audience === 'colleague' && visibility.social_links === 'team');
  const canSeeActivity = audience === 'owner' || visibility.activity_status === 'public' || (audience === 'colleague' && visibility.activity_status === 'team');

  const displayedName = canSeeRealName ? profile.display_name : `@${profile.username}`;

  // SEO JSON-LD structured snippet
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: canSeeRealName ? profile.display_name : profile.username,
    alternateName: profile.username,
    description: profile.headline || profile.bio,
    image: profile.avatar_url,
    url: `https://atelier.id/@${profile.username}`,
    sameAs: canSeeSocial ? Object.values(profile.social_links || {}).filter(Boolean) : []
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] overflow-hidden flex flex-col">
        {/* Modal Top Navigation & Sandbox Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-[#181B22] gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Eye className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>"View Profile As" Impersonation Sandbox</span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Zero-Trace
                </span>
              </h3>
              <p className="text-xs text-text-muted">
                Simulates privacy policies without logging out
              </p>
            </div>
          </div>

          {/* Device & Close controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  device === 'desktop' ? 'bg-white dark:bg-[#121418] text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  device === 'mobile' ? 'bg-white dark:bg-[#121418] text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audience Selector Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-border-light dark:border-border-dark bg-slate-100/60 dark:bg-black/20 overflow-x-auto text-xs font-medium">
          <span className="text-slate-400 text-[11px] font-medium mr-2 uppercase tracking-wider flex-shrink-0">
            Simulate Persona:
          </span>

          <button
            type="button"
            onClick={() => setAudience('stranger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              audience === 'stranger'
                ? 'bg-white dark:bg-[#181B22] text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Anonymous Stranger</span>
          </button>

          <button
            type="button"
            onClick={() => setAudience('colleague')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              audience === 'colleague'
                ? 'bg-white dark:bg-[#181B22] text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Colleague</span>
          </button>

          <button
            type="button"
            onClick={() => setAudience('crawler')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              audience === 'crawler'
                ? 'bg-white dark:bg-[#181B22] text-amber-600 dark:text-amber-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Search Crawler (Googlebot)</span>
          </button>

          <button
            type="button"
            onClick={() => setAudience('owner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              audience === 'owner'
                ? 'bg-white dark:bg-[#181B22] text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>You (Owner View)</span>
          </button>
        </div>

        {/* Sandbox Stage */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/5 dark:bg-black/50 flex flex-col items-center">
          {audience === 'crawler' ? (
            /* Crawler View (SEO & Meta inspection) */
            <div className="w-full max-w-2xl bg-white dark:bg-[#181B22] rounded-2xl border border-border-light dark:border-border-dark p-6 space-y-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-amber-500" />
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    Search Engine Indexing & Robot Meta Header
                  </h4>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                  isDiscoverable
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                }`}>
                  {isDiscoverable ? 'INDEXABLE (200 OK)' : 'NOINDEX (Disallowed)'}
                </span>
              </div>

              {/* SERP Search Result Simulation */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 font-mono">
                  https://atelier.id/@{profile.username}
                </p>
                <h5 className="text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer mt-0.5">
                  {displayedName} — {profile.headline || 'Profile on Atelier'}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {profile.bio || `View ${displayedName}'s public technical portfolio and engineering identities.`}
                </p>
              </div>

              {/* Meta Tags Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Rendered HTML Meta Directives:
                </h5>
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
{`<meta name="robots" content="${isDiscoverable ? 'index, follow' : 'noindex, nofollow'}" />
<meta property="og:title" content="${displayedName} (@${profile.username})" />
<meta property="og:description" content="${profile.headline || profile.bio || ''}" />
<meta property="og:image" content="${profile.avatar_url || ''}" />
<link rel="canonical" href="https://atelier.id/@${profile.username}" />`}
                </pre>
              </div>

              {/* JSON-LD Preview */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Schema.org Person Structured Data:
                </h5>
                <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed">
{JSON.stringify(jsonLd, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            /* Simulated Rendered Profile Card Frame */
            <div className={`transition-all duration-300 w-full ${device === 'mobile' ? 'max-w-sm' : 'max-w-2xl'}`}>
              <div className="bg-white dark:bg-[#181B22] rounded-2xl border border-border-light dark:border-border-dark overflow-hidden shadow-xl">
                {/* Simulated Panoramic Banner */}
                <div className="h-32 sm:h-40 w-full bg-slate-900 relative">
                  {profile.banner_url ? (
                    <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900" />
                  )}
                </div>

                {/* Simulated Content */}
                <div className="px-6 pb-6 pt-0">
                  <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
                    <img
                      src={profile.avatar_url}
                      alt={profile.avatar_alt_text || 'Avatar'}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-white dark:ring-[#181B22] shadow-xl object-cover bg-slate-800"
                    />

                    {/* Status Pill */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <span className={`w-2 h-2 rounded-full ${canSeeActivity ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      <span>{canSeeActivity ? 'Active now' : 'Status private'}</span>
                    </div>
                  </div>

                  {/* Identity */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{displayedName}</span>
                      {!canSeeRealName && (
                        <span className="text-[11px] font-normal text-slate-400 italic">
                          (Real name masked by privacy scope)
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                      @{profile.username}
                    </p>
                    {profile.headline && (
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-2">
                        {profile.headline}
                      </p>
                    )}
                    {profile.bio && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                  </div>

                  {/* Sensitive Contact & Links Section */}
                  <div className="mt-5 pt-4 border-t border-border-light dark:border-border-dark space-y-2 text-xs">
                    {/* Email */}
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Email Address:</span>
                      </span>
                      {canSeeEmail ? (
                        <span className="font-mono text-slate-900 dark:text-slate-100">{profile.email}</span>
                      ) : (
                        <span className="font-mono text-slate-400 italic flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Redacted (Private)
                        </span>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Direct Telephone:</span>
                      </span>
                      {canSeePhone ? (
                        <span className="font-mono text-slate-900 dark:text-slate-100">{profile.phone}</span>
                      ) : (
                        <span className="font-mono text-slate-400 italic flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Redacted (Private)
                        </span>
                      )}
                    </div>

                    {/* Social links */}
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>Social Handles:</span>
                      </span>
                      {canSeeSocial ? (
                        <div className="flex items-center gap-2">
                          {profile.social_links?.github && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                              gh/{profile.social_links.github}
                            </span>
                          )}
                          {profile.social_links?.x && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                              @{profile.social_links.x}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-slate-400 italic flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Hidden from this audience
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-[#181B22] flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Audience scoping strictly enforced by PostgreSQL Row-Level Security</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition-colors"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
