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
    const submitText = (await this.getSubmitButton().textContent())?.trim();
    const isRegister = submitText === 'Register';
    if (mode === 'register' && !isRegister) await this.getToggle().click();
    if (mode === 'login' && isRegister) await this.getToggle().click();
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
