import {
  BASE_URL,
  testId,
  waitVisible,
  fill,
  click,
} from '../helpers.js';

/**
 * A single todo row. Because React re-renders rows on every mutation, we never
 * cache WebElements — each accessor re-queries the nth `todoItem` and then
 * scopes the lookup to that row's descendants. This is the Selenium equivalent
 * of Playwright's `getByTestId('todoItem').nth(i).getByTestId(...)`.
 */
class TodoItem {
  constructor(driver, position) {
    this.driver = driver;
    this.position = position; // 1-based, matching the Playwright page object
  }

  async _root() {
    const items = await this.driver.findElements(testId('todoItem'));
    const el = items[this.position - 1];
    if (!el) throw new Error(`No todo item at position ${this.position}`);
    return el;
  }

  async _sub(id) {
    return (await this._root()).findElement(testId(id));
  }

  async headingText() {
    return (await this._sub('todoItemHeading')).getText();
  }

  async headingClass() {
    return (await this._sub('todoItemHeading')).getAttribute('class');
  }

  async isChecked() {
    return (await this._sub('todoItemCheckbox')).isSelected();
  }

  async check() {
    const box = await this._sub('todoItemCheckbox');
    if (!(await box.isSelected())) await box.click();
  }

  async clickEdit() {
    await (await this._sub('todoItemEditButton')).click();
  }

  async fillEdit(title) {
    const input = await this._sub('todoEditInput');
    await input.clear();
    if (title) await input.sendKeys(title);
  }

  async clickSaveEdit() {
    await (await this._sub('saveEditButton')).click();
  }

  async clickDelete() {
    await (await this._sub('todoItemDeleteButton')).click();
  }
}

/** Page object for the authenticated todo app. Selenium port of
 * tests/pages/todo.page.js. */
export class TodoPage {
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Log in without going through the UI by pre-seeding the session in
   * localStorage. Session restore only reads `currentUser`, so no password is
   * needed.
   *
   * Unlike Playwright's addInitScript (which re-runs on every navigation), we
   * rely on the fact that localStorage naturally persists across reloads and
   * same-origin navigations within one browser session. We first navigate to
   * the origin so localStorage is writable, set the key, and let the caller's
   * goto()/reload() boot the app with the session in place.
   *
   * COUPLING NOTE: this intentionally does NOT create a matching entry in the
   * `users` store. It works only because AuthContext trusts `currentUser` on
   * boot without validating it. If session restore is ever hardened to check
   * the user store, seed a `users` entry here too.
   */
  async seedSession(username = 'testuser') {
    await this.driver.get(BASE_URL);
    await this.driver.executeScript(
      (name) => localStorage.setItem('currentUser', name),
      username,
    );
  }

  async goto() {
    await this.driver.get(BASE_URL);
    await waitVisible(this.driver, this.getHeader());
  }

  async reload() {
    await this.driver.navigate().refresh();
  }

  getHeader() {
    return testId('header');
  }

  getSubHeader() {
    return testId('subHeader');
  }

  getCurrentUser() {
    return testId('currentUser');
  }

  getLogoutButton() {
    return testId('logoutButton');
  }

  async logout() {
    await click(this.driver, this.getLogoutButton());
  }

  getTodoInput() {
    return testId('todoInput');
  }

  getAddTodoButton() {
    return testId('addTodoButton');
  }

  async addTodo(title) {
    await fill(this.driver, this.getTodoInput(), title);
    await click(this.driver, this.getAddTodoButton());
  }

  getDefaultEmptyState() {
    return testId('defaultEmpty');
  }

  getAllTodoItems() {
    return testId('todoItem');
  }

  /** @returns {TodoItem} the nth (1-based) todo row. */
  getNthTodoItem(nthItem) {
    return new TodoItem(this.driver, nthItem);
  }
}
