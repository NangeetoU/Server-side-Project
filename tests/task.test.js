const { TasksModel } = require('../models/tasksModel');

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn(),
    query: jest.fn(),
    getConnection: jest.fn().mockResolvedValue({
      beginTransaction: jest.fn(),
      execute: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    }),
  },
}));

describe('TasksModel CRUD', () => {
  const { pool } = require('../config/database');

  beforeEach(() => jest.clearAllMocks());

  test('Create task → should insert and return ID', async () => {
    pool.execute.mockResolvedValueOnce([{ insertId: 1 }]);
    const id = await TasksModel.create({
      user_id: 1,
      title: 'Study Jest',
      priority: 'LOW',
      due_at: '2025-10-10',
    });
    expect(id).toBe(1);
  });

  test('Find by ID → should return correct task', async () => {
    const mockTask = { task_id: 1, title: 'Homework' };
    pool.execute.mockResolvedValueOnce([[mockTask]]);
    const task = await TasksModel.findById(1, 1);
    expect(task.title).toBe('Homework');
  });

  test('Update task → should return true when affected', async () => {
    pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const ok = await TasksModel.update(1, 1, { status: 'COMPLETED' });
    expect(ok).toBe(true);
  });

  test('Remove task → should delete and return true', async () => {
    const connection = await pool.getConnection();
    connection.execute
      .mockResolvedValueOnce([]) // delete reminders
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // delete task
    const ok = await TasksModel.remove(1, 1);
    expect(ok).toBe(true);
  });
});
