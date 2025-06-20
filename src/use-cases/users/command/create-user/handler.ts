import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectionToken } from '~configs';
import { UserFactory } from '~domains/factories';
import { UserRepository } from '~domains/repositories';
import { CreateUserCommand } from './command';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  @Inject(InjectionToken.userCommandRepository)
  private readonly userCommandRepository: UserRepository;
  @Inject() private readonly userFactory: UserFactory;

  async execute(command: CreateUserCommand): Promise<void> {
    const { payload } = command;
    const userAggregate = this.userFactory.createAggregate(payload);

    const result = await this.userCommandRepository.save({
      user: userAggregate,
    });

    console.log('result', result);
  }
}
