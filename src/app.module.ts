import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { UserUseCaseModule } from '~use-cases';

@Module({
  imports: [
    CqrsModule,
    LoggerModule,
    UserUseCaseModule,
    LoggerModule.forRoot({
      pinoHttp: {
        customLogLevel: (req, res, err) => {
          if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn';
          } else if (res.statusCode >= 500 || err) {
            return 'error';
          }
          return 'info';
        },
        customProps: (req, res) => ({
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
        }),
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            headers: {
              'user-agent': req.headers['user-agent'],
              'content-type': req.headers['content-type'],
            },
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            levelFirst: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l o',
            ignore: 'pid,hostname,remoteAddress,remotePort',
          },
        },
      },
    }),
    ThrottlerModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
