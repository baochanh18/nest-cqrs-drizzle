import type { UserAggregate } from '~domains/aggregates';

export interface FindByIdPayload {
  id: number;
}
export interface CreatePayload {
  user: UserAggregate;
}

export interface UpdatePayload {
  user: UserAggregate;
}

export interface DeleteByIdPayload {
  user: UserAggregate;
}

export interface UserRepository {
  findById: (payload: FindByIdPayload) => Promise<UserAggregate | null>;
  create: (payload: CreatePayload) => Promise<UserAggregate>;
  update: (payload: UpdatePayload) => Promise<UserAggregate>;
  deleteById: (payload: DeleteByIdPayload) => Promise<void>;
}
