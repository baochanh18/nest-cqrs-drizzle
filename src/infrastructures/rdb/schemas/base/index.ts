import { integer, timestamp } from 'drizzle-orm/pg-core';

export function baseTableColumns() {
  return {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    created_at: timestamp({ mode: 'date' }).notNull().defaultNow(),
    updated_at: timestamp({ mode: 'date' }).notNull().defaultNow(),
  };
}
