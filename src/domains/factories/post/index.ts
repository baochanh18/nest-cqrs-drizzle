import { Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { PostAggregate } from '~domains/aggregates';
import { PostEntity, postSchema } from '~rdb/schema';

export interface CreatePostAggregatePayload {
  id?: number;
  title?: string;
  content?: string;
  authorId?: number | null;
}
export class PostFactory {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

  public createAggregate(
    plainObject: CreatePostAggregatePayload,
  ): PostAggregate {
    const userAggregate = plainToInstance(PostAggregate, plainObject);
    return this.eventPublisher.mergeObjectContext(userAggregate);
  }

  public createEntity(plainObject: PostAggregate): PostEntity {
    return postSchema.parse(plainObject);
  }
}
