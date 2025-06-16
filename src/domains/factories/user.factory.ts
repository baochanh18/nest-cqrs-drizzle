import { Inject, Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { UserAggregate } from '~domains/aggregates';
import { UserEntity, userSchema } from '~rdb/schema';
import { IBaseFactory } from './base.factory';

@Injectable()
export class UserFactory implements IBaseFactory<UserAggregate, UserEntity> {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

  public createAggregate(plainObject: Partial<UserEntity>): UserAggregate {
    const userAggregate = plainToInstance(UserAggregate, plainObject);
    return this.eventPublisher.mergeObjectContext(userAggregate);
  }

  public createEntity(plainObject: UserAggregate): UserEntity {
    return userSchema.parse(plainObject);
  }
}
