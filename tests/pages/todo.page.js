import { expect } from '@playwright/test';

/** @typedef {import('@playwright/test').Locator} Locator */

export class TodoPage {
  page;
  constructor(page) {
    this.page = page
  }

  /**
   * Log in without going through the UI by pre-seeding the session in
   * localStorage. Session restore only reads `currentUser`, so no password is
   * needed. Must be called before goto()/reload — addInitScript re-runs on
   * every navigation, so the seeded session survives page.reload().
   */
  async seedSession(username = 'testuser') {
    await this.page.addInitScript((name) => {
      localStorage.setItem('currentUser', name);
    }, username);
  }

  async goto() {
      await this.page.goto('/');
      await expect(this.getHeader()).toBeVisible();
  }

  /** @returns {Locator} */
  getHeader() {
      return this.page.getByTestId('header');
  }

  /** @returns {Locator} */
  getSubHeader() {
      return this.page.getByTestId('subHeader');
  }

  /** @returns {Locator} */
  getCurrentUser() {
      return this.page.getByTestId('currentUser');
  }

  /** @returns {Locator} */
  getLogoutButton() {
      return this.page.getByTestId('logoutButton');
  }

  async logout() {
      await this.getLogoutButton().click();
  }

  /** @returns {Locator} */
  getTodoInput() {
      return this.page.getByTestId('todoInput');
  }

  /** @returns {Locator} */
  getAddTodoButton() {
      return this.page.getByTestId('addTodoButton');
  }

  async addTodo(title) {
    await this.getTodoInput().fill(title);
    await this.getAddTodoButton().click();
  }

  /** @returns {Locator} */
  getDefaultEmptyState() {
      return this.page.getByTestId('defaultEmpty');
  }

  /** @returns {Locator} */
  getAllTodoItems() {
      return this.page.getByTestId('todoItem');
  }

  /** @returns {{checkbox: Locator, heading: Locator, created: Locator, editButton: Locator, deleteButton: Locator}} */
  getNthTodoItem(nthItem) {
    let nthTodoItem = this.page.getByTestId('todoItem').nth(nthItem - 1);
    return {
      checkbox: nthTodoItem.getByTestId('todoItemCheckbox'),
      heading: nthTodoItem.getByTestId('todoItemHeading'),
      created: nthTodoItem.getByTestId('createdAt'),
      editButton: nthTodoItem.getByTestId('todoItemEditButton'),
      editInput: nthTodoItem.getByTestId('todoEditInput'),
      saveEditButton: nthTodoItem.getByTestId('saveEditButton'),
      deleteButton: nthTodoItem.getByTestId('todoItemDeleteButton'),
    }
  }
}