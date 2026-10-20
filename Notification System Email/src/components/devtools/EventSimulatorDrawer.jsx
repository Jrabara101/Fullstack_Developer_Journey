import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  ShieldAlert, 
  GitPullRequest, 
  MessageSquare, 
  CreditCard, 
  Flame, 
  Zap, 
  Moon,
  X,
  Radio
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const EventSimulatorDrawer = ({ isOpen, onClose }) => {
  const { dispatchIncomingNotification, fatigueEngine } = useNotifications();
  const [lastResult, setLastResult] = useState(null);
  const [burstCount, setBurstCount] = useState(0);

  if (!isOpen) return null;

  const triggerSarahMention = () => {
    const res = dispatchIncomingNotification({
      id: `sim-${Date.now()}`,
      category: 'collaboration',
      actor: {
        name: 'Sarah Lin',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
        role: 'Staff Product Manager',
        email: 'sarah.lin@acme.corp',
      },
      targetEntity: {
        type: 'comment',
        name: 'Q4 Product Strategy Roadmap',
        preview: '"Updated the timeline for the global notification infrastructure rollout."',
        url: 'https://linear.app/acme/project/roadmap-q4',
      },
      title: 'Sarah Lin mentioned you in Q4 Product Strategy Roadmap',
      body: 'Updated the timeline for the global notification infrastructure rollout.',
      actionType: 'quick_reply',
      actionResolved: false,
      createdAt: new Date().toISOString(),
      deliveryRuleReason: 'Direct @mention trigger dispatched via real-time WebSocket connection.',
      metadata: {
        priority: 'high',
        channelDelivered: ['in_app', 'email'],
      },
    });
    setLastResult(res);
  };

  const triggerPrReview = () => {
    const res = dispatchIncomingNotification({
      id: `sim-pr-${Date.now()}`,
      category: 'collaboration',
      actor: {
        name: 'Alex Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
        role: 'Senior Systems Architect',
        email: 'alex.vance@acme.corp',
      },
      targetEntity: {
        type: 'pull_request',
        name: `PR #${Math.floor(400 + Math.random() * 90)}: feature: zero-copy stream processing`,
        preview: 'Optimizes SSE broadcast pipeline with ring buffer memory pool.',
        url: 'https://github.com/acme/infra/pulls',
        diffStats: { additions: 180, deletions: 42, filesChanged: 8 },
      },
      title: 'Alex Vance requested your review on PR #445',
      body: 'Optimizes SSE broadcast pipeline with ring buffer memory pool.',
      actionType: 'approve_pr',
      actionResolved: false,
      createdAt: new Date().toISOString(),
      deliveryRuleReason: 'Requested reviewer via CODEOWNERS routing rule.',
      metadata: {
        priority: 'urgent',
        escalationPending: true,
        escalationDueAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        channelDelivered: ['in_app'],
      },
    });
    setLastResult(res);
  };

  const triggerCriticalSecurity = () => {
    const res = dispatchIncomingNotification({
      id: `sim-sec-${Date.now()}`,
      category: 'security',
      actor: {
        name: 'Security Shield Guardian',
        avatar: null,
        role: 'Threat Intelligence Bot',
        email: 'security-alerts@acme.corp',
      },
      targetEntity: {
        type: 'auth_session',
        name: 'Critical Security Alert: API Key Compromise Detected',
        preview: 'Token leaked in public repository commit. Token automatically revoked.',
        ip: '45.134.140.22',
        location: 'Warsaw, Poland',
        device: 'Automated Botnet Crawler',
      },
      title: 'Critical: Production API Key Revoked',
      body: 'Token leaked in public repository commit. Token automatically revoked to prevent unauthorized access.',
      actionType: 'security_action',
      actionResolved: false,
      createdAt: new Date().toISOString(),
      deliveryRuleReason: 'Critical security anomaly detection policy (mandatory bypass).',
      metadata: {
        priority: 'critical',
        channelDelivered: ['in_app', 'email', 'push'],
      },
    });
    setLastResult(res);
  };

  // Trigger rapid burst spam to demonstrate Fatigue Shield Batch Aggregation!
  const triggerRapidSpamBurst = () => {
    const authors = ['Sarah Lin', 'Marcus Thorne', 'Elena Rostova', 'Devon Miles', 'Chloe Bennett'];
    authors.forEach((author, i) => {
      setTimeout(() => {
        const res = dispatchIncomingNotification({
          id: `burst-${Date.now()}-${i}`,
          category: 'collaboration',
          actor: {
            name: author,
            avatar: null,
            role: 'Product Contributor',
            email: `${author.toLowerCase().replace(' ', '.')}@acme.corp`,
          },
          targetEntity: {
            type: 'comment',
            name: 'Q4 Product Strategy Roadmap',
            preview: `Comment message #${i + 1} on roadmap discussion.`,
          },
          title: `${author} commented on Q4 Product Strategy Roadmap`,
          body: `Comment message #${i + 1} on roadmap discussion.`,
          actionType: 'quick_reply',
          actionResolved: false,
          createdAt: new Date().toISOString(),
          deliveryRuleReason: 'Thread participant subscription rule.',
          metadata: { priority: 'normal' },
        });
        setLastResult(res);
      }, i * 200);
    });
    setBurstCount((c) => c + 1);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-[#131418] border-l border-slate-200 dark:border-[#242730] shadow-2xl flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#242730] bg-slate-50 dark:bg-[#101217]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Real-Time Event Simulator
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Test live dispatches &amp; Fatigue Shield
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Simulator Actions */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
        {/* Notice */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 leading-relaxed">
          Use these triggers to simulate production webhook events. Observe real-time bell badge counter morphing, sound chimes, and the <strong>Cognitive Fatigue Shield</strong> in action!
        </div>

        {/* Trigger Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={triggerSarahMention}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-left transition-all shadow-sm flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Mention: Sarah Lin in Roadmap
              </div>
              <div className="text-[11px] text-slate-500">
                Dispatches high-priority in-app and instant email
              </div>
            </div>
          </button>

          <button
            onClick={triggerPrReview}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-left transition-all shadow-sm flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Pull Request Review Request
              </div>
              <div className="text-[11px] text-slate-500">
                Action-in-place PR review with 30-min escalation timer
              </div>
            </div>
          </button>

          <button
            onClick={triggerCriticalSecurity}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-left transition-all shadow-sm flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-red-600 dark:text-red-400">
                Critical Security Alert (Mandatory)
              </div>
              <div className="text-[11px] text-slate-500">
                Bypasses DND quiet hours and rate ceilings
              </div>
            </div>
          </button>

          {/* SPAM BURST BUTTON FOR FATIGUE SHIELD */}
          <button
            onClick={triggerRapidSpamBurst}
            className="w-full p-3.5 rounded-xl border-2 border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/50 text-left transition-all shadow-sm flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-indigo-700 dark:text-indigo-300">
                Simulate 5x Rapid Spam Burst
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                Demonstrates Cognitive Fatigue Shield aggregation into single rollup!
              </div>
            </div>
          </button>
        </div>

        {/* Real-time Shield Outcome Log */}
        {lastResult && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1.5 animate-fade-in">
            <div className="text-slate-400 font-semibold border-b border-zinc-800 pb-1">
              // Shield Evaluation Outcome
            </div>
            <div>
              <span className="text-blue-400">Status:</span>{' '}
              <span className="text-emerald-400 font-bold">{lastResult.shieldStatus}</span>
            </div>
            <div className="text-slate-300 leading-relaxed">
              <span className="text-purple-400">Reason:</span> {lastResult.reason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
