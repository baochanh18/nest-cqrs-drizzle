import { Inject, Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { UserAggregate } from '~domains/aggregates';
import { UserEntity, userSchema } from '~rdb/schema';
import { IBaseFactory } from './base.factory';

@Injectable()
export class UserFactory implements IBaseFactory<UserAggregate, UserEntity> {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

  createAggregate(plainObject: Partial<UserEntity>) {
    const userAggregate = plainToInstance(UserAggregate, plainObject);
    return this.eventPublisher.mergeObjectContext(userAggregate);
  }

  createEntity(plainObject: UserAggregate) {
    return userSchema.parse(plainObject);
  }
}
