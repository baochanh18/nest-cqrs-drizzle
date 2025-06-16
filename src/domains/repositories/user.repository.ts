import { DrizzleDB } from '~@types';
import { UserAggregate } from '~domains/aggregates';

export type FindByIdPayload = {
  transaction: DrizzleDB | null;
  id: number;
};
export type SavePayload = {
  transaction: DrizzleDB | null;
  user: UserAggregate;
};

export type DeleteByIdPayload = {
  transaction: DrizzleDB | null;
  user: UserAggregate;
};

export interface UserRepository {
  findById(payload: FindByIdPayload): Promise<UserAggregate | null>;
  save(payload: SavePayload): Promise<UserAggregate>;
  deleteById(payload: DeleteByIdPayload): Promise<void>;
}
