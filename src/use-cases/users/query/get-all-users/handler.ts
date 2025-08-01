import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectionToken } from '~configs';
import { IUserQueryModal } from '~domains/queries';
import { GetAllUsersQuery } from './query';
import { GetAllUsersResult } from './result';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler
  implements IQueryHandler<GetAllUsersQuery, GetAllUsersResult[]>
{
  @Inject(InjectionToken.userQueryRepository)
  private readonly userQueryRepository: IUserQueryModal;

  async execute(query: GetAllUsersQuery): Promise<GetAllUsersResult[]> {
    const { page, limit } = query;
    const userList = await this.userQueryRepository.getAllUsers({
      page,
      limit,
    });
    return userList;
  }
}
