import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import {
  LoggerModule as CustomLoggerModule,
  DateTimeModule,
} from '~@third-party-modules';
import { HTTP_STATUS_CODES } from '~configs';
import { ErrorInterceptor } from '~interceptors';
import { UserUseCaseModule } from '~use-cases';

@Module({
  imports: [
    CqrsModule,
    DateTimeModule,
    CustomLoggerModule,
    UserUseCaseModule,
    LoggerModule.forRoot({
      pinoHttp: {
        customLogLevel: (req, res, err) => {
          if (
            res.statusCode >= HTTP_STATUS_CODES.BAD_REQUEST &&
            res.statusCode < HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
          ) {
            return 'warn';
          } else if (
            res.statusCode >= HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR ||
            err
          ) {
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
          req: (req: {
            method: string;
            url: string;
            headers: Record<string, string>;
          }) => ({
            method: req.method,
            url: req.url,
            headers: {
              userAgent: req.headers['user-agent'],
              contentType: req.headers['content-type'],
            },
          }),
          res: (res: { statusCode: number }) => ({
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
  ],
})
export class AppModule {}
