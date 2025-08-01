import { Inject } from '@nestjs/common';
import { GetAllUsersResult } from 'use-cases/users/query/get-all-users/result';
import { DRIZZLE } from '~@third-party-modules';
import { DrizzleDB } from '~@types';
import { NUMBERS } from '~configs';
import { GetAllUsersPayload, IUserQueryModal } from '~domains/queries';

export class UserQueryModalImplement implements IUserQueryModal {
  @Inject(DRIZZLE) private readonly db: DrizzleDB;

  async getAllUsers(payload: GetAllUsersPayload): Promise<GetAllUsersResult[]> {
    const { page, limit } = payload;
    const offset = (page - NUMBERS.ONE) * limit;

    const userList = await this.db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
      offset: offset,
      limit: limit,
    });

    return userList;
  }
}
