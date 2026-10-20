import React from 'react';
import { Globe, Sparkles } from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '../common/BrandIcons';
import { generateGradientAvatar } from '../../services/avatarGenerator';

export function ProfilePreviewCard({ profile }) {
  if (!profile) return null;

  const effectiveAvatar = profile.avatar_url || generateGradientAvatar(profile.display_name || 'User');

  return (
    <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#121418] overflow-hidden shadow-sm space-y-4">
      <div className="flex items-center justify-between px-6 pt-5 pb-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Real-Time Profile Reflection</span>
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
          Live Uncommitted State
        </span>
      </div>

      <div className="px-6 pb-6">
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#181B22]">
          {/* Banner */}
          <div className="h-24 w-full bg-slate-900 relative">
            {profile.banner_url ? (
              <img src={profile.banner_url} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900" />
            )}
          </div>

          <div className="px-5 pb-5">
            <div className="-mt-8 mb-3 flex items-end justify-between">
              <img
                src={effectiveAvatar}
                alt={profile.avatar_alt_text || profile.display_name}
                className="w-16 h-16 rounded-full ring-4 ring-white dark:ring-[#181B22] shadow-lg object-cover bg-slate-800"
              />
              <span className="px-2.5 py-1 text-[11px] font-mono rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                @{profile.username || 'username'}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {profile.display_name || 'Display Name'}
              </h4>
              {profile.headline && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  {profile.headline}
                </p>
              )}
              {profile.bio && (
                <p className="text-xs text-text-muted mt-2 line-clamp-3 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Links */}
            {(profile.website_url || profile.social_links?.github || profile.social_links?.x) && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-text-muted">
                {profile.website_url && (
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[150px]">{profile.website_url.replace(/^https?:\/\//, '')}</span>
                  </span>
                )}
                {profile.social_links?.github && (
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    <GithubIcon className="w-3 h-3 text-slate-400" />
                    <span>{profile.social_links.github}</span>
                  </span>
                )}
                {profile.social_links?.x && (
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    <TwitterIcon className="w-3 h-3 text-slate-400" />
                    <span>@{profile.social_links.x}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
