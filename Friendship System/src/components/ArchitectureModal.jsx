import React, { useState } from 'react';
import { Database, X, Copy, Check, Shield, Zap, Layers } from 'lucide-react';

export function ArchitectureModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('schema'); // 'schema' | 'materialized_views' | 'triggers' | 'rls'

  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaContent = `-- 1. RELATIONSHIPS TABLE (Directed Graph Edges)
CREATE TABLE relationships (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT prevent_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX idx_relationships_follower ON relationships(follower_id);
CREATE INDEX idx_relationships_following ON relationships(following_id);
CREATE INDEX idx_relationships_reverse ON relationships(following_id, follower_id);`;

  const mvContent = `-- 2. MATERIALIZED VIEW & COMPUTED VIEW FOR SUB-MILLISECOND MUTUAL LOOKUPS
CREATE OR REPLACE VIEW friendships AS
SELECT 
    r1.follower_id AS user_a_id,
    r1.following_id AS user_b_id,
    GREATEST(r1.created_at, r2.created_at) AS established_at,
    LEAST(r1.created_at, r2.created_at) AS initial_follow_at
FROM relationships r1
JOIN relationships r2 
  ON r1.follower_id = r2.following_id 
 AND r1.following_id = r2.follower_id;

-- Materialized View with Canonical (LEAST, GREATEST) indexing
CREATE MATERIALIZED VIEW friendships_materialized AS
SELECT 
    LEAST(r1.follower_id, r1.following_id) AS user_low_id,
    GREATEST(r1.follower_id, r1.following_id) AS user_high_id,
    GREATEST(r1.created_at, r2.created_at) AS established_at
FROM relationships r1
JOIN relationships r2 
  ON r1.follower_id = r2.following_id 
 AND r1.following_id = r2.follower_id
WHERE r1.follower_id < r1.following_id;

CREATE UNIQUE INDEX idx_friendships_mat_pair 
ON friendships_materialized(user_low_id, user_high_id);`;

  const triggerContent = `-- 3. POST-INSERT TRIGGER & REALTIME NOTIFICATION
CREATE OR REPLACE FUNCTION handle_relationship_insert()
RETURNS TRIGGER AS $$
DECLARE
    is_reciprocal BOOLEAN;
BEGIN
    SELECT TRUE INTO is_reciprocal
    FROM relationships
    WHERE follower_id = NEW.following_id 
      AND following_id = NEW.follower_id;

    IF is_reciprocal IS TRUE THEN
        -- Fire real-time WebSocket event for mutual friendship
        PERFORM pg_notify(
            'social_events', 
            jsonb_build_object(
                'event', 'relationship.mutual_unlocked',
                'user_a_id', NEW.follower_id,
                'user_b_id', NEW.following_id,
                'established_at', NEW.created_at
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_relationship_mutual_check
AFTER INSERT ON relationships
FOR EACH ROW
EXECUTE FUNCTION handle_relationship_insert();`;

  const rlsContent = `-- 4. FINE-GRAINED ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gated posts access policy"
ON posts FOR SELECT
USING (
    -- Author always has full access
    auth.uid() = author_id
    OR
    audience = 'public'
    OR
    (audience = 'followers' AND EXISTS (
        SELECT 1 FROM relationships 
        WHERE follower_id = auth.uid() AND following_id = posts.author_id
    ))
    OR
    -- Mutual friends only: bidirectional edge required
    (audience = 'mutuals' AND are_mutual_friends(auth.uid(), posts.author_id))
);`;

  const activeContent = {
    schema: schemaContent,
    materialized_views: mvContent,
    triggers: triggerContent,
    rls: rlsContent,
  }[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl rounded-3xl glass-panel-elevated border border-slate-700/80 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                PostgreSQL & Supabase Architecture
              </h2>
              <p className="text-xs text-slate-400">
                High-concurrency data model, Materialized Views, Triggers & RLS policies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800/80 px-6 pt-2 bg-slate-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Table Schemas</span>
          </button>

          <button
            onClick={() => setActiveTab('materialized_views')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'materialized_views'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Materialized Views</span>
          </button>

          <button
            onClick={() => setActiveTab('triggers')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'triggers'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Real-time Triggers</span>
          </button>

          <button
            onClick={() => setActiveTab('rls')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rls'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Row-Level Security (RLS)</span>
          </button>
        </div>

        {/* Code Content Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#07090e]">
          <div className="relative">
            <button
              onClick={() => copyToClipboard(activeContent)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700/80 shadow-md backdrop-blur-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>

            <pre className="font-mono text-xs text-indigo-200/90 leading-relaxed overflow-x-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
              <code>{activeContent}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Complete source available in <code>schema.sql</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
