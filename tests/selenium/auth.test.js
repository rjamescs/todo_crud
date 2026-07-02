import { describe, it, beforeEach, afterEach } from 'mocha';
import { buildDriver } from './driver.js';
import { AuthPage } from './pages/auth.page.js';
import { TodoPage } from './pages/todo.page.js';
import {
  waitVisible,
  waitHidden,
  waitTextContains,
  waitUntil,
  waitCount,
} from './helpers.js';

// A fresh WebDriver per test => no users and no session in localStorage, so
// every test starts on the login screen. These tests exercise the real UI
// (no seeding), including the SHA-256 hashing, which works because localhost
// is a secure context.

describe('Authentication', function () {
  this.timeout(60000);

  let driver;
  let Auth;
  let Todo;

  beforeEach(async () => {
    driver = await buildDriver();
    Auth = new AuthPage(driver);
    Todo = new TodoPage(driver);
    await Auth.goto();
  });

  afterEach(async () => {
    if (driver) await driver.quit();
  });

  it('shows the login screen when logged out', async () => {
    await waitVisible(driver, Auth.getHeader());
    // The todo app is not rendered until authenticated.
    await waitHidden(driver, Todo.getHeader());
  });

  it('registers a new account and lands on an empty todo list', async () => {
    await Auth.register('alice', 'password123');

    await waitVisible(driver, Todo.getHeader());
    await waitTextContains(driver, Todo.getCurrentUser(), 'alice');
    await waitVisible(driver, Todo.getDefaultEmptyState());
  });

  it('requires both a username and a password', async () => {
    await Auth.register('', '');
    await waitTextContains(driver, Auth.getError(), 'required');
  });

  it('rejects a duplicate username', async () => {
    await Auth.register('bob', 'secret1');
    await Todo.logout();

    await Auth.register('bob', 'secret2');
    await waitTextContains(driver, Auth.getError(), 'already taken');
  });

  it('rejects login with the wrong password', async () => {
    await Auth.register('carol', 'correct-password');
    await Todo.logout();

    await Auth.login('carol', 'wrong-password');
    await waitTextContains(driver, Auth.getError(), 'Incorrect password');
  });

  it('rejects login for an unknown user', async () => {
    await Auth.login('nobody', 'whatever');
    await waitTextContains(driver, Auth.getError(), 'No account found');
  });

  it("logs out and back in, preserving the user's todos", async () => {
    await Auth.register('dave', 'password123');
    await Todo.addTodo('Dave task');
    await waitUntil(
      driver,
      async () => (await Todo.getNthTodoItem(1).headingText()).includes('Dave task'),
      'first todo should contain "Dave task"',
    );

    await Todo.logout();
    await waitVisible(driver, Auth.getHeader());

    await Auth.login('dave', 'password123');
    await waitUntil(
      driver,
      async () => (await Todo.getNthTodoItem(1).headingText()).includes('Dave task'),
      'first todo should still contain "Dave task" after re-login',
    );
  });

  it('keeps todos separate between users', async () => {
    // User one adds a todo.
    await Auth.register('userone', 'password123');
    await Todo.addTodo('Only mine');
    await Todo.logout();

    // A brand-new user sees an empty list, not user one's todo.
    await Auth.register('usertwo', 'password123');
    await waitVisible(driver, Todo.getDefaultEmptyState());
    await waitCount(driver, Todo.getAllTodoItems(), 0);

    // Back to user one — their todo is still there.
    await Todo.logout();
    await Auth.login('userone', 'password123');
    await waitUntil(
      driver,
      async () => (await Todo.getNthTodoItem(1).headingText()).includes('Only mine'),
      'user one\'s todo should still be present',
    );
  });

  it('keeps the user logged in across a page reload', async () => {
    await Auth.register('erin', 'password123');
    await waitVisible(driver, Todo.getHeader());

    await Todo.reload();

    await waitVisible(driver, Todo.getHeader());
    await waitTextContains(driver, Todo.getCurrentUser(), 'erin');
  });
});
