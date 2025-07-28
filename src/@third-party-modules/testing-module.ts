import type { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { HTTP_STATUS_CODES } from '~configs';
import { DrizzleModule } from './drizzle';

export const testingModule = (
  providers: Provider[],
): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test',
        isGlobal: true,
      }),
      LoggerModule.forRoot({
        pinoHttp: {
          customLogLevel: (_req, res, err) => {
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
      CqrsModule,
      DrizzleModule,
    ],
    providers,
  }).compile();
};
