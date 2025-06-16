import { Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { DrizzleModule } from '~@third-party-modules';
import { InjectionToken } from '~configs';
import { PostFactory, UserFactory } from '~domains/factories';
import { UserRepositoryImplement } from '~rdb/command';

const repositories: Provider[] = [
  {
    provide: InjectionToken.USER_COMMAND_REPOSITORY,
    useClass: UserRepositoryImplement,
  },
];
const factories = [UserFactory, PostFactory];
@Module({
  imports: [
    CqrsModule,
    DrizzleModule,
    LoggerModule.forRoot(),
    ThrottlerModule.forRoot(),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    ...factories,
    ...repositories,
  ],
})
export class AppModule {}
