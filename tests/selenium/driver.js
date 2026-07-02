import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';

/**
 * Build a fresh WebDriver. A brand-new session starts with empty localStorage,
 * giving us the same clean slate Playwright gets from a fresh browser context
 * per test.
 *
 * Env knobs:
 *   BROWSER  = chrome (default) | firefox
 *   HEADLESS = anything but "false" runs headless (default headless)
 *
 * Selenium Manager (bundled with selenium-webdriver >= 4.6) downloads the
 * matching driver binary automatically, so no separate chromedriver install
 * is required.
 */
export async function buildDriver() {
  const browser = process.env.BROWSER || 'chrome';
  const headless = process.env.HEADLESS !== 'false';
  const builder = new Builder().forBrowser(browser);

  if (browser === 'chrome') {
    const options = new chrome.Options();
    if (headless) options.addArguments('--headless=new');
    options.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280,900',
    );
    builder.setChromeOptions(options);
  } else if (browser === 'firefox') {
    const options = new firefox.Options();
    if (headless) options.addArguments('-headless');
    options.windowSize({ width: 1280, height: 900 });
    builder.setFirefoxOptions(options);
  }

  return builder.build();
}
