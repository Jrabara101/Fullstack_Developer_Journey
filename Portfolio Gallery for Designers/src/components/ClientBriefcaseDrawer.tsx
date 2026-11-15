import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  Link2,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { BriefcaseItemState, ComputedArtifactMeta } from '../types/portfolio';
import {
  buildAestheticSummary,
  buildDesignTokenBundleJson,
  encodeBriefcaseToken,
} from '../engine/briefcaseService';

interface ClientBriefcaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  onChangeRoomTitle: (title: string) => void;
  items: BriefcaseItemState[];
  metaById: Map<string, ComputedArtifactMeta>;
  onMoveItem: (id: string, direction: -1 | 1) => void;
  onUpdateNote: (id: string, note: string) => void;
  onRemoveItem: (id: string) => void;
  onInspectArtifact: (id: string) => void;
  defaultOpenInquiry?: boolean;
  loadedFromToken: string | null;
}

const SCOPE_PILLS = [
  'Brand & Design Sprint',
  'Product UI Architecture',
  'Editorial Photography Commission',
  'Archival Print / Licensing',
] as const;

export const ClientBriefcaseDrawer: React.FC<ClientBriefcaseDrawerProps> = ({
  isOpen,
  onClose,
  roomTitle,
  onChangeRoomTitle,
  items,
  metaById,
  onMoveItem,
  onUpdateNote,
  onRemoveItem,
  onInspectArtifact,
  defaultOpenInquiry = false,
  loadedFromToken,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(defaultOpenInquiry);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['Brand & Design Sprint']);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const pinnedMetas = useMemo(
    () =>
      items
        .map((item) => metaById.get(item.id))
        .filter((m): m is ComputedArtifactMeta => Boolean(m)),
    [items, metaById]
  );

  const aestheticSummary = useMemo(() => buildAestheticSummary(pinnedMetas), [pinnedMetas]);
  const hasDesignSystems = pinnedMetas.some((m) => Boolean(m.artifact.designManifest));

  if (!isOpen) return null;

  const generateShareUrl = (): string => {
    const token = encodeBriefcaseToken({
      token: '',
      title: roomTitle,
      items,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    const url = new URL(window.location.href);
    url.searchParams.set('briefcase', token);
    url.searchParams.set('room', roomTitle);
    return url.toString();
  };

  const handleCopyViewingRoomLink = () => {
    const shareUrl = generateShareUrl();
    window.history.replaceState({}, '', shareUrl);
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleOpenViewingRoomNewTab = () => {
    const shareUrl = generateShareUrl();
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadTokenBundle = () => {
    const json = buildDesignTokenBundleJson(pinnedMetas);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'atelier-sorensen-briefcase-tokens.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/35 backdrop-blur-[3px]" onClick={onClose}>
      <section
        className="w-full max-h-[86vh] overflow-y-auto glass-whisper border-t border-[var(--border-hairline-strong)] shadow-[0_-24px_80px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="exhibition-grid-container py-7 sm:py-8">
          {/* Header: Viewing Room Title + Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <span className="w-[6px] h-[6px] rounded-full bg-[var(--accent-vermilion)]" />
                <span className="font-mono-catalog text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  CLIENT BRIEFCASE &amp; COLLABORATIVE VIEWING ROOM ({pinnedMetas.length} PLATES)
                </span>
                {loadedFromToken && (
                  <span className="font-mono-catalog text-[10px] px-2 py-0.5 rounded-full bg-[var(--canvas-elevated)] border border-[var(--border-hairline)] text-[var(--text-secondary)]">
                    Restored from Token ?briefcase={loadedFromToken.slice(0, 10)}
                  </span>
                )}
              </div>

              <input
                type="text"
                value={roomTitle}
                onChange={(e) => onChangeRoomTitle(e.target.value)}
                aria-label="Viewing Room Title"
                className="w-full bg-transparent font-serif-display text-[28px] sm:text-[34px] leading-tight text-[var(--text-primary)] focus:outline-none border-b border-transparent focus:border-[var(--border-hairline-strong)]"
                placeholder="Name this Viewing Room (e.g. Q1 Rebrand Inspiration)"
              />

              <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-[var(--accent-vermilion)]" />
                <span>{aestheticSummary}</span>
              </p>
            </div>

            {/* Action Pills */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {hasDesignSystems && (
                <button
                  type="button"
                  onClick={handleDownloadTokenBundle}
                  className="px-3.5 py-2 rounded-full border border-[var(--border-hairline-strong)] text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--canvas-elevated)] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Design Tokens JSON</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyViewingRoomLink}
                disabled={pinnedMetas.length === 0}
                className="px-4 py-2 rounded-full border border-[var(--border-hairline-strong)] bg-[var(--canvas-elevated)] hover:opacity-90 disabled:opacity-40 text-[12px] font-medium text-[var(--text-primary)] inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Viewing Room URL Copied</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Copy Viewing Room Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenViewingRoomNewTab}
                disabled={pinnedMetas.length === 0}
                className="p-2 rounded-full border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 cursor-pointer"
                title="Open shareable viewing room in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setInquiryOpen((v) => !v);
                  setInquirySent(false);
                }}
                className="px-4 py-2 rounded-full bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)] text-[12px] font-medium inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{inquiryOpen ? 'Hide Commission Brief' : 'Commission Work Like This'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-[var(--border-hairline)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label="Close Client Briefcase"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Curated Filmstrip */}
          {pinnedMetas.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-secondary)] text-[14px]">
              Your briefcase is currently clear. Click <span className="font-mono-catalog">+ Briefcase</span> on any exhibition plate or contact frame to curate a custom deck.
            </div>
          ) : (
            <div className="mt-6 flex gap-5 overflow-x-auto pb-3">
              {pinnedMetas.map((meta, idx) => {
                const { artifact, maxPrint300Dpi } = meta;
                const stateItem = items.find((i) => i.id === artifact.id);

                return (
                  <div
                    key={artifact.id}
                    className="w-[270px] shrink-0 rounded-[12px] border border-[var(--border-hairline)] bg-[var(--canvas-bg)] p-3.5 flex flex-col justify-between"
                  >
                    <div>
                      <div
                        onClick={() => onInspectArtifact(artifact.id)}
                        className="h-[145px] bg-[var(--canvas-elevated)] border border-[var(--border-hairline)] flex items-center justify-center p-2 cursor-pointer"
                      >
                        <img
                          src={artifact.imageUrl}
                          alt={artifact.title}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      <div className="mt-3 flex items-baseline justify-between gap-2">
                        <span className="font-mono-catalog text-[10px] uppercase tracking-[0.07em] text-[var(--text-muted)]">
                          PLATE {artifact.catalogNumber} • {artifact.aspectRatioLabel}
                        </span>
                        <span className="font-mono-catalog text-[10px] text-[var(--text-muted)]">
                          #{idx + 1}
                        </span>
                      </div>

                      <div
                        onClick={() => onInspectArtifact(artifact.id)}
                        className="font-serif-display text-[20px] leading-tight text-[var(--text-primary)] mt-0.5 cursor-pointer hover:underline truncate"
                      >
                        {artifact.title}
                      </div>

                      <div className="font-mono-catalog text-[10px] text-[var(--text-secondary)] mt-1">
                        {maxPrint300Dpi
                          ? `Max Print @ 300 DPI: ${maxPrint300Dpi.formattedIn}`
                          : `System Tokens: ${artifact.designManifest?.colorTokens.length ?? 3} swatches`}
                      </div>

                      {/* Optional Client Margin Note */}
                      <input
                        type="text"
                        value={stateItem?.note ?? ''}
                        onChange={(e) => onUpdateNote(artifact.id, e.target.value)}
                        placeholder="Add margin note for team..."
                        className="mt-2.5 w-full px-2.5 py-1.5 rounded-[8px] bg-[var(--canvas-elevated)] border border-[var(--border-hairline)] text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-hairline-strong)]"
                      />
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[var(--border-hairline)] flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onMoveItem(artifact.id, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-[var(--canvas-elevated)] disabled:opacity-30 cursor-pointer"
                          title="Move earlier in sequence"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveItem(artifact.id, 1)}
                          disabled={idx === pinnedMetas.length - 1}
                          className="p-1 rounded hover:bg-[var(--canvas-elevated)] disabled:opacity-30 cursor-pointer"
                          title="Move later in sequence"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(artifact.id)}
                        className="font-mono-catalog text-[10px] uppercase tracking-[0.06em] text-[var(--text-muted)] hover:text-[var(--accent-vermilion)] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Contextual Inquiry Composer */}
          {inquiryOpen && (
            <div className="mt-6 pt-6 border-t border-[var(--border-hairline)]">
              {inquirySent ? (
                <div className="p-5 rounded-[12px] bg-[var(--canvas-elevated)] border border-[var(--border-hairline-strong)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-mono-catalog text-[11px] uppercase tracking-[0.08em] text-emerald-600 dark:text-emerald-400">
                      Commission Dossier Dispatched
                    </div>
                    <h3 className="font-serif-display text-[26px] text-[var(--text-primary)] mt-1">
                      Thank you{clientName ? `, ${clientName}` : ''}. Your visual brief has been queued.
                    </h3>
                    <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                      Attached references:{' '}
                      <span className="font-mono-catalog">
                        {pinnedMetas.map((m) => `#${m.artifact.catalogNumber}`).join(', ') || 'General Studio'}
                      </span>{' '}
                      • Scopes: {selectedScopes.join(', ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInquirySent(false)}
                    className="px-4 py-2 rounded-full border border-[var(--border-hairline-strong)] font-mono-catalog text-[11px] uppercase cursor-pointer"
                  >
                    Edit Brief
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-5 space-y-3">
                    <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Attached Visual References ({pinnedMetas.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pinnedMetas.map((m) => (
                        <span
                          key={m.artifact.id}
                          className="font-mono-catalog text-[11px] px-2.5 py-1 rounded-full bg-[var(--canvas-elevated)] border border-[var(--border-hairline)]"
                        >
                          #{m.artifact.catalogNumber} {m.artifact.title.split('—')[0].trim()}
                        </span>
                      ))}
                    </div>
                    <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] pt-2">
                      1-Tap Scope Tags
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SCOPE_PILLS.map((scope) => {
                        const active = selectedScopes.includes(scope);
                        return (
                          <button
                            key={scope}
                            type="button"
                            onClick={() => toggleScope(scope)}
                            className={`px-3 py-1 rounded-full text-[12px] font-medium border cursor-pointer transition-colors ${
                              active
                                ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)] border-transparent'
                                : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {scope}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Your name or studio / team"
                      className="px-3.5 py-2.5 rounded-[10px] bg-[var(--canvas-bg)] border border-[var(--border-hairline)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-hairline-strong)]"
                    />
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Work email (e.g. alex@linear.app)"
                      className="px-3.5 py-2.5 rounded-[10px] bg-[var(--canvas-bg)] border border-[var(--border-hairline)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-hairline-strong)]"
                    />
                    <textarea
                      rows={2}
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="Target launch window, exhibition location, or key challenge..."
                      className="sm:col-span-2 px-3.5 py-2.5 rounded-[10px] bg-[var(--canvas-bg)] border border-[var(--border-hairline)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-hairline-strong)]"
                    />
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-full bg-[var(--pill-active-bg)] text-[var(--pill-active-ink)] text-[12px] font-medium inline-flex items-center gap-2 cursor-pointer hover:opacity-90"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Brief with {pinnedMetas.length} References</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

