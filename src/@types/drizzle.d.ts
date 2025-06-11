import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../infrastructures/rdb/schemas';

declare type DrizzleDB = NodePgDatabase<typeof schema>;
