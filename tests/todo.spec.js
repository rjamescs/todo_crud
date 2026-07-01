import { test, expect } from '@playwright/test'
import { TodoPage } from "./pages/todo.page.js";

// Each test gets a fresh browser context, so localStorage ("todos") starts empty.

test.describe('Todo front page', () => {
  let Todo;
  test.beforeEach(async ({ page }) => {
    Todo = new TodoPage(page);
    await Todo.goto();
  });

  test('loads with the heading and an empty state', async ({ page }) => {
    await expect(Todo.getHeader()).toBeVisible();
    await expect(Todo.getHeader()).toContainText('Todo CRUD App')
    await expect(Todo.getSubHeader()).toBeVisible();
    await expect(Todo.getSubHeader()).toContainText('Create, edit, complete, and delete todos.')
    await expect(Todo.getDefaultEmptyState()).toBeVisible();
    await expect(Todo.getDefaultEmptyState()).toContainText('No todos yet.')
  });

  test('adds a todo via the Add button', async ({ page }) => {
    await Todo.addTodo('Buy milk');

    await expect(Todo.getNthTodoItem(1).heading).toBeVisible();
    await expect(Todo.getNthTodoItem(1).heading).toContainText('Buy milk');
    await expect(Todo.getDefaultEmptyState()).toBeHidden();
    // The input is cleared after adding.
    await expect(Todo.getTodoInput()).toHaveValue('')
  });

  test('adds a todo by pressing Enter', async ({ page }) => {
    await Todo.getTodoInput().fill('Walk the dog')
    await Todo.getTodoInput().press('Enter')

    await expect(Todo.getNthTodoItem(1).heading).toBeVisible();
    await expect(Todo.getNthTodoItem(1).heading).toContainText('Walk the dog');
  });

  test('does not add an empty or whitespace-only todo', async ({ page }) => {
    await Todo.getTodoInput().fill('   ');
    await Todo.getAddTodoButton().click();

    await expect(Todo.getDefaultEmptyState()).toBeVisible();
  })

  test('newest todo appears first', async ({ page }) => {
    await Todo.addTodo('First');
    await Todo.addTodo('Second');

    await expect(Todo.getAllTodoItems()).toHaveCount(2);
    await expect(Todo.getNthTodoItem(1).heading).toHaveText('Second');
    await expect(Todo.getNthTodoItem(2).heading).toHaveText('First');
  });

  test('toggles a todo as complete', async ({ page }) => {
    await Todo.addTodo('Read a book');

    await Todo.getNthTodoItem(1).checkbox.check();

    await expect(Todo.getNthTodoItem(1).checkbox).toBeChecked();
    // Completed titles get a line-through style.
    await expect(Todo.getNthTodoItem(1).heading).toHaveClass(/line-through/);
  });

  test('edits a todo', async ({ page }) => {
    await Todo.addTodo('Old title');

    await Todo.getNthTodoItem(1).editButton.click();

    // While editing, the title is replaced by a textbox (the add box is index 0).
    await Todo.getNthTodoItem(1).editInput.fill('New title');
    await Todo.getNthTodoItem(1).saveEditButton.click();

    await expect(Todo.getNthTodoItem(1).heading).toBeVisible();
    await expect(Todo.getNthTodoItem(1).heading).toContainText('New title');
  });

  test('deletes a todo', async ({ page }) => {
    await Todo.addTodo('Delete me');
    await expect(Todo.getAllTodoItems()).toHaveCount(1);
    await Todo.getNthTodoItem(1).deleteButton.click();
    await expect(Todo.getAllTodoItems()).toHaveCount(0);

    await expect(Todo.getDefaultEmptyState()).toBeVisible()
  });

  test('persists todos across a page reload', async ({ page }) => {
    await Todo.addTodo('Survives reload');
    await page.reload();

    await expect(Todo.getNthTodoItem(1).heading).toBeVisible();
    await expect(Todo.getNthTodoItem(1).heading).toContainText('Survives reload');
  });
});