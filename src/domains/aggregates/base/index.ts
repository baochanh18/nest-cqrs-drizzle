import { AggregateRoot } from '@nestjs/cqrs';
import { Expose } from 'class-transformer';

export class BaseAggregate extends AggregateRoot {
  @Expose()
  protected readonly id?: number | null;
}
