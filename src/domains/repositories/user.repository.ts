import type { DrizzleDB } from '~@types';
import type { UserAggregate } from '~domains/aggregates';

export interface FindByIdPayload {
  transaction?: DrizzleDB;
  id: number;
}
export interface CreatePayload {
  transaction?: DrizzleDB;
  user: UserAggregate;
}

export interface UpdatePayload {
  transaction?: DrizzleDB;
  user: UserAggregate;
}

export interface DeleteByIdPayload {
  transaction?: DrizzleDB;
  user: UserAggregate;
}

export interface UserRepository {
  findById: (payload: FindByIdPayload) => Promise<UserAggregate | null>;
  create: (payload: CreatePayload) => Promise<UserAggregate>;
  update: (payload: UpdatePayload) => Promise<UserAggregate>;
  deleteById: (payload: DeleteByIdPayload) => Promise<void>;
}
