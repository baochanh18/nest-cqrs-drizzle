import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PinoLogger } from 'nestjs-pino';
import { Pool } from 'pg';
import * as schema from '~rdb/schema';

export const DRIZZLE = Symbol('drizzle-connection');
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService, PinoLogger],
      useFactory: (
        configService: ConfigService,
        logger: PinoLogger,
      ): NodePgDatabase<typeof schema> => {
        const host = configService.get<string>('PG_HOST') ?? 'localhost';
        const port = parseInt(
          configService.get<string>('PG_PORT') ?? '5432',
          10,
        );
        const user = configService.get<string>('PG_USER') ?? 'postgres';
        const password = configService.get<string>('PG_PASSWORD') ?? 'password';
        const database = configService.get<string>('PG_NAME') ?? 'account';

        const pool = new Pool({
          connectionString: `postgresql://${user}:${password}@${host}:${port}/${database}`,
          ssl: false,
        });

        return drizzle(pool, {
          schema,
          logger: {
            logQuery: (query, params) => {
              logger.info(
                'SQL Query:' +
                  query +
                  '\nParameters: ' +
                  JSON.stringify(params),
              );
            },
          },
        }) as NodePgDatabase<typeof schema>;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
