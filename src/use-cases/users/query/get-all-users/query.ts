import type { IQuery } from '@nestjs/cqrs';

export class GetAllUsersQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
