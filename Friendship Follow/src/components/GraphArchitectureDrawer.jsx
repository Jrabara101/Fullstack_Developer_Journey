import React, { useState } from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { Database, Code2, Shield, Radio, Table, X } from 'lucide-react';

export function GraphArchitectureDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('topology'); // 'topology' | 'schema' | 'triggers' | 'rls'

  if (!isOpen) return null;

  const users = graphEngine.users;
  const relationships = graphEngine.relationships;

  // Compute real-time mutual pairs
  const mutualPairs = [];
  const visited = new Set();

  for (const r of relationships) {
    const reverse = relationships.find(
      other => other.followerId === r.followingId && other.followingId === r.followerId
    );
    if (reverse) {
      const key = [r.followerId, r.followingId].sort().join(':');
      if (!visited.has(key)) {
        visited.add(key);
        const userA = graphEngine.getUserById(r.followerId);
        const userB = graphEngine.getUserById(r.followingId);
        mutualPairs.push({
          userA,
          userB,
          mutualSince: r.createdAt > reverse.createdAt ? r.createdAt : reverse.createdAt,
        });
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-3xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-[#26292E] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 text-white shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-zinc-50">
                PostgreSQL & Graph Architecture Inspector
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Live Materialized View, Bidirectional Triggers & RLS Verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 dark:border-zinc-800 px-5 pt-3 gap-2 bg-slate-50/30 dark:bg-zinc-900/20 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('topology')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'topology'
                ? 'border-violet-600 text-violet-600 dark:text-pink-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Live Edges & Materialized Friendships</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-violet-600 text-violet-600 dark:text-pink-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>SQL Schema (schema.sql)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('triggers')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'triggers'
                ? 'border-violet-600 text-violet-600 dark:text-pink-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Real-Time Event Triggers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rls')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'rls'
                ? 'border-violet-600 text-violet-600 dark:text-pink-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Row-Level Security (RLS)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'topology' && (
            <div className="space-y-6">
              {/* Materialized Mutual Friendships View */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Materialized View: `friendships_materialized` ({mutualPairs.length} Symmetric Pairs)</span>
                  </h3>
                  <span className="text-[11px] font-mono-num text-slate-400">
                    O(1) Indexed Lookups
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-mono-num text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">User A</th>
                        <th className="py-2.5 px-4 font-semibold">Status</th>
                        <th className="py-2.5 px-4 font-semibold">User B</th>
                        <th className="py-2.5 px-4 font-semibold">Mutual Since</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Edge Direction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono-num">
                      {mutualPairs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            No mutual friendships active. Reciprocate a follow to populate.
                          </td>
                        </tr>
                      ) : (
                        mutualPairs.map((pair, idx) => (
                          <tr key={idx} className="hover:bg-violet-50/40 dark:hover:bg-violet-950/20 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                              <img src={pair.userA?.avatarUrl} className="w-6 h-6 rounded-full object-cover" />
                              <span>@{pair.userA?.username}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-gradient-to-r from-violet-500/15 to-pink-500/15 text-pink-600 dark:text-pink-300 border border-pink-500/30 font-bold">
                                BIDIRECTIONAL ✨
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-zinc-100">
                              <div className="flex items-center gap-2">
                                <img src={pair.userB?.avatarUrl} className="w-6 h-6 rounded-full object-cover" />
                                <span>@{pair.userB?.username}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">
                              {new Date(pair.mutualSince).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                              (A ⇄ B)
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Raw Directed Relationships Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Directed Graph Edges: `relationships` ({relationships.length} Directional Rows)
                  </h3>
                  <span className="text-[11px] font-mono-num text-slate-400">
                    Primary Key: (follower_id, following_id)
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono-num">
                    <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 text-[11px] sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">follower_id</th>
                        <th className="py-2.5 px-4 font-semibold">Action</th>
                        <th className="py-2.5 px-4 font-semibold">following_id</th>
                        <th className="py-2.5 px-4 font-semibold text-right">created_at</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {relationships.map((r, i) => {
                        const follower = graphEngine.getUserById(r.followerId);
                        const following = graphEngine.getUserById(r.followingId);
                        const isBidirectional = graphEngine.isMutual(r.followerId, r.followingId);

                        return (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                            <td className="py-2 px-4 font-semibold text-slate-800 dark:text-zinc-200">
                              @{follower?.username}
                            </td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                isBidirectional
                                  ? 'bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold'
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600'
                              }`}>
                                {isBidirectional ? '⇄ MUTUAL' : '→ FOLLOWS'}
                              </span>
                            </td>
                            <td className="py-2 px-4 font-semibold text-slate-800 dark:text-zinc-200">
                              @{following?.username}
                            </td>
                            <td className="py-2 px-4 text-right text-slate-400 text-[11px]">
                              {new Date(r.createdAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                PostgreSQL schema implementing the asymmetrical-to-symmetrical relationship graph engine with sub-millisecond materialized view lookups:
              </p>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`-- 1. Directed Graph Edges Table
CREATE TABLE relationships (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT prevent_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX idx_relationships_follower_id ON relationships(follower_id);
CREATE INDEX idx_relationships_following_id ON relationships(following_id);
CREATE INDEX idx_relationships_composite_reverse ON relationships(following_id, follower_id);

-- 2. Materialized View for Sub-Millisecond Mutual Lookups
CREATE MATERIALIZED VIEW IF NOT EXISTS friendships_materialized AS
SELECT 
    LEAST(r1.follower_id, r1.following_id) AS user_low_id,
    GREATEST(r1.follower_id, r1.following_id) AS user_high_id,
    GREATEST(r1.created_at, r2.created_at) AS mutual_since
FROM relationships r1
INNER JOIN relationships r2
    ON r1.follower_id = r2.following_id 
   AND r1.following_id = r2.follower_id
WHERE r1.follower_id < r1.following_id
WITH DATA;

CREATE UNIQUE INDEX idx_friendships_mat_pair 
    ON friendships_materialized(user_low_id, user_high_id);`}
              </pre>
            </div>
          )}

          {activeTab === 'triggers' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                Database trigger evaluating inverse edge presence on every relationship insert. Automatically dispatches <code className="text-pink-500 font-mono">relationship.mutual_unlocked</code> event via WebSocket:
              </p>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`CREATE OR REPLACE FUNCTION handle_relationship_insert()
RETURNS TRIGGER AS $$
DECLARE
    inverse_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM relationships
        WHERE follower_id = NEW.following_id
          AND following_id = NEW.follower_id
    ) INTO inverse_exists;

    IF inverse_exists THEN
        -- Broadcast WebSocket Realtime Event to both clients
        PERFORM pg_notify(
            'relationship_events',
            json_build_object(
                'event', 'relationship.mutual_unlocked',
                'user_a_id', NEW.follower_id,
                'user_b_id', NEW.following_id,
                'mutual_since', now()
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`}
              </pre>
            </div>
          )}

          {activeTab === 'rls' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                Row-Level Security (RLS) policies guaranteeing that mutual-only posts and intimate profile data are inaccessible unless a bidirectional edge exists in the friendship graph:
              </p>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`-- Mutual-Only Posts Policy
CREATE POLICY "Mutual-only posts are viewable strictly by mutual friends"
    ON posts FOR SELECT
    USING (
        author_id = auth.uid() OR
        (
            audience = 'mutuals' AND
            EXISTS (
                SELECT 1 FROM friendships
                WHERE user_a_id = auth.uid()
                  AND user_b_id = posts.author_id
            )
        )
    );

-- Direct Messages Mutual Policy
CREATE POLICY "Mutual friends can send direct messages"
    ON direct_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM friendships
            WHERE (user_a_id = sender_id AND user_b_id = receiver_id)
        )
    );`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
