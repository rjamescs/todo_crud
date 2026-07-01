import { test, expect } from '@playwright/test'
import { AuthPage } from './pages/auth.page.js'
import { TodoPage } from './pages/todo.page.js'

// Fresh browser context per test => no users and no session in localStorage,
// so every test starts on the login screen. These tests exercise the real UI
// (no seeding), including the SHA-256 hashing, which works because localhost
// is a secure context.

test.describe('Authentication', () => {
  let Auth;
  let Todo;

  test.beforeEach(async ({ page }) => {
    Auth = new AuthPage(page);
    Todo = new TodoPage(page);
    await Auth.goto();
  })

  test('shows the login screen when logged out', async () => {
    await expect(Auth.getHeader()).toBeVisible();
    // The todo app is not rendered until authenticated.
    await expect(Todo.getHeader()).toBeHidden();
  })

  test('registers a new account and lands on an empty todo list', async () => {
    await Auth.register('alice', 'password123');

    await expect(Todo.getHeader()).toBeVisible();
    await expect(Todo.getCurrentUser()).toContainText('alice');
    await expect(Todo.getDefaultEmptyState()).toBeVisible();
  })

  test('requires both a username and a password', async () => {
    await Auth.register('', '');
    await expect(Auth.getError()).toContainText('required');
  })

  test('rejects a duplicate username', async () => {
    await Auth.register('bob', 'secret1');
    await Todo.logout();

    await Auth.register('bob', 'secret2');
    await expect(Auth.getError()).toContainText('already taken');
  })

  test('rejects login with the wrong password', async () => {
    await Auth.register('carol', 'correct-password');
    await Todo.logout();

    await Auth.login('carol', 'wrong-password');
    await expect(Auth.getError()).toContainText('Incorrect password');
  })

  test('rejects login for an unknown user', async () => {
    await Auth.login('nobody', 'whatever');
    await expect(Auth.getError()).toContainText('No account found');
  })

  test('logs out and back in, preserving the user\'s todos', async () => {
    await Auth.register('dave', 'password123');
    await Todo.addTodo('Dave task');
    await expect(Todo.getNthTodoItem(1).heading).toContainText('Dave task');

    await Todo.logout();
    await expect(Auth.getHeader()).toBeVisible();

    await Auth.login('dave', 'password123');
    await expect(Todo.getNthTodoItem(1).heading).toContainText('Dave task');
  })

  test('keeps todos separate between users', async () => {
    // User one adds a todo.
    await Auth.register('userone', 'password123');
    await Todo.addTodo('Only mine');
    await Todo.logout();

    // A brand-new user sees an empty list, not user one's todo.
    await Auth.register('usertwo', 'password123');
    await expect(Todo.getDefaultEmptyState()).toBeVisible();
    await expect(Todo.getAllTodoItems()).toHaveCount(0);

    // Back to user one — their todo is still there.
    await Todo.logout();
    await Auth.login('userone', 'password123');
    await expect(Todo.getNthTodoItem(1).heading).toContainText('Only mine');
  })

  test('keeps the user logged in across a page reload', async ({ page }) => {
    await Auth.register('erin', 'password123');
    await expect(Todo.getHeader()).toBeVisible();

    await page.reload();

    await expect(Todo.getHeader()).toBeVisible();
    await expect(Todo.getCurrentUser()).toContainText('erin');
  })
})
