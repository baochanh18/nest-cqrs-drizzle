import { Inject, Injectable } from '@nestjs/common';
import { eq as equal } from 'drizzle-orm';
import { DRIZZLE } from '~@third-party-modules';
import { DrizzleDB } from '~@types';
import { UserAggregate } from '~domains/aggregates';
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

  public async findById(
    payload: FindByIdPayload,
  ): Promise<UserAggregate | null> {
    const { transaction, id } = payload;
    const db = transaction ?? this.db;

    const queryResult = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, id),
      with: {
        posts: true,
      },
    });

    return queryResult ? this.userFactory.createAggregate(queryResult) : null;
  }

  public async save(payload: SavePayload): Promise<UserAggregate> {
    const { transaction, user } = payload;
    const db = transaction ?? this.db;

    const userEntity = this.userFactory.createEntity(user);

    const result = await db
      .insert(users)
      .values(userEntity)
      .onConflictDoUpdate({ target: users.id, set: userEntity })
      .returning();

    return this.userFactory.createAggregate(result.pop() ?? {});
  }

  public async deleteById(payload: DeleteByIdPayload): Promise<void> {
    const { transaction, user } = payload;
    const db = transaction ?? this.db;

    const userId = user.getId();
    if (userId === null || userId === undefined || Number.isNaN(userId)) {
      throw new Error('User id is required for deletion');
    }
    await db.delete(users).where(equal(users.id, userId));
  }
}
