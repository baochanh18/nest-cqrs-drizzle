import { integer, timestamp } from 'drizzle-orm/pg-core';

export const baseTableColumns = {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
};
