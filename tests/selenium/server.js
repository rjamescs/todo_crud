import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE_URL } from './helpers.js';

// Mirrors Playwright's `webServer`: start `npm run dev` before the suite and
// reuse an already-running server if one is reachable. Set BASE_URL to skip
// this entirely and point the tests at an external server.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..', '..'); // tests/selenium -> todo-app

let proc = null;

function reachable(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await reachable(url)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

export async function startServerIfNeeded() {
  // Explicit external server — don't manage one.
  if (process.env.BASE_URL) return;

  // Reuse an existing dev server (mirrors reuseExistingServer).
  if (await reachable(BASE_URL)) return;

  // shell:true is required to launch npm (npm.cmd) on Windows. Passing the whole
  // command as a single string (rather than an args array) avoids the DEP0190
  // deprecation warning that fires when args are combined with shell:true.
  proc = spawn('npm run dev', {
    cwd: appRoot,
    stdio: 'ignore',
    shell: true,
  });

  const ok = await waitForServer(BASE_URL, 135 * 1000);
  if (!ok) {
    await stopServer();
    throw new Error(`Dev server did not become reachable at ${BASE_URL} in time`);
  }
}

export async function stopServer() {
  if (!proc) return;
  const pid = proc.pid;
  proc = null;
  if (process.platform === 'win32') {
    // Kill the whole npm -> vite process tree.
    spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  }
}
