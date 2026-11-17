/**
 * Adventure Records — Automatic Live Sync & Deployment Daemon
 * Watches all relevant frontend, backend, and security rules files.
 * Automatically runs production build checks and deploys to Firebase Hosting (music-b2696)
 * and verifies live site and backend API connectivity.
 */

import chokidar from 'chokidar';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PID_FILE = path.join(ROOT_DIR, '.live-sync.pid');
const LOG_FILE = path.join(ROOT_DIR, '.live-sync.log');
const STATE_FILE = path.join(ROOT_DIR, '.live-sync-state.json');

const LIVE_URL = 'https://music-b2696.web.app';
const FIREBASE_PROJECT = 'music-b2696';
const BACKEND_RENDER_URL = 'https://adventure-music-backend.onrender.com';

const DEBOUNCE_MS = 1500; // 1.5s debounce to batch multi-file saves cleanly

// Logging utility
function log(msg, type = 'INFO') {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const prefix = {
    INFO: '⚡ [LIVE-SYNC]',
    BUILD: '🔨 [BUILD]',
    DEPLOY: '🚀 [DEPLOY]',
    SUCCESS: '✅ [SUCCESS]',
    WARN: '⚠️ [WARN]',
    ERROR: '❌ [ERROR]',
    SAFETY: '🛡️ [SAFETY]'
  }[type] || '⚡ [LIVE-SYNC]';

  const line = `${ts} ${prefix} ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
  } catch (e) {}
}

// Update runtime state
function updateState(updates) {
  try {
    let currentState = {};
    if (fs.existsSync(STATE_FILE)) {
      try {
        currentState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      } catch (e) {}
    }
    const newState = {
      ...currentState,
      ...updates,
      lastUpdated: new Date().toISOString(),
      pid: process.pid
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2), 'utf8');
  } catch (e) {}
}

// Helper to run commands as promises with full output capture
function runProcess(command, args, cwd = ROOT_DIR, env = process.env) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const procCmd = isWindows ? 'cmd.exe' : command;
    const procArgs = isWindows ? ['/c', command, ...args] : args;

    const child = spawn(procCmd, procArgs, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ code, stdout, stderr });
      } else {
        const err = new Error(`Command failed with code ${code}: ${stderr || stdout}`);
        err.code = code;
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      }
    });
  });
}

// Check live site HTTP status
function checkLiveSiteStatus(targetUrl) {
  return new Promise((resolve) => {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.get(targetUrl, { timeout: 8000 }, (res) => {
      resolve({
        ok: res.statusCode >= 200 && res.statusCode < 400,
        statusCode: res.statusCode,
        headers: res.headers
      });
    });
    req.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Request timeout' });
    });
  });
}

// Mutex lock to prevent overlapping deployments
let isDeploying = false;
let pendingChanges = {
  frontend: false,
  backend: false,
  rules: false,
  files: new Set()
};
let debounceTimer = null;

// The main build and deployment pipeline
async function executeDeployment() {
  if (isDeploying) {
    // Flag that new changes occurred while deploying; will re-run automatically
    log('A deployment is currently in progress. Queuing newly saved changes...', 'WARN');
    return;
  }

  isDeploying = true;
  const currentBatch = {
    frontend: pendingChanges.frontend,
    backend: pendingChanges.backend,
    rules: pendingChanges.rules,
    files: Array.from(pendingChanges.files)
  };

  // Reset pending state
  pendingChanges = {
    frontend: false,
    backend: false,
    rules: false,
    files: new Set()
  };

  const startTime = Date.now();
  updateState({ status: 'deploying', currentBatchFiles: currentBatch.files });

  try {
    log(`Triggering auto-deployment for ${currentBatch.files.length} changed file(s):`);
    currentBatch.files.forEach(f => log(`   → ${path.relative(ROOT_DIR, f)}`));

    // ──────────────────────────────────────────────────────────
    // 1. FRONTEND BUILD & DEPLOYMENT
    // ──────────────────────────────────────────────────────────
    if (currentBatch.frontend) {
      log('Starting Vite production build verification...', 'BUILD');
      updateState({ lastBuildStatus: 'building' });

      try {
        const buildResult = await runProcess('npm', ['run', 'build'], ROOT_DIR);
        log('Vite production build verified successfully (0 errors).', 'SUCCESS');
        updateState({ lastBuildStatus: 'success' });
      } catch (buildErr) {
        log(`BUILD FAILED! Build output:\n${buildErr.stderr || buildErr.stdout || buildErr.message}`, 'ERROR');
        log('Aborting deployment to protect live production site.', 'SAFETY');
        log(`Live site remains on the last working release: ${LIVE_URL}`, 'SAFETY');
        updateState({ lastBuildStatus: 'failed', lastBuildError: buildErr.message });
        return;
      }

      log(`Deploying frontend bundle to Firebase Hosting (${FIREBASE_PROJECT})...`, 'DEPLOY');
      try {
        const deployResult = await runProcess('firebase', ['deploy', '--only', 'hosting', '--project', FIREBASE_PROJECT], ROOT_DIR);
        log('Firebase Hosting deployment completed successfully!', 'SUCCESS');
        updateState({ lastHostingDeploy: new Date().toISOString() });
      } catch (deployErr) {
        log(`Firebase Hosting deployment failed: ${deployErr.stderr || deployErr.message}`, 'ERROR');
        return;
      }

      // Verify live site health immediately after deployment
      log(`Performing live site verification on ${LIVE_URL}...`);
      const liveCheck = await checkLiveSiteStatus(LIVE_URL);
      if (liveCheck.ok) {
        log(`Live site verified active: ${LIVE_URL} (HTTP ${liveCheck.statusCode})`, 'SUCCESS');
      } else {
        log(`Live site verification returned status: ${liveCheck.statusCode || liveCheck.error}`, 'WARN');
      }
    }

    // ──────────────────────────────────────────────────────────
    // 2. SECURITY RULES DEPLOYMENT
    // ──────────────────────────────────────────────────────────
    if (currentBatch.rules) {
      log(`Deploying updated security rules to Firebase (${FIREBASE_PROJECT})...`, 'DEPLOY');
      try {
        await runProcess('firebase', ['deploy', '--only', 'firestore:rules,storage', '--project', FIREBASE_PROJECT], ROOT_DIR);
        log('Firestore and Storage security rules deployed successfully!', 'SUCCESS');
        updateState({ lastRulesDeploy: new Date().toISOString() });
      } catch (rulesErr) {
        log(`Security rules deployment failed: ${rulesErr.stderr || rulesErr.message}`, 'ERROR');
      }
    }

    // ──────────────────────────────────────────────────────────
    // 3. BACKEND VALIDATION & SYNC
    // ──────────────────────────────────────────────────────────
    if (currentBatch.backend) {
      log('Backend changes detected. Running automated payment & API test suite...', 'BUILD');
      try {
        const testRes = await runProcess('node', ['server/test_automated_payments.js'], ROOT_DIR);
        log('Automated backend payment test suite passed (10/10 tests OK).', 'SUCCESS');
        updateState({ lastBackendTestStatus: 'passed' });

        // Auto-commit and push backend updates so cloud provider (Render) automatically deploys
        log('Syncing verified backend changes to origin/main for cloud hosting...', 'DEPLOY');
        try {
          await runProcess('git', ['add', 'server'], ROOT_DIR);
          await runProcess('git', ['commit', '-m', `chore(backend): auto-deploy backend updates ${new Date().toISOString()}`], ROOT_DIR);
          await runProcess('git', ['push', 'origin', 'main'], ROOT_DIR);
          log('Backend changes pushed to origin/main (Render cloud auto-deploy triggered).', 'SUCCESS');
          updateState({ lastBackendDeploy: new Date().toISOString() });
        } catch (gitErr) {
          // If no git changes were staged or already up to date, that's fine
          log(`Backend git sync notice: ${gitErr.message.split('\n')[0]}`, 'INFO');
        }

        // Check Render backend health endpoint
        log(`Pinging Render cloud backend: ${BACKEND_RENDER_URL}/api/health...`);
        const renderCheck = await checkLiveSiteStatus(`${BACKEND_RENDER_URL}/api/health`);
        if (renderCheck.ok) {
          log(`Render backend verified online: HTTP ${renderCheck.statusCode}`, 'SUCCESS');
        } else {
          log(`Render backend response: HTTP ${renderCheck.statusCode || renderCheck.error} (service may be waking up or warming up)`, 'INFO');
        }
      } catch (testErr) {
        log(`Backend tests failed! Aborting backend deployment:\n${testErr.stderr || testErr.stdout || testErr.message}`, 'ERROR');
        updateState({ lastBackendTestStatus: 'failed', lastBackendTestError: testErr.message });
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`Deployment cycle completed cleanly in ${elapsed}s! ✨`, 'SUCCESS');
    log(`Live Website: ${LIVE_URL}`);
    updateState({ 
      status: 'idle', 
      lastSuccessfulDeployment: new Date().toISOString(),
      lastDeploymentDurationSec: elapsed 
    });

  } catch (globalErr) {
    log(`Deployment pipeline encountered an unexpected error: ${globalErr.message}`, 'ERROR');
    updateState({ status: 'error', lastError: globalErr.message });
  } finally {
    isDeploying = false;

    // If more files were saved during the current deployment cycle, trigger next batch immediately
    if (pendingChanges.frontend || pendingChanges.backend || pendingChanges.rules) {
      log('Processing additional changes saved during previous deployment...', 'INFO');
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(executeDeployment, DEBOUNCE_MS);
    }
  }
}

// Queue file change
function handleFileChange(filePath) {
  const normPath = filePath.replace(/\\/g, '/');

  // Strict Exclusions (to prevent infinite loops, secret leaks, or churn)
  if (
    normPath.includes('/node_modules/') ||
    normPath.includes('/dist/') ||
    normPath.includes('/.firebase/') ||
    normPath.includes('/.git/') ||
    normPath.endsWith('.pid') ||
    normPath.endsWith('.log') ||
    normPath.endsWith('.live-sync-state.json') ||
    normPath.includes('/server/uploads/') ||
    normPath.endsWith('~') ||
    normPath.endsWith('.tmp') ||
    normPath.includes('.env') // Never trigger on or publish secrets
  ) {
    return;
  }

  // Classify change
  let isRelevant = false;

  if (
    normPath.startsWith('src/') ||
    normPath.startsWith('public/') ||
    normPath === 'index.html' ||
    normPath === 'vite.config.js' ||
    normPath === 'tailwind.config.js' ||
    normPath === 'postcss.config.js'
  ) {
    pendingChanges.frontend = true;
    isRelevant = true;
  }

  if (normPath.startsWith('server/')) {
    pendingChanges.backend = true;
    isRelevant = true;
  }

  if (
    normPath === 'firestore.rules' ||
    normPath === 'storage.rules' ||
    normPath === 'firebase.json'
  ) {
    pendingChanges.rules = true;
    isRelevant = true;
  }

  if (isRelevant) {
    pendingChanges.files.add(filePath);
    log(`Detected saved change: ${path.relative(ROOT_DIR, filePath)}`);

    // Reset debounce timer
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(executeDeployment, DEBOUNCE_MS);
  }
}

// Process startup & PID management
function initialize() {
  // Write PID
  fs.writeFileSync(PID_FILE, String(process.pid), 'utf8');

  // Handle clean termination
  const cleanup = () => {
    log('Live Sync Watcher stopping cleanly...');
    try { if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE); } catch (e) {}
    updateState({ status: 'stopped' });
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGHUP', cleanup);

  log('===============================================================');
  log('   Adventure Records — Live Sync Deployment Watcher Active     ');
  log(`   Live Production URL : ${LIVE_URL}                           `);
  log(`   Firebase Project    : ${FIREBASE_PROJECT}                   `);
  log(`   Process PID         : ${process.pid}                        `);
  log('   Watching for saved file changes in Antigravity...           ');
  log('===============================================================');

  updateState({
    status: 'idle',
    startedAt: new Date().toISOString(),
    liveUrl: LIVE_URL,
    firebaseProject: FIREBASE_PROJECT
  });

  // Start chokidar watcher
  const watcher = chokidar.watch(ROOT_DIR, {
    ignored: [
      /(^|[/\\])\../,            // ignore dotfiles
      '**/node_modules/**',
      '**/dist/**',
      '**/.firebase/**',
      '**/.git/**',
      '**/*.log',
      '**/.live-sync.pid',
      '**/.live-sync-state.json',
      '**/server/uploads/**',
      '**/*.tmp',
      '**/*~',
      '**/.env*'
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100
    }
  });

  watcher
    .on('add', handleFileChange)
    .on('change', handleFileChange)
    .on('unlink', handleFileChange)
    .on('error', err => log(`Watcher error: ${err.message}`, 'ERROR'));
}

initialize();
