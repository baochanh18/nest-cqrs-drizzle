import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '~rdb/schema';

export const DRIZZLE = Symbol('drizzle-connection');
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('PG_HOST') || 'localhost';
        const port = parseInt(
          configService.get<string>('PG_PORT') || '5432',
          10,
        );
        const user = configService.get<string>('PG_USER') || 'postgres';
        const password = configService.get<string>('PG_PASSWORD') || 'password';
        const database = configService.get<string>('PG_NAME') || 'account';

        const pool = new Pool({
          connectionString: `postgresql://${user}:${password}@${host}:${port}/${database}`,
          ssl: false,
        });

        return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
