import { Expose } from 'class-transformer';
import { BaseAggregate } from '../base';

export class PostAggregate extends BaseAggregate {
  @Expose()
  public readonly authorId?: number;

  @Expose()
  public readonly title?: string;

  @Expose()
  public readonly content?: string;
}
