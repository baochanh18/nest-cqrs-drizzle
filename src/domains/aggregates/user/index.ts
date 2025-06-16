import { Expose, Type } from 'class-transformer';
import BaseAggregate from '../base';
import { PostAggregate } from '../post';

export class UserAggregate extends BaseAggregate {
  @Expose()
  public readonly name?: string;

  @Expose()
  public readonly email?: string;

  @Expose()
  public readonly password?: string;

  @Expose()
  @Type(() => PostAggregate)
  public readonly posts?: PostAggregate[];

  public getId() {
    return this.id;
  }
}
