import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from '@third-party-modules/logger';
import { UserQueryModalImplement } from 'infrastructures/rdb/query';
import { DrizzleModule } from '~@third-party-modules';
import { InjectionToken } from '~configs';
import { UserFactory } from '~domains/factories';
import { UserController } from '~presentations/http';
import { UserRepositoryImplement } from '~rdb/command';
import { CreateUserCommandHandler } from './command/create-user/handler';
import { GetAllUsersHandler } from './query/get-all-users/handler';

const commands: Provider[] = [CreateUserCommandHandler];
const queries: Provider[] = [GetAllUsersHandler];
const factories = [UserFactory];

const repositories: Provider[] = [
  {
    provide: InjectionToken.userCommandRepository,
    useClass: UserRepositoryImplement,
  },
  {
    provide: InjectionToken.userQueryRepository,
    useClass: UserQueryModalImplement,
  },
];

@Module({
  imports: [DrizzleModule, CqrsModule, LoggerModule],
  controllers: [UserController],
  providers: [...commands, ...queries, ...repositories, ...factories],
})
export class UserUseCaseModule {}
