import { Inject, Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { UserAggregate } from '~domains/aggregates';
import {
  UserEntityWithRelations,
  UserInsertEntity,
  userInsertSchema,
} from '~rdb/schema';
import { IBaseFactory } from './base.factory';

@Injectable()
export class UserFactory
  implements IBaseFactory<UserAggregate, UserInsertEntity>
{
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

  public createAggregate(
    plainObject: Partial<UserEntityWithRelations>,
  ): UserAggregate {
    const userAggregate = plainToInstance(UserAggregate, plainObject);
    return this.eventPublisher.mergeObjectContext(userAggregate);
  }

  public createInsertEntity(plainObject: UserAggregate): UserInsertEntity {
    return userInsertSchema.parse(plainObject);
  }
}
