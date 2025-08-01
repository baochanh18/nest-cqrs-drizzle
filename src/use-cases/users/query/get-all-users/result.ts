import type { IQueryResult } from '@nestjs/cqrs';

export class GetAllUsersResult implements IQueryResult {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}
