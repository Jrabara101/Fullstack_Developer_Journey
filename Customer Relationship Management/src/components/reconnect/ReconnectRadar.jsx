// ============================================================================
// "Keep-in-Touch" Reconnect Radar & Relationship Triage Queue
// Automated Relationship Decay Gauge, Contextual Icebreakers & 1-Click Triage
// ============================================================================

import React, { useState } from 'react';
import { 
  Radio, 
  Clock, 
  Send, 
  Moon, 
  Check, 
  Flame, 
  Sparkles, 
  Mail, 
  Phone, 
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { getRelationshipStrength, formatRelativeTime } from '../../utils/crmUtils';

export default function ReconnectRadar() {
  const { contacts, companies, interactions, snoozeContact, addInteraction } = useCRM();

  // Find contacts whose last interaction is older than keep_in_touch_days or cooling
  const coolingContacts = contacts.filter(contact => {
    const daysSince = Math.floor((Date.now() - new Date(contact.last_interaction_at || 0)) / (86400 * 1000));
    return daysSince >= (contact.keep_in_touch_days || 21);
  });

  const [activeContactId, setActiveContactId] = useState(coolingContacts[0]?.id || null);
  const [draftedMessage, setDraftedMessage] = useState('');
  const [sentSuccessId, setSentSuccessId] = useState(null);

  const activeContact = contacts.find(c => c.id === activeContactId) || coolingContacts[0];
  const company = companies.find(c => c.id === activeContact?.company_id);

  // Auto-generate contextual icebreaker
  const generateIcebreaker = (contact, comp) => {
    if (!contact) return '';
    if (contact.email.includes('openai.com')) {
      return `Hey ${contact.first_name}, saw your exciting move to ${comp?.name || 'the team'} as ${contact.job_title}! Huge congratulations. Would love to grab 15 minutes next week to hear how the new roadmap is shaping up.`;
    }
    return `Hi ${contact.first_name}, hope you're having a great week! It's been a few weeks since our last technical sync on ${comp?.name || 'platform architecture'}. Wanted to share our latest benchmark update and see if you have 10 mins to catch up on Q4 priorities.`;
  };

  const handleSelectContact = (contact) => {
    setActiveContactId(contact.id);
    setDraftedMessage(generateIcebreaker(contact, companies.find(c => c.id === contact.company_id)));
  };

  const handleSendCheckIn = () => {
    if (!activeContact) return;

    addInteraction({
      company_id: activeContact.company_id,
      deal_id: null,
      contact_id: activeContact.id,
      actor_user_id: 'usr-1',
      actor_name: 'Alex Rivera',
      actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
      type: 'email',
      direction: 'outbound',
      subject: `Catch up & Q4 updates with ${activeContact.first_name}`,
      body: draftedMessage || generateIcebreaker(activeContact, company),
      metadata: {
        channel: 'reconnect_queue',
        automated_icebreaker: true
      }
    });

    setSentSuccessId(activeContact.id);
    setTimeout(() => {
      setSentSuccessId(null);
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-hidden p-6 flex flex-col bg-canvas-light dark:bg-canvas-dark space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>"Keep-in-Touch" Relationship Radar</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                {coolingContacts.length} VIP Contacts Cooling Down
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proactive relationship cadences prevent deal drift and turn silent champion networks into warm revenue.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Keyboard shortcuts:</span>
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border">E: Send</kbd>
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border">S: Snooze 14d</kbd>
        </div>
      </div>

      {/* Split Triage Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Left Column: Cooling Contacts List (5 cols) */}
        <div className="md:col-span-5 rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark overflow-y-auto divide-y divide-hairline-light dark:divide-hairline-dark shadow-2xs">
          {coolingContacts.map((contact) => {
            const comp = companies.find(c => c.id === contact.company_id);
            const daysSince = Math.floor((Date.now() - new Date(contact.last_interaction_at || 0)) / (86400 * 1000));
            const rel = getRelationshipStrength(contact.relationship_score || 40);
            const isSelected = activeContact?.id === contact.id;

            return (
              <div
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className={`p-4 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-amber-500/[0.08] border-l-4 border-l-amber-500'
                    : 'hover:bg-slate-50 dark:hover:bg-surface-dark'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={contact.avatar_url}
                      alt={contact.first_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-hairline-light dark:ring-hairline-dark"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {contact.first_name} {contact.last_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {contact.job_title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        <span>{comp?.favicon}</span>
                        <span>{comp?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Relationship Gauge */}
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${rel.bgClass}`}>
                      <span>{rel.emoji}</span>
                      <span>{rel.label}</span>
                    </span>
                    <span className="block text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-1">
                      Idle {daysSince}d (Cadence: {contact.keep_in_touch_days}d)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Contextual Icebreaker Composer & 1-Click Triage (7 cols) */}
        {activeContact ? (
          <div className="md:col-span-7 rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark p-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              {/* Target Profile Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-hairline-light dark:border-hairline-dark">
                <div className="flex items-center gap-3">
                  <img
                    src={activeContact.avatar_url}
                    alt={activeContact.first_name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-brand/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {activeContact.first_name} {activeContact.last_name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {activeContact.job_title} • <span className="font-semibold text-slate-700 dark:text-slate-300">{company?.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => snoozeContact(activeContact.id, 14)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-hairline-light dark:border-hairline-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Snooze 14 Days
                  </button>
                </div>
              </div>

              {/* Context Summary Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-hairline-light dark:border-hairline-dark space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last Interaction: {formatRelativeTime(activeContact.last_interaction_at)}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Relationship score currently at <strong className="text-amber-500">{activeContact.relationship_score}/100</strong>. Last logged touchpoint was an executive discussion regarding procurement milestones.
                </p>
              </div>

              {/* AI Contextual Icebreaker Draft */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand" />
                    AI Contextual Icebreaker Composer
                  </span>
                  <button
                    onClick={() => setDraftedMessage(generateIcebreaker(activeContact, company))}
                    className="text-[11px] text-brand hover:underline font-medium"
                  >
                    Regenerate Draft
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={draftedMessage || generateIcebreaker(activeContact, company)}
                  onChange={(e) => setDraftedMessage(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-hairline-light dark:border-hairline-dark bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-hairline-light dark:border-hairline-dark flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Pings {activeContact.email} directly
              </span>

              <button
                onClick={handleSendCheckIn}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-brand hover:bg-brand-hover text-white shadow-xs transition-all active:scale-95"
              >
                {sentSuccessId === activeContact.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Check-in Dispatched!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Quick Check-in (E)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="md:col-span-7 rounded-2xl border border-hairline-light dark:border-hairline-dark bg-surface-elevated-light dark:bg-surface-elevated-dark p-8 flex flex-col items-center justify-center text-slate-400">
            <span>No cooling contacts selected.</span>
          </div>
        )}
      </div>
    </div>
  );
}
