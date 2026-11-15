import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { createDatabase } from '../db.ts';
import { seedDatabase } from '../seed.ts';
import { TtlStoryArchiver } from '../services/ttlArchiver.ts';
import { buildApp } from '../app.ts';

function setupTestContext() {
  const db = createDatabase(':memory:');
  seedDatabase(db);
  const tmpUploads = fs.mkdtempSync(path.join(os.tmpdir(), 'lumen-uploads-'));
  return { db, tmpUploads };
}

test('Close Friends visibility strictly enforces relationships.is_close_friend graph', async () => {
  const { db, tmpUploads } = setupTestContext();
  const { app } = await buildApp({ db, uploadsDir: tmpUploads });

  // Alex IS in Maya's close friends -> sees post-4 (close_friends) & story-maya-3
  const alexFeedRes = await app.inject({
    method: 'GET',
    url: '/api/feed?lens=close_friends&limit=20',
    headers: { 'x-user-id': 'user-alex' },
  });
  assert.equal(alexFeedRes.statusCode, 200);
  const alexFeed = alexFeedRes.json();
  assert.ok(alexFeed.items.some((p: { id: string }) => p.id === 'post-4'));

  // Kai is NOT in Maya's close friends -> MUST NOT see post-4 or story-maya-3
  const kaiFeedRes = await app.inject({
    method: 'GET',
    url: '/api/feed?lens=for_you&limit=30',
    headers: { 'x-user-id': 'user-kai' },
  });
  const kaiFeed = kaiFeedRes.json();
  assert.equal(kaiFeed.items.some((p: { id: string }) => p.id === 'post-4'), false);

  const kaiStoriesRes = await app.inject({
    method: 'GET',
    url: '/api/stories',
    headers: { 'x-user-id': 'user-kai' },
  });
  const kaiStories = kaiStoriesRes.json();
  const mayaGroup = kaiStories.groups.find(
    (g: { author: { id: string } }) => g.author.id === 'user-maya'
  );
  assert.ok(mayaGroup);
  assert.equal(
    mayaGroup.slides.some((s: { id: string }) => s.id === 'story-maya-3'),
    false
  );

  await app.close();
});

test('Mutuals-only reply policy blocks non-mutual replies and enforces max 3 pinned comments', async () => {
  const { db, tmpUploads } = setupTestContext();
  const { app } = await buildApp({ db, uploadsDir: tmpUploads });

  // post-6 by Elena has reply_policy = 'mutuals'. Kai is NOT mutual with Elena -> 403
  const blockedRes = await app.inject({
    method: 'POST',
    url: '/api/posts/post-6/comments',
    headers: { 'x-user-id': 'user-kai' },
    payload: { content: 'Trying to comment as non-mutual' },
  });
  assert.equal(blockedRes.statusCode, 403);

  // Alex IS mutual with Elena -> 201
  const allowedRes = await app.inject({
    method: 'POST',
    url: '/api/posts/post-6/comments',
    headers: { 'x-user-id': 'user-alex' },
    payload: { content: 'Incredible light angle!' },
  });
  assert.equal(allowedRes.statusCode, 201);

  // Add 3 more comments on post-2 and verify 4th pin fails with 400
  const ids: string[] = [];
  for (let i = 0; i < 3; i++) {
    const r = await app.inject({
      method: 'POST',
      url: '/api/posts/post-2/comments',
      headers: { 'x-user-id': 'user-maya' },
      payload: { content: `Pin test comment ${i}` },
    });
    ids.push(r.json().id);
  }
  // cmt-4 is already pinned on post-2 (1), pin 2 more -> total 3, 4th should 400
  const pin1 = await app.inject({
    method: 'PATCH',
    url: `/api/comments/${ids[0]}/pin`,
    headers: { 'x-user-id': 'user-alex' },
  });
  assert.equal(pin1.statusCode, 200);
  const pin2 = await app.inject({
    method: 'PATCH',
    url: `/api/comments/${ids[1]}/pin`,
    headers: { 'x-user-id': 'user-alex' },
  });
  assert.equal(pin2.statusCode, 200);
  const pin3Exceeds = await app.inject({
    method: 'PATCH',
    url: `/api/comments/${ids[2]}/pin`,
    headers: { 'x-user-id': 'user-alex' },
  });
  assert.equal(pin3Exceeds.statusCode, 400);

  await app.close();
});

test('Story-to-DM bridge creates persistent story snapshot and survives TTL archive sweep', async () => {
  const { db, tmpUploads } = setupTestContext();
  const { app } = await buildApp({ db, uploadsDir: tmpUploads });

  const replyRes = await app.inject({
    method: 'POST',
    url: '/api/stories/story-maya-1/reply',
    headers: { 'x-user-id': 'user-alex' },
    payload: { reaction_emoji: '🔥', content: 'Pour-over looks dialed!' },
  });
  assert.equal(replyRes.statusCode, 201);
  const { conversation_id, message } = replyRes.json();
  assert.equal(message.story_snapshot.story_id, 'story-maya-1');

  // Force expire story-maya-1 and run TTL archiver
  db.prepare(`UPDATE stories SET expires_at = ? WHERE id = ?`).run(
    new Date(Date.now() - 60_000).toISOString(),
    'story-maya-1'
  );
  const archiver = new TtlStoryArchiver(db);
  const archivedCount = archiver.runSweep();
  assert.equal(archivedCount, 1);

  // Story still persists as a snapshot inside the DM stream marked expired=true
  const msgsRes = await app.inject({
    method: 'GET',
    url: `/api/conversations/${conversation_id}/messages`,
    headers: { 'x-user-id': 'user-alex' },
  });
  assert.equal(msgsRes.statusCode, 200);
  const found = msgsRes
    .json()
    .items.find((m: { id: string }) => m.id === message.id);
  assert.ok(found);
  assert.equal(found.story_snapshot.expired, true);

  await app.close();
});

test('Idempotent message send deduplicates client_msg_id and cursor feed paginates cleanly', async () => {
  const { db, tmpUploads } = setupTestContext();
  const { app } = await buildApp({ db, uploadsDir: tmpUploads });

  const clientMsgId = '99999999-9999-4999-8999-999999999999';
  const r1 = await app.inject({
    method: 'POST',
    url: '/api/conversations/conv-maya/messages',
    headers: { 'x-user-id': 'user-alex' },
    payload: { client_msg_id: clientMsgId, content: 'Idempotent ping' },
  });
  const r2 = await app.inject({
    method: 'POST',
    url: '/api/conversations/conv-maya/messages',
    headers: { 'x-user-id': 'user-alex' },
    payload: { client_msg_id: clientMsgId, content: 'Idempotent ping' },
  });
  assert.equal(r1.json().id, r2.json().id);

  // Cursor feed pagination with limit=3
  const p1 = await app.inject({
    method: 'GET',
    url: '/api/feed?lens=following&limit=3',
    headers: { 'x-user-id': 'user-alex' },
  });
  const page1 = p1.json();
  assert.equal(page1.items.length, 3);
  assert.ok(page1.nextCursor);

  const p2 = await app.inject({
    method: 'GET',
    url: `/api/feed?lens=following&limit=3&cursor=${page1.nextCursor}`,
    headers: { 'x-user-id': 'user-alex' },
  });
  const page2 = p2.json();
  assert.ok(page2.items.length > 0);
  const page1Ids = new Set(page1.items.map((x: { id: string }) => x.id));
  for (const item of page2.items) {
    assert.equal(page1Ids.has(item.id), false);
  }

  await app.close();
});

test('Co-authored posts appear on both creators profiles and read-receipt privacy is respected', async () => {
  const { db, tmpUploads } = setupTestContext();
  const { app } = await buildApp({ db, uploadsDir: tmpUploads });

  // post-1 is authored by user-maya and co-authored by user-elena
  const elenaProfileRes = await app.inject({
    method: 'GET',
    url: '/api/profiles/elena_rostova',
    headers: { 'x-user-id': 'user-alex' },
  });
  assert.equal(elenaProfileRes.statusCode, 200);
  const elenaStudio = elenaProfileRes.json();
  assert.ok(elenaStudio.posts.some((p: { id: string }) => p.id === 'post-1'));

  // Disable read receipts for Alex, then mark conv-elena read -> should NOT set read_at
  await app.inject({
    method: 'PATCH',
    url: '/api/me',
    headers: { 'x-user-id': 'user-alex' },
    payload: { read_receipts_enabled: false },
  });
  const readRes = await app.inject({
    method: 'POST',
    url: '/api/conversations/conv-elena/read',
    headers: { 'x-user-id': 'user-alex' },
  });
  assert.equal(readRes.json().read_receipt_sent, false);

  const elenaMsgs = await app.inject({
    method: 'GET',
    url: '/api/conversations/conv-elena/messages',
    headers: { 'x-user-id': 'user-alex' },
  });
  const msg6 = elenaMsgs.json().items.find((m: { id: string }) => m.id === 'msg-6');
  assert.equal(msg6.read_at, null);

  await app.close();
});

test('Media upload stores object on disk and serves it at /uploads/:filename', async () => {
  const { db, tmpUploads } = setupTestContext();
  const { app } = await buildApp({ db, uploadsDir: tmpUploads });

  const sampleSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>').toString('base64');
  const uploadRes = await app.inject({
    method: 'POST',
    url: '/api/media/upload',
    headers: { 'x-user-id': 'user-alex' },
    payload: {
      dataUrl: `data:image/svg+xml;base64,${sampleSvg}`,
      filename: 'test.svg',
    },
  });
  assert.equal(uploadRes.statusCode, 201);
  const { url } = uploadRes.json();
  assert.ok(url.startsWith('/uploads/'));

  const getRes = await app.inject({
    method: 'GET',
    url,
  });
  assert.equal(getRes.statusCode, 200);
  assert.match(getRes.headers['content-type'] as string, /image\/svg\+xml/);

  await app.close();
});

