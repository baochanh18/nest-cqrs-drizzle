import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@third-party-modules';
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
  @Inject() private readonly logger: LoggerService;

  async execute(command: CreateUserCommand): Promise<void> {
    const { payload } = command;
    this.logger.log(
      `Creating user with email: ${payload.email}`,
      'CreateUserHandler',
    );

    const userAggregate = this.userFactory.createAggregate(payload);

    await this.userCommandRepository.create({
      user: userAggregate,
    });

    this.logger.log('User created successfully', 'CreateUserHandler');
  }
}
