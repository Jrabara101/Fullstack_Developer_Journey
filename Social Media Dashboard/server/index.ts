import { db } from './db.ts';
import { seedDatabase } from './seed.ts';
import { TtlStoryArchiver } from './services/ttlArchiver.ts';
import { buildApp } from './app.ts';

seedDatabase(db);

const archiver = new TtlStoryArchiver(db);
archiver.start(60_000);

const { app } = await buildApp({ db, logger: false });

const PORT = Number(process.env.PORT || 3001);
try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[Lumen Server] Listening on http://localhost:${PORT} (SQLite + WebSockets ready)`);
} catch (err) {
  console.error(err);
  process.exit(1);
}

