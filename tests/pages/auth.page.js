import { expect } from '@playwright/test';

/** @typedef {import('@playwright/test').Locator} Locator */

/** Page object for the login / register screen (AuthScreen.jsx). */
export class AuthPage {
  page;
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.getHeader()).toBeVisible();
  }

  /** @returns {Locator} */
  getHeader() {
    return this.page.getByTestId('authHeader');
  }

  /** @returns {Locator} */
  getUsernameInput() {
    return this.page.getByTestId('usernameInput');
  }

  /** @returns {Locator} */
  getPasswordInput() {
    return this.page.getByTestId('passwordInput');
  }

  /** @returns {Locator} */
  getSubmitButton() {
    return this.page.getByTestId('authSubmit');
  }

  /** @returns {Locator} */
  getToggle() {
    return this.page.getByTestId('authToggle');
  }

  /** @returns {Locator} */
  getError() {
    return this.page.getByTestId('authError');
  }

  /**
   * Ensure the form is in the given mode ('login' | 'register'). The submit
   * button text reflects the current mode, so we only click the toggle if
   * we're not already there.
   */
  async ensureMode(mode) {
    const expected = mode === 'register' ? 'Register' : 'Log in';
    const submit = this.getSubmitButton();
    // Wait for a stable mode label first — the button briefly reads
    // "Please wait…" while a submit is in flight, which would otherwise cause
    // a one-shot textContent() read to mis-detect the current mode.
    await expect(submit).toHaveText(/^(Log in|Register)$/);
    if ((await submit.textContent())?.trim() !== expected) {
      await this.getToggle().click();
    }
    // Confirm the switch took effect (auto-waits) so callers never race the
    // re-render before filling the form.
    await expect(submit).toHaveText(expected);
  }

  async register(username, password) {
    await this.ensureMode('register');
    await this.getUsernameInput().fill(username);
    await this.getPasswordInput().fill(password);
    await this.getSubmitButton().click();
  }

  async login(username, password) {
    await this.ensureMode('login');
    await this.getUsernameInput().fill(username);
    await this.getPasswordInput().fill(password);
    await this.getSubmitButton().click();
  }
}
