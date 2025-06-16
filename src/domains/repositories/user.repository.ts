import { DrizzleDB } from '~@types';
import { UserAggregate } from '~domains/aggregates';

export type FindByIdPayload = {
  transaction?: DrizzleDB;
  id: number;
};
export type SavePayload = {
  transaction?: DrizzleDB;
  user: UserAggregate;
};

export type DeleteByIdPayload = {
  transaction?: DrizzleDB;
  user: UserAggregate;
};

export interface UserRepository {
  findById(payload: FindByIdPayload): Promise<UserAggregate | null>;
  save(payload: SavePayload): Promise<UserAggregate>;
  deleteById(payload: DeleteByIdPayload): Promise<void>;
}
