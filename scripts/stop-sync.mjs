/**
 * Stop Live Sync Daemon
 * Run: node scripts/stop-sync.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PID_FILE = path.join(ROOT_DIR, '.live-sync.pid');
const STATE_FILE = path.join(ROOT_DIR, '.live-sync-state.json');

if (!fs.existsSync(PID_FILE)) {
  console.log('ℹ️ [LIVE-SYNC] No active watcher PID file found. Watcher is not running.');
  process.exit(0);
}

const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);

console.log(`🛑 [LIVE-SYNC] Stopping watcher process (PID: ${pid})...`);

try {
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    } catch (e) {
      // Process may already be dead
    }
  } else {
    process.kill(pid, 'SIGTERM');
  }
  console.log(`✅ [LIVE-SYNC] Watcher stopped successfully.`);
} catch (err) {
  console.log(`ℹ️ [LIVE-SYNC] Process ${pid} was already terminated.`);
}

try { if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE); } catch (e) {}

try {
  if (fs.existsSync(STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    state.status = 'stopped';
    state.stoppedAt = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  }
} catch (e) {}
