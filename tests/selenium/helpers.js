import { By, until, Key } from 'selenium-webdriver';

/**
 * Shared Selenium helpers. Selenium (unlike Playwright) has no built-in
 * auto-waiting on assertions, so every "expect"-style check below is expressed
 * as an explicit WebDriverWait that polls until the condition holds (or times
 * out). The catch-and-return-false pattern also transparently survives the
 * StaleElementReferenceError you get when React re-renders an element between
 * polls.
 */

export const TIMEOUT = 15000;

/** Base URL of the app under test. Override with BASE_URL to point at an
 * already-running server (mirrors Playwright's reuseExistingServer). */
export const BASE_URL = process.env.BASE_URL || 'http://localhost:5173/';

/** Build a By locator for a `data-testid` — the Selenium equivalent of
 * Playwright's getByTestId(). */
export const testId = (id) => By.css(`[data-testid="${id}"]`);

/** Wait until an element matching `locator` exists and is displayed; return it.
 * Equivalent to expect(locator).toBeVisible(). */
export async function waitVisible(driver, locator, timeout = TIMEOUT) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

/** Wait until no element matching `locator` is displayed (either absent from the
 * DOM or present-but-hidden). Equivalent to expect(locator).toBeHidden(). */
export async function waitHidden(driver, locator, timeout = TIMEOUT) {
  await driver.wait(async () => {
    const els = await driver.findElements(locator);
    if (els.length === 0) return true;
    try {
      return !(await els[0].isDisplayed());
    } catch {
      // Element went stale/detached => effectively hidden.
      return true;
    }
  }, timeout, `Expected element ${locator} to be hidden`);
}

/** Wait until the element's visible text contains `substring`.
 * Equivalent to expect(locator).toContainText(substring). */
export async function waitTextContains(driver, locator, substring, timeout = TIMEOUT) {
  await driver.wait(async () => {
    try {
      const el = await driver.findElement(locator);
      return (await el.getText()).includes(substring);
    } catch {
      return false;
    }
  }, timeout, `Expected element ${locator} to contain text "${substring}"`);
}

/** Wait until the element's visible text equals `expected` exactly.
 * Equivalent to expect(locator).toHaveText(expected). */
export async function waitTextEquals(driver, locator, expected, timeout = TIMEOUT) {
  await driver.wait(async () => {
    try {
      const el = await driver.findElement(locator);
      return (await el.getText()).trim() === expected;
    } catch {
      return false;
    }
  }, timeout, `Expected element ${locator} to have text "${expected}"`);
}

/** Wait until an <input>'s value equals `expected`.
 * Equivalent to expect(locator).toHaveValue(expected). */
export async function waitValueEquals(driver, locator, expected, timeout = TIMEOUT) {
  await driver.wait(async () => {
    try {
      const el = await driver.findElement(locator);
      return (await el.getAttribute('value')) === expected;
    } catch {
      return false;
    }
  }, timeout, `Expected element ${locator} to have value "${expected}"`);
}

/** Wait until exactly `n` elements match `locator`.
 * Equivalent to expect(locator).toHaveCount(n). */
export async function waitCount(driver, locator, n, timeout = TIMEOUT) {
  await driver.wait(async () => {
    const els = await driver.findElements(locator);
    return els.length === n;
  }, timeout, `Expected ${n} element(s) matching ${locator}`);
}

/** Generic poll: wait until the async predicate returns truthy. Errors thrown
 * inside the predicate (e.g. stale elements) are treated as "not yet". */
export async function waitUntil(driver, predicate, message, timeout = TIMEOUT) {
  await driver.wait(async () => {
    try {
      return await predicate();
    } catch {
      return false;
    }
  }, timeout, message);
}

/** Clear and type into an input. An empty string just clears it — mirroring
 * Playwright's fill(''). */
export async function fill(driver, locator, value) {
  const el = await waitVisible(driver, locator);
  await el.clear();
  if (value) await el.sendKeys(value);
  return el;
}

/** Click an element once it is visible. */
export async function click(driver, locator) {
  const el = await waitVisible(driver, locator);
  await el.click();
  return el;
}

/** Press Enter inside an input. */
export async function pressEnter(driver, locator) {
  const el = await waitVisible(driver, locator);
  await el.sendKeys(Key.ENTER);
}
