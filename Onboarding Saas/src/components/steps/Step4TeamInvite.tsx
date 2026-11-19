import React, { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import {
  Users,
  UserPlus,
  Mail,
  Copy,
  Check,
  Shield,
  Sparkles,
  Link,
  Plus,
  X,
  Rocket
} from 'lucide-react';

export const Step4TeamInvite: React.FC = () => {
  const { workspaceDraft, enrichedCompany, completeCurrentStep } = useOnboardingStore();

  const [emailTags, setEmailTags] = useState<Array<{ email: string; role: 'Admin' | 'Editor' | 'Member' }>>([
    { email: 'sarah.connor@acme.inc', role: 'Editor' },
    { email: 'd.ross@acme.inc', role: 'Member' }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentRole, setCurrentRole] = useState<'Admin' | 'Editor' | 'Member'>('Member');
  const [linkCopied, setLinkCopied] = useState(false);
  const [batchInvited, setBatchInvited] = useState<Record<string, boolean>>({});

  const domainTeammates = enrichedCompany?.teammatesAvailable || [];

  const handleAddEmail = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const clean = currentInput.trim().replace(',', '');
    if (clean && clean.includes('@') && !emailTags.some((t) => t.email === clean)) {
      setEmailTags([...emailTags, { email: clean, role: currentRole }]);
      setCurrentInput('');
    }
  };

  const handleRemoveTag = (email: string) => {
    setEmailTags(emailTags.filter((t) => t.email !== email));
  };

  const handleToggleAutoTeammate = (teammate: { name: string; email: string }) => {
    const isAdded = batchInvited[teammate.email];
    if (isAdded) {
      setBatchInvited({ ...batchInvited, [teammate.email]: false });
      setEmailTags(emailTags.filter((t) => t.email !== teammate.email));
    } else {
      setBatchInvited({ ...batchInvited, [teammate.email]: true });
      setEmailTags([...emailTags, { email: teammate.email, role: 'Member' }]);
    }
  };

  const handleCopyInviteLink = () => {
    const link = `https://${workspaceDraft.slug}.acme.app/join?invite=inv_live_901a`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
          Invite your team to collaborate
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bring your engineering leads, product managers, and executives together to accelerate delivery.
        </p>
      </div>

      {/* 1. Frictionless Domain Co-Worker Auto-Discovery */}
      {domainTeammates.length > 0 && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-custom" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Discovered teammates from @{enrichedCompany?.domain}
              </span>
            </div>
            <span className="text-[11px] font-mono text-brand-custom">
              Prevent duplicate workspaces
            </span>
          </div>

          <div className="space-y-2">
            {domainTeammates.map((tm) => {
              const added = batchInvited[tm.email];
              return (
                <div
                  key={tm.email}
                  className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={tm.avatar}
                      alt={tm.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {tm.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {tm.email} • {tm.role}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAutoTeammate(tm)}
                    className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                      added
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {added ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
                    <span>{added ? 'Added' : 'Add to Workspace'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Bulk Email Tag Input */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Enter Colleague Emails
        </label>
        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-within:ring-2 focus-within:ring-brand-custom transition-all shadow-xs space-y-2">
          {/* Active Tags */}
          <div className="flex flex-wrap gap-1.5">
            {emailTags.map((tag) => (
              <span
                key={tag.email}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200"
              >
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{tag.email}</span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-600 px-1 py-0.2 rounded font-sans text-slate-600 dark:text-slate-300">
                  {tag.role}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.email)}
                  className="hover:text-red-500 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="email"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleAddEmail}
              placeholder="Paste email and press Enter or comma..."
              className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-mono"
            />
            
            {/* Role assignment dropdown pill */}
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as any)}
              className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="Member">Role: Member</option>
              <option value="Editor">Role: Editor</option>
              <option value="Admin">Role: Admin</option>
            </select>

            <button
              type="button"
              onClick={handleAddEmail}
              className="px-2.5 py-1 rounded-lg bg-brand-custom text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* 3. Shareable Invite Deep Link */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
          <span className="font-medium">Or distribute shareable link via Slack/Teams:</span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            Auto-joins domain users
          </span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <Link className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate flex-1 text-slate-600 dark:text-slate-300">
            https://{workspaceDraft.slug}.acme.app/join?invite=inv_live_901a
          </span>
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0 font-sans font-medium transition-colors"
          >
            {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{linkCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
