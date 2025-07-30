import { Inject, Injectable } from '@nestjs/common';
import { eq as equal } from 'drizzle-orm';
import { DRIZZLE } from '~@third-party-modules';
import { DrizzleDB } from '~@types';
import { UserAggregate } from '~domains/aggregates';
import { UserFactory } from '~domains/factories';
import {
  CreatePayload,
  DeleteByIdPayload,
  FindByIdPayload,
  UpdatePayload,
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
    const { id } = payload;

    const queryResult = await this.db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, id),
      with: {
        posts: true,
      },
    });

    return queryResult ? this.userFactory.createAggregate(queryResult) : null;
  }

  public async create(payload: CreatePayload): Promise<UserAggregate> {
    const { user } = payload;

    const userEntity = this.userFactory.createInsertEntity(user);

    const result = await this.db.insert(users).values(userEntity).returning();

    return this.userFactory.createAggregate(result.pop() ?? {});
  }

  public async update(payload: UpdatePayload): Promise<UserAggregate> {
    const { user } = payload;

    const userEntity = this.userFactory.createInsertEntity(user);
    const userId = user.getId();

    if (userId === null || userId === undefined) {
      throw new Error('User ID is required for update operation');
    }

    const result = await this.db
      .update(users)
      .set(userEntity)
      .where(equal(users.id, userId))
      .returning();

    return this.userFactory.createAggregate(result.pop() ?? {});
  }

  public async deleteById(payload: DeleteByIdPayload): Promise<void> {
    const { user } = payload;

    const userId = user.getId();
    if (userId === null || userId === undefined || Number.isNaN(userId)) {
      throw new Error('User id is required for deletion');
    }
    await this.db.delete(users).where(equal(users.id, userId));
  }
}
