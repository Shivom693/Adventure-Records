/**
 * Status Check for Live Sync Daemon
 * Run: node scripts/status-sync.mjs
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PID_FILE = path.join(ROOT_DIR, '.live-sync.pid');
const STATE_FILE = path.join(ROOT_DIR, '.live-sync-state.json');
const LOG_FILE = path.join(ROOT_DIR, '.live-sync.log');

console.log('===============================================================');
console.log('         Adventure Records — Live Sync Status Check            ');
console.log('===============================================================');

let isRunning = false;
let pid = null;

if (fs.existsSync(PID_FILE)) {
  pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
  try {
    process.kill(pid, 0);
    isRunning = true;
  } catch (e) {
    isRunning = false;
  }
}

console.log(`Watcher Status       : ${isRunning ? '🟢 RUNNING (PID: ' + pid + ')' : '🔴 STOPPED'}`);

if (fs.existsSync(STATE_FILE)) {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    console.log(`Live Production URL  : ${state.liveUrl || 'https://music-b2696.web.app'}`);
    console.log(`Firebase Project     : ${state.firebaseProject || 'music-b2696'}`);
    console.log(`Current State        : ${state.status || 'unknown'}`);
    console.log(`Started At           : ${state.startedAt || 'N/A'}`);
    console.log(`Last Build Result    : ${state.lastBuildStatus || 'N/A'}`);
    console.log(`Last Hosting Deploy  : ${state.lastHostingDeploy || 'N/A'}`);
    console.log(`Last Deployment Time : ${state.lastSuccessfulDeployment || 'N/A'} (${state.lastDeploymentDurationSec || 0}s)`);
    if (state.lastError) {
      console.log(`Last Error           : ⚠️ ${state.lastError}`);
    }
  } catch (e) {}
}

// Check live website response
const req = https.get('https://music-b2696.web.app', { timeout: 5000 }, (res) => {
  console.log(`Live Website Response: 🌐 HTTP ${res.statusCode} OK (https://music-b2696.web.app)`);
  printRecentLogs();
});

req.on('error', (err) => {
  console.log(`Live Website Response: ⚠️ Error reaching site: ${err.message}`);
  printRecentLogs();
});

function printRecentLogs() {
  if (fs.existsSync(LOG_FILE)) {
    console.log('\n--- Recent Deployment Logs (Last 8 lines) ---');
    try {
      const lines = fs.readFileSync(LOG_FILE, 'utf8').trim().split('\n');
      lines.slice(-8).forEach(l => console.log('   ' + l));
    } catch (e) {}
  }
  console.log('===============================================================');
}
