const { UsersModel } = require('../models/usersModel');
const bcrypt = require('bcryptjs');

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn(),
  },
}));

describe('UsersModel CRUD', () => {
  const { pool } = require('../config/database');

  beforeEach(() => jest.clearAllMocks());

  test('Create user → should insert and return ID', async () => {
    pool.execute.mockResolvedValueOnce([{ insertId: 99 }]);
    const result = await UsersModel.create({
      first_name: 'John',
      last_name: 'Doe',
      username: 'john_doe',
      email: 'john@example.com',
      password_hash: 'hashed',
    });
    expect(result).toBe(99);
  });

  test('Find user by ID → should return user object', async () => {
    const mockUser = { user_id: 1, username: 'john' };
    pool.execute.mockResolvedValueOnce([[mockUser]]);
    const user = await UsersModel.findById(1);
    expect(user.username).toBe('john');
  });

  test('Find by username → should return null if not found', async () => {
    pool.execute.mockResolvedValueOnce([[]]);
    const user = await UsersModel.findByUsername('ghost');
    expect(user).toBeNull();
  });

  test('Update user → should return true when affected', async () => {
    pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const ok = await UsersModel.update(1, {
      first_name: 'Jane',
      last_name: 'Doe',
      username: 'jane',
      email: 'jane@example.com',
    });
    expect(ok).toBe(true);
  });
});
