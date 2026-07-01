import { expect } from '@playwright/test';

/** @typedef {import('@playwright/test').Locator} Locator */

export class TodoPage {
  page;
  constructor(page) {
    this.page = page
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