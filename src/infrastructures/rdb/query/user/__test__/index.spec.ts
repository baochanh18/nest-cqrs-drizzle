import type { TestingModule } from '@nestjs/testing';
import type { GetAllUsersResult } from 'use-cases/users/query/get-all-users/result';
import { DRIZZLE, testingModule } from '~@third-party-modules';
import type { DrizzleDB } from '~@types';
import { NUMBERS } from '~configs';
import { users } from '~rdb/schema';
import { UserQueryModalImplement } from '../index';
import { MOCK_USERS_DATA, PAGINATION_PARAMS } from './assets';

describe('UserQueryModalImplement Integration Test', () => {
  let queryModal: UserQueryModalImplement;
  let db: DrizzleDB;
  let module: TestingModule;

  beforeAll(async () => {
    const providers = [UserQueryModalImplement];
    module = await testingModule(providers);

    queryModal = module.get<UserQueryModalImplement>(UserQueryModalImplement);
    db = module.get<DrizzleDB>(DRIZZLE);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('getAllUsers - first page', () => {
    let result: GetAllUsersResult[];

    beforeAll(async () => {
      // Clean up and seed database
      await db.delete(users);

      // Insert test data into real database
      for (const userData of MOCK_USERS_DATA) {
        await db.insert(users).values({
          name: userData.name,
          email: userData.email,
          password: 'hashedPassword',
        });
      }

      // Test: Get first page of users
      result = await queryModal.getAllUsers(PAGINATION_PARAMS.firstPage);
    });

    it('should return first page of users with correct data', () => {
      // Assert
      expect(result).toHaveLength(NUMBERS.THREE);
      expect(result[NUMBERS.ZERO].name).toBe('John Doe');
      expect(result[NUMBERS.ZERO].email).toBe('john.doe@example.com');
      expect(result[NUMBERS.ONE].name).toBe('Jane Smith');
      expect(result[NUMBERS.TWO].name).toBe('Bob Johnson');
    });

    it('should return users with id, name, and email fields only', () => {
      // Assert
      expect(result[NUMBERS.ZERO]).toHaveProperty('id');
      expect(result[NUMBERS.ZERO]).toHaveProperty('name');
      expect(result[NUMBERS.ZERO]).toHaveProperty('email');
      expect(result[NUMBERS.ZERO]).not.toHaveProperty('password');
    });
  });

  describe('getAllUsers - second page', () => {
    let result: GetAllUsersResult[];

    beforeAll(async () => {
      // Test: Get second page of users (data already seeded)
      result = await queryModal.getAllUsers(PAGINATION_PARAMS.secondPage);
    });

    it('should return second page of users with correct data', () => {
      // Assert
      expect(result).toHaveLength(NUMBERS.THREE);
      expect(result[NUMBERS.ZERO].name).toBe('Alice Williams');
      expect(result[NUMBERS.ONE].name).toBe('Charlie Brown');
      expect(result[NUMBERS.TWO].name).toBe('Diana Davis');
    });

    it('should skip correct number of records for pagination', () => {
      // Assert - Verify that it's not returning the first 3 users
      const firstNames = result.map((user) => user.name);
      expect(firstNames).not.toContain('John Doe');
      expect(firstNames).not.toContain('Jane Smith');
      expect(firstNames).not.toContain('Bob Johnson');
    });
  });

  describe('getAllUsers - large page', () => {
    let result: GetAllUsersResult[];

    beforeAll(async () => {
      // Test: Get large page to retrieve all users
      result = await queryModal.getAllUsers(PAGINATION_PARAMS.largePage);
    });

    it('should return all users when limit equals total count', () => {
      // Assert
      expect(result).toHaveLength(NUMBERS.TEN);
    });

    it('should return users in correct order', () => {
      // Assert
      expect(result[NUMBERS.ZERO].name).toBe('John Doe');
      expect(result[NUMBERS.ONE].name).toBe('Jane Smith');
      expect(result[NUMBERS.TWO].name).toBe('Bob Johnson');
      expect(result[NUMBERS.THREE].name).toBe('Alice Williams');
      expect(result[NUMBERS.FOUR].name).toBe('Charlie Brown');
      expect(result[NUMBERS.FIVE].name).toBe('Diana Davis');
      expect(result[NUMBERS.SIX].name).toBe('Edward Wilson');
      const SEVEN = 7;
      expect(result[SEVEN].name).toBe('Fiona Martinez');
      expect(result[NUMBERS.EIGHT].name).toBe('George Garcia');
      const NINE = 9;
      expect(result[NINE].name).toBe('Hannah Rodriguez');
    });
  });

  describe('getAllUsers - out of range page', () => {
    let result: GetAllUsersResult[];

    beforeAll(async () => {
      // Test: Get page that is out of range
      result = await queryModal.getAllUsers(PAGINATION_PARAMS.outOfRange);
    });

    it('should return empty array when page is out of range', () => {
      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(NUMBERS.ZERO);
    });
  });

  describe('getAllUsers - single item', () => {
    let result: GetAllUsersResult[];

    beforeAll(async () => {
      // Test: Get single user with limit 1
      result = await queryModal.getAllUsers(PAGINATION_PARAMS.singleItem);
    });

    it('should return single user when limit is 1', () => {
      // Assert
      expect(result).toHaveLength(NUMBERS.ONE);
      expect(result[NUMBERS.ZERO].name).toBe('John Doe');
      expect(result[NUMBERS.ZERO].email).toBe('john.doe@example.com');
    });
  });

  describe('getAllUsers - empty database', () => {
    let result: GetAllUsersResult[];

    beforeAll(async () => {
      // Clean database
      await db.delete(users);

      // Test: Get users from empty database
      result = await queryModal.getAllUsers(PAGINATION_PARAMS.firstPage);
    });

    it('should return empty array when database is empty', () => {
      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(NUMBERS.ZERO);
    });
  });

  describe('getAllUsers - various pagination scenarios', () => {
    let results: {
      params: { page: number; limit: number };
      result: GetAllUsersResult[];
    }[];

    beforeAll(async () => {
      // Re-seed database
      await db.delete(users);

      for (const userData of MOCK_USERS_DATA) {
        await db.insert(users).values({
          name: userData.name,
          email: userData.email,
          password: 'hashedPassword',
        });
      }

      results = [];

      const testCases = [
        { page: NUMBERS.ONE, limit: NUMBERS.FIVE },
        { page: NUMBERS.TWO, limit: NUMBERS.FIVE },
        { page: NUMBERS.THREE, limit: NUMBERS.TEN },
        { page: NUMBERS.FIVE, limit: NUMBERS.TWO },
      ];

      // Test: Various pagination scenarios
      for (const testCase of testCases) {
        const result = await queryModal.getAllUsers({
          page: testCase.page,
          limit: testCase.limit,
        });

        results.push({
          params: testCase,
          result,
        });
      }
    });

    it('should return correct number of results for each page', () => {
      // Assert
      expect(results[NUMBERS.ZERO].result).toHaveLength(NUMBERS.FIVE); // page 1, limit 5
      expect(results[NUMBERS.ONE].result).toHaveLength(NUMBERS.FIVE); // page 2, limit 5
      expect(results[NUMBERS.TWO].result).toHaveLength(NUMBERS.ZERO); // page 3, limit 10 (out of range)
      expect(results[NUMBERS.THREE].result).toHaveLength(NUMBERS.TWO); // page 5, limit 2
    });

    it('should return correct users for each page', () => {
      // Assert
      // Page 1, limit 5: Should get first 5 users
      expect(results[NUMBERS.ZERO].result[NUMBERS.ZERO].name).toBe('John Doe');
      expect(results[NUMBERS.ZERO].result[NUMBERS.FOUR].name).toBe(
        'Charlie Brown',
      );

      // Page 2, limit 5: Should get users 6-10
      expect(results[NUMBERS.ONE].result[NUMBERS.ZERO].name).toBe(
        'Diana Davis',
      );
      expect(results[NUMBERS.ONE].result[NUMBERS.FOUR].name).toBe(
        'Hannah Rodriguez',
      );

      // Page 5, limit 2: Should get users 9-10
      expect(results[NUMBERS.THREE].result[NUMBERS.ZERO].name).toBe(
        'George Garcia',
      );
      expect(results[NUMBERS.THREE].result[NUMBERS.ONE].name).toBe(
        'Hannah Rodriguez',
      );
    });
  });
});
