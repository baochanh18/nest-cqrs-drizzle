import { Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { PostAggregate } from '~domains/aggregates';
import { postSchema } from '~rdb/schema';

export type CreatePostAggregatePayload = {
  id?: number;
  title?: string;
  content?: string;
  authorId?: number | null;
};
export class PostFactory {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

  createAggregate(plainObject: CreatePostAggregatePayload) {
    const userAggregate = plainToInstance(PostAggregate, plainObject);
    return this.eventPublisher.mergeObjectContext(userAggregate);
  }

  createEntity(plainObject: PostAggregate) {
    return postSchema.parse(plainObject);
  }
}
