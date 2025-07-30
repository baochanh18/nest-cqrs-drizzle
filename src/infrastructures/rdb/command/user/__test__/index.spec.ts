import type { TestingModule } from '@nestjs/testing';
import { DRIZZLE, testingModule } from '~@third-party-modules';
import type { DrizzleDB } from '~@types';
import { NUMBERS } from '~configs';
import type { UserAggregate } from '~domains/aggregates';
import { UserFactory } from '~domains/factories';
import type { UserEntity } from '~rdb/schema';
import { users } from '~rdb/schema';
import { UserRepositoryImplement } from '../index';
import { MOCK_USER_DATA, NON_EXISTENT_USER_ID } from './assets';

describe('UserRepositoryImplement Integration Test', () => {
  let repository: UserRepositoryImplement;
  let db: DrizzleDB;
  let userFactory: UserFactory;
  let module: TestingModule;

  beforeAll(async () => {
    const providers = [UserRepositoryImplement, UserFactory];
    module = await testingModule(providers);

    repository = module.get<UserRepositoryImplement>(UserRepositoryImplement);
    db = module.get<DrizzleDB>(DRIZZLE);
    userFactory = module.get<UserFactory>(UserFactory);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('create and findById', () => {
    let createdUser: UserAggregate;
    let foundUser: UserAggregate | null;
    let nonExistentUserResult: UserAggregate | null;

    beforeAll(async () => {
      // Clean up before this test group
      await db.delete(users);

      // Test 1: Create and find user
      const userData = MOCK_USER_DATA.integration;
      const userAggregate = userFactory.createAggregate(userData);
      createdUser = await repository.create({ user: userAggregate });
      foundUser = await repository.findById({ id: createdUser.getId()! });

      // Test 2: Find non-existent user
      nonExistentUserResult = await repository.findById({
        id: NON_EXISTENT_USER_ID,
      });
    });

    it('should create a new user and retrieve it by id', () => {
      // Assert
      expect(foundUser).not.toBeNull();
      expect(foundUser?.name).toBe(MOCK_USER_DATA.integration.name);
      expect(foundUser?.email).toBe(MOCK_USER_DATA.integration.email);
      expect(foundUser?.getId()).toBe(createdUser.getId());
    });

    it('should return null when user does not exist', () => {
      // Assert
      expect(nonExistentUserResult).toBeNull();
    });
  });

  describe('update', () => {
    let originalUser: UserAggregate;
    let updatedUser: UserAggregate;
    let allUsersAfterUpdate: UserEntity[];

    beforeAll(async () => {
      // Clean up before this test group
      await db.delete(users);

      // Create original user
      const originalData = MOCK_USER_DATA.update.original;
      const originalAggregate = userFactory.createAggregate(originalData);
      originalUser = await repository.create({ user: originalAggregate });

      // Update user
      const updatedData = {
        id: originalUser.getId()!,
        name: MOCK_USER_DATA.update.updated.name,
        email: MOCK_USER_DATA.update.updated.email,
        password: MOCK_USER_DATA.update.updated.password,
      };
      const updatedAggregate = userFactory.createAggregate(updatedData);
      updatedUser = await repository.update({ user: updatedAggregate });
      allUsersAfterUpdate = await db.select().from(users);
    });

    it('should update existing user', () => {
      // Assert
      expect(updatedUser.getId()).toBe(originalUser.getId());
      expect(updatedUser.name).toBe(MOCK_USER_DATA.update.updated.name);
      expect(allUsersAfterUpdate.length).toBeGreaterThanOrEqual(NUMBERS.ONE);
    });
  });

  describe('deleteById', () => {
    let userToDelete: UserAggregate;
    let deletedUserResult: UserAggregate | null;
    let nonExistentDeleteResult: string;

    beforeAll(async () => {
      // Clean up before this test group
      await db.delete(users);

      // Create and delete user
      const deleteData = MOCK_USER_DATA.delete;
      const deleteAggregate = userFactory.createAggregate(deleteData);
      userToDelete = await repository.create({ user: deleteAggregate });
      await repository.deleteById({ user: userToDelete });
      deletedUserResult = await repository.findById({
        id: userToDelete.getId()!,
      });

      // Test delete non-existent user (should not throw)
      const nonExistentUser = userFactory.createAggregate(
        MOCK_USER_DATA.nonExistent,
      );
      try {
        await repository.deleteById({ user: nonExistentUser });
        nonExistentDeleteResult = 'success';
      } catch {
        nonExistentDeleteResult = 'error';
      }
    });

    it('should delete an existing user', () => {
      // Assert
      expect(deletedUserResult).toBeNull();
    });

    it('should not throw error when deleting non-existent user', () => {
      // Assert - Should not throw
      expect(nonExistentDeleteResult).toBe('success');
    });
  });
});
