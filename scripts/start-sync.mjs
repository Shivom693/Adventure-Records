/**
 * Start Live Sync Daemon in Background
 * Run: npm run sync:start or node scripts/start-sync.mjs
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PID_FILE = path.join(ROOT_DIR, '.live-sync.pid');
const LOG_FILE = path.join(ROOT_DIR, '.live-sync.log');
const SCRIPT_PATH = path.join(__dirname, 'auto-sync-watcher.mjs');

// Check if already running
if (fs.existsSync(PID_FILE)) {
  const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
  try {
    process.kill(pid, 0); // Check if process exists
    console.log(`⚡ [LIVE-SYNC] Watcher is ALREADY RUNNING (PID: ${pid}).`);
    console.log(`⚡ View status with: npm run sync:status`);
    console.log(`⚡ To stop it, run: npm run sync:stop`);
    process.exit(0);
  } catch (e) {
    try { fs.unlinkSync(PID_FILE); } catch (_) {}
  }
}

console.log('🚀 [LIVE-SYNC] Starting automatic live deployment watcher in background...');

const out = fs.openSync(LOG_FILE, 'a');
const err = fs.openSync(LOG_FILE, 'a');

const child = spawn(process.execPath, [SCRIPT_PATH], {
  cwd: ROOT_DIR,
  detached: true,
  stdio: ['ignore', out, err]
});

child.unref();

console.log(`✅ [LIVE-SYNC] Watcher started.`);
console.log(`⚡ Every saved file in Antigravity will now automatically build & deploy to https://music-b2696.web.app!`);
console.log(`⚡ Check live status: npm run sync:status`);
console.log(`⚡ Stop watcher: npm run sync:stop`);
