import { startServerIfNeeded, stopServer } from './server.js';

// Mocha root hooks: bring up the Vite dev server once for the whole run and
// tear it down at the end. Loaded via --require in .mocharc.json.
export const mochaHooks = {
  async beforeAll() {
    this.timeout(140000);
    await startServerIfNeeded();
  },
  async afterAll() {
    this.timeout(30000);
    await stopServer();
  },
};
