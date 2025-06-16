import { AggregateRoot } from '@nestjs/cqrs';
import { Expose } from 'class-transformer';

export default class BaseAggregate extends AggregateRoot {
  @Expose()
  protected readonly id?: number | null;
}
