import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { baseTableColumns } from '../base';
import { userGroups } from '../users';

export const groups = pgTable('groups', {
  ...baseTableColumns(),
  name: varchar({ length: 255 }).notNull(),
});

export const groupsRelations = relations(groups, ({ many }) => ({
  user: many(userGroups),
}));

export const groupSchema = createSelectSchema(groups);
