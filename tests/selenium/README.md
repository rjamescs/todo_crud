# Selenium test suite

A Selenium (WebDriver + Mocha) port of the Playwright suite in `tests/`. It
covers the same scenarios with the same page-object structure:

| Playwright (`tests/`)   | Selenium (`tests/selenium/`) |
| ----------------------- | ---------------------------- |
| `auth.spec.js`          | `auth.test.js`               |
| `todo.spec.js`          | `todo.test.js`               |
| `pages/auth.page.js`    | `pages/auth.page.js`         |
| `pages/todo.page.js`    | `pages/todo.page.js`         |

Extra files exist because Selenium has no built-in assertion auto-waiting or dev
server management, which Playwright provides out of the box:

- `helpers.js` — explicit `WebDriverWait`-based equivalents of Playwright's
  auto-waiting expectations (`toBeVisible`, `toContainText`, `toHaveCount`, …).
- `driver.js` — builds a fresh browser session per test (the analogue of a fresh
  Playwright browser context).
- `server.js` + `mocha.setup.js` — start/stop the Vite dev server for the run,
  reusing one if already running (analogue of Playwright's `webServer`).

## Running

```bash
npm install          # installs mocha + selenium-webdriver
npm run test:selenium
```

Selenium Manager (bundled with `selenium-webdriver`) downloads the matching
browser driver automatically — no separate chromedriver install needed. Chrome
must be installed locally.

## Configuration (environment variables)

- `BROWSER` — `chrome` (default) or `firefox`.
- `HEADLESS` — headless by default; set `HEADLESS=false` to watch the browser.
- `BASE_URL` — point at an already-running server (e.g.
  `http://localhost:5173/`). When set, the suite does **not** start/stop its own
  dev server.

Examples:

```bash
HEADLESS=false npm run test:selenium          # watch it run in Chrome
BROWSER=firefox npm run test:selenium         # run in Firefox
BASE_URL=http://localhost:5173/ npm run test:selenium   # reuse a running server
```
