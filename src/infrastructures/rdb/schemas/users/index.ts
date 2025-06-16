import { relations } from 'drizzle-orm';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { baseTableColumns } from '../base';
import { groups } from '../groups';
import { posts } from '../posts';

export const users = pgTable('users', {
  ...baseTableColumns(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  groups: many(userGroups),
}));

export const userGroups = pgTable('user_group_relations', {
  ...baseTableColumns(),
  user_id: integer().references(() => users.id, { onDelete: 'cascade' }),
  group_id: integer().references(() => groups.id, { onDelete: 'cascade' }),
});

export const userGroupRelations = relations(userGroups, ({ one }) => ({
  user: one(users, {
    fields: [userGroups.user_id],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [userGroups.group_id],
    references: [groups.id],
  }),
}));
