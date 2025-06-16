import type { DrizzleDB } from '~@types';
import type { UserAggregate } from '~domains/aggregates';

export interface FindByIdPayload {
  transaction?: DrizzleDB;
  id: number;
}
export interface SavePayload {
  transaction?: DrizzleDB;
  user: UserAggregate;
}

export interface DeleteByIdPayload {
  transaction?: DrizzleDB;
  user: UserAggregate;
}

export interface UserRepository {
  findById: (payload: FindByIdPayload) => Promise<UserAggregate | null>;
  save: (payload: SavePayload) => Promise<UserAggregate>;
  deleteById: (payload: DeleteByIdPayload) => Promise<void>;
}
