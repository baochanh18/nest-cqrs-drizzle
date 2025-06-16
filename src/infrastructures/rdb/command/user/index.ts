import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '~@third-party-modules';
import { DrizzleDB } from '~@types';
import { UserFactory } from '~domains/factories';
import {
  DeleteByIdPayload,
  FindByIdPayload,
  SavePayload,
  UserRepository,
} from '~domains/repositories';
import { users } from '~rdb/schema';

@Injectable()
export class UserRepositoryImplement implements UserRepository {
  @Inject(DRIZZLE) private readonly db: DrizzleDB;
  @Inject() private readonly userFactory: UserFactory;

  async findById(payload: FindByIdPayload) {
    const { transaction, id } = payload;
    const db = transaction || this.db;

    const queryResult = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
      with: {
        posts: true,
      },
    });

    return queryResult ? this.userFactory.createAggregate(queryResult) : null;
  }

  async save(payload: SavePayload) {
    const { transaction, user } = payload;
    const db = transaction || this.db;

    const userEntity = this.userFactory.createEntity(user);

    const result = await db
      .insert(users)
      .values(userEntity)
      .onConflictDoUpdate({ target: users.id, set: userEntity })
      .returning();

    return this.userFactory.createAggregate(result[0]);
  }

  async deleteById(payload: DeleteByIdPayload) {
    const { transaction, user } = payload;
    const db = transaction || this.db;

    const userId = user.getId();
    if (!userId) {
      throw new Error('User id is required for deletion');
    }
    await db.delete(users).where(eq(users.id, userId));
  }
}
