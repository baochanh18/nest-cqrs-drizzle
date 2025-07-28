export const MOCK_USER_DATA = {
  basic: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  integration: {
    name: 'Integration Test User',
    email: 'integration@test.com',
    password: 'hashedPassword123',
  },
  update: {
    original: {
      name: 'Original Name',
      email: 'update@test.com',
      password: 'originalPassword',
    },
    updated: {
      name: 'Updated Name',
      email: 'update@test.com',
      password: 'updatedPassword',
    },
  },
  delete: {
    name: 'User To Delete',
    email: 'delete@test.com',
    password: 'password123',
  },
  transaction: {
    test: {
      name: 'Transaction Test User',
      email: 'transaction@test.com',
      password: 'password123',
    },
    success: {
      name: 'Transaction Success User',
      email: 'transaction.success@test.com',
      password: 'password123',
    },
  },
  nonExistent: {
    id: 99999,
    name: 'Non Existent',
    email: 'nonexistent@test.com',
    password: 'password',
  },
};

export const NON_EXISTENT_USER_ID = 99999;
