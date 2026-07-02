import { describe, it, beforeEach, afterEach } from 'mocha';
import { buildDriver } from './driver.js';
import { TodoPage } from './pages/todo.page.js';
import {
  waitVisible,
  waitHidden,
  waitTextContains,
  waitTextEquals,
  waitValueEquals,
  waitCount,
  waitUntil,
  pressEnter,
  click,
} from './helpers.js';

// Each test gets a fresh WebDriver, so localStorage starts empty. The app is
// gated behind login, so we seed a session before navigating; that user's todos
// ("todos:testuser") start empty too.

describe('Todo front page', function () {
  this.timeout(60000);

  let driver;
  let Todo;

  beforeEach(async () => {
    driver = await buildDriver();
    Todo = new TodoPage(driver);
    await Todo.seedSession('testuser');
    await Todo.goto();
  });

  afterEach(async () => {
    if (driver) await driver.quit();
  });

  it('loads with the heading and an empty state', async () => {
    await waitVisible(driver, Todo.getHeader());
    await waitTextContains(driver, Todo.getHeader(), 'Todo CRUD App');
    await waitVisible(driver, Todo.getSubHeader());
    await waitTextContains(driver, Todo.getSubHeader(), 'Create, edit, complete, and delete todos.');
    await waitVisible(driver, Todo.getDefaultEmptyState());
    await waitTextContains(driver, Todo.getDefaultEmptyState(), 'No todos yet.');
  });

  it('adds a todo via the Add button', async () => {
    await Todo.addTodo('Buy milk');

    await waitUntil(
      driver,
      async () => (await Todo.getNthTodoItem(1).headingText()).includes('Buy milk'),
      'first todo should contain "Buy milk"',
    );
    await waitHidden(driver, Todo.getDefaultEmptyState());
    // The input is cleared after adding.
    await waitValueEquals(driver, Todo.getTodoInput(), '');
  });

  it('adds a todo by pressing Enter', async () => {
    const input = await waitVisible(driver, Todo.getTodoInput());
    await input.sendKeys('Walk the dog');
    await pressEnter(driver, Todo.getTodoInput());

    await waitUntil(
      driver,
      async () => (await Todo.getNthTodoItem(1).headingText()).includes('Walk the dog'),
      'first todo should contain "Walk the dog"',
    );
  });

  it('does not add an empty or whitespace-only todo', async () => {
    const input = await waitVisible(driver, Todo.getTodoInput());
    await input.clear();
    await input.sendKeys('   ');
    await click(driver, Todo.getAddTodoButton());

    await waitVisible(driver, Todo.getDefaultEmptyState());
  });

  it('newest todo appears first', async () => {
    await Todo.addTodo('First');
    await Todo.addTodo('Second');

    await waitCount(driver, Todo.getAllTodoItems(), 2);
    await waitUntil(
      driver,
      async () => (await Todo.getNthTodoItem(1).headingText()).trim() === 'Second',
      'newest todo ("Second") should be first',
    );
    await waitUntil(
      driver,
      async () => (await Todo.getNthTodoItem(2).headingText()).trim() === 'First',
      'older todo ("First") should be second',
    );
  });

  it('toggles a todo as complete', async () => {
    await Todo.addTodo('Read a book');

    await Todo.getNthTodoItem(1).check();

    await waitUntil(
      driver,
      async () => Todo.getNthTodoItem(1).isChecked(),
      'todo checkbox should be checked',
    );
    // Completed titles get a line-through style.
    await waitUntil(
      driver,
      async () => (await Todo.getNthTodoItem(1).headingClass()).includes('line-through'),
      'completed todo heading should have line-through class',
    );
  });

  it('edits a todo', async () => {
    await Todo.addTodo('Old title');

    await Todo.getNthTodoItem(1).clickEdit();

    // While editing, the title is replaced by a textbox.
    await Todo.getNthTodoItem(1).fillEdit('New title');
    await Todo.getNthTodoItem(1).clickSaveEdit();

    await waitUntil(
      driver,
      async () => (await Todo.getNthTodoItem(1).headingText()).includes('New title'),
      'todo heading should contain "New title" after edit',
    );
  });

  it('deletes a todo', async () => {
    await Todo.addTodo('Delete me');
    await waitCount(driver, Todo.getAllTodoItems(), 1);

    await Todo.getNthTodoItem(1).clickDelete();
    await waitCount(driver, Todo.getAllTodoItems(), 0);

    await waitVisible(driver, Todo.getDefaultEmptyState());
  });

  it('persists todos across a page reload', async () => {
    await Todo.addTodo('Survives reload');
    await Todo.reload();

    await waitUntil(
      driver,
      async () => (await Todo.getNthTodoItem(1).headingText()).includes('Survives reload'),
      'todo should survive a page reload',
    );
  });
});
