import { Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { UserAggregate } from '~domains/aggregates';
import { userSchema } from '~rdb/schema';
import { CreatePostAggregatePayload } from './post.factory';

type CreateUserAggregatePayload = {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  posts?: CreatePostAggregatePayload[];
};
export class UserFactory {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

  createAggregate(plainObject: CreateUserAggregatePayload) {
    const userAggregate = plainToInstance(UserAggregate, plainObject);
    return this.eventPublisher.mergeObjectContext(userAggregate);
  }

  createEntity(plainObject: UserAggregate) {
    return userSchema.parse(plainObject);
  }
}
