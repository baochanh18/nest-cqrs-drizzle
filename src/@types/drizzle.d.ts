import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '~rdb/schema';

export type DrizzleDB = NodePgDatabase<typeof schema>;
