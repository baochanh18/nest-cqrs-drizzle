import type { ICommand } from '@nestjs/cqrs';

export interface CreateUserCommandPayload {
  name: string;
  email: string;
  password: string;
}

export class CreateUserCommand implements ICommand {
  constructor(readonly payload: CreateUserCommandPayload) {}
}
