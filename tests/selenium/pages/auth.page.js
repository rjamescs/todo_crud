import {
  BASE_URL,
  TIMEOUT,
  testId,
  waitVisible,
  fill,
  click,
} from '../helpers.js';

/**
 * Page object for the login / register screen (AuthScreen.jsx). Selenium port of
 * tests/pages/auth.page.js. The get*() methods return By locators (Selenium has
 * no lazy auto-waiting Locator type), and the helper methods wrap the explicit
 * waits.
 */
export class AuthPage {
  constructor(driver) {
    this.driver = driver;
  }

  async goto() {
    await this.driver.get(BASE_URL);
    await waitVisible(this.driver, this.getHeader());
  }

  getHeader() {
    return testId('authHeader');
  }

  getUsernameInput() {
    return testId('usernameInput');
  }

  getPasswordInput() {
    return testId('passwordInput');
  }

  getSubmitButton() {
    return testId('authSubmit');
  }

  getToggle() {
    return testId('authToggle');
  }

  getError() {
    return testId('authError');
  }

  /**
   * Ensure the form is in the given mode ('login' | 'register'). The submit
   * button text reflects the current mode, so we only click the toggle if we're
   * not already there. We first wait for a stable mode label because the button
   * briefly reads "Please wait…" while a submit is in flight.
   */
  async ensureMode(mode) {
    const expected = mode === 'register' ? 'Register' : 'Log in';
    const submit = this.getSubmitButton();

    // Wait for a stable mode label (not "Please wait…").
    await this.driver.wait(async () => {
      const text = (await this.driver.findElement(submit).getText()).trim();
      return text === 'Log in' || text === 'Register';
    }, TIMEOUT, 'auth submit button never settled on a stable label');

    const current = (await this.driver.findElement(submit).getText()).trim();
    if (current !== expected) {
      await this.driver.findElement(this.getToggle()).click();
    }

    // Confirm the switch took effect so callers never race the re-render.
    await this.driver.wait(async () => {
      return (await this.driver.findElement(submit).getText()).trim() === expected;
    }, TIMEOUT, `auth form never switched to "${expected}" mode`);
  }

  async register(username, password) {
    await this.ensureMode('register');
    await fill(this.driver, this.getUsernameInput(), username);
    await fill(this.driver, this.getPasswordInput(), password);
    await click(this.driver, this.getSubmitButton());
  }

  async login(username, password) {
    await this.ensureMode('login');
    await fill(this.driver, this.getUsernameInput(), username);
    await fill(this.driver, this.getPasswordInput(), password);
    await click(this.driver, this.getSubmitButton());
  }
}
