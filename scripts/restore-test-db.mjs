import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { DatabaseSync, backup } from 'node:sqlite';

// Run only after stopping the application. Restores the tracked test snapshot,
// leaving a consistent backup of an existing local database before replacement.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'data/snapshots/osp-autocare.sqlite');
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'data/snapshots/osp-autocare.json'), 'utf8'));
const target = path.resolve(root, process.env.DATABASE_PATH || 'runtime/osp-autocare.sqlite');
if (!process.argv.includes('--app-stopped')) {
  throw Error('Stop osp-autocare first, then run this command with --app-stopped.');
}
if (source === target) throw Error('The runtime database must differ from the tracked snapshot.');
const checksum = createHash('sha256').update(fs.readFileSync(source)).digest('hex');
if (checksum !== metadata.sha256) throw Error('Snapshot checksum does not match its metadata.');
const incoming = new DatabaseSync(source, { readOnly: true });
const valid = db => db.prepare('PRAGMA integrity_check').all().every(row => row.integrity_check === 'ok');
if (!valid(incoming)) throw Error('Snapshot integrity check failed.');
fs.mkdirSync(path.dirname(target), { recursive: true });
const temp = `${target}.restore-${process.pid}`;
try {
  if (fs.existsSync(target)) {
    const existing = new DatabaseSync(target);
    try {
      const state = existing.prepare('PRAGMA wal_checkpoint(TRUNCATE)').get();
      if (state.busy) throw Error('Database is busy. Stop the application before restoring.');
      if (!valid(existing)) throw Error('Existing database is damaged; preserve it and investigate before restoring.');
      const dir = path.join(path.dirname(target), 'backups');
      fs.mkdirSync(dir, { recursive: true });
      const saved = path.join(dir, `before-restore-${new Date().toISOString().replaceAll(':', '-')}-${process.pid}.sqlite`);
      await backup(existing, saved);
      console.log(`Previous database backed up: ${saved}`);
    } finally { existing.close(); }
    for (const suffix of ['-wal', '-shm']) {
      if (fs.existsSync(target + suffix)) throw Error('Database sidecar still exists; check for another running SQLite process.');
    }
  }
  await backup(incoming, temp);
  fs.renameSync(temp, target);
  console.log(`Test database restored: ${target}`);
  console.log('API/payment keys and active sessions are not included. Configure keys separately.');
} finally {
  incoming.close();
  if (fs.existsSync(temp)) fs.unlinkSync(temp);
}
