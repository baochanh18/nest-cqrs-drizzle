import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DrizzleModule } from '~@third-party-modules';
import { InjectionToken } from '~configs';
import { UserFactory } from '~domains/factories';
import { UserController } from '~presentations/http';
import { UserRepositoryImplement } from '~rdb/command';
import { CreateUserCommandHandler } from './command/create-user/handler';

const commands: Provider[] = [CreateUserCommandHandler];
const factories = [UserFactory];

const repositories: Provider[] = [
  {
    provide: InjectionToken.userCommandRepository,
    useClass: UserRepositoryImplement,
  },
];

@Module({
  imports: [DrizzleModule, CqrsModule],
  controllers: [UserController],
  providers: [...commands, ...repositories, ...factories],
})
export class UserUseCaseModule {}
