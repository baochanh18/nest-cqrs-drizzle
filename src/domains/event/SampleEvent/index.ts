import { IEvent } from '@nestjs/cqrs';

export class SampleEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly date: Date,
    public readonly location: string,
  ) {}

  getDetails() {
    return `Event ID: ${this.id}, Name: ${this.name}, Date: ${this.date.toISOString()}, Location: ${this.location}`;
  }
}
