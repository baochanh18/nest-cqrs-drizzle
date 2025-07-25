import { relations } from 'drizzle-orm';
import { integer, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { baseTableColumns } from '../base';
import { groups } from '../groups';
import { posts } from '../posts';

export const users = pgTable('users', {
  ...baseTableColumns,
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});

export const userGroups = pgTable(
  'user_group_relations',
  {
    ...baseTableColumns,
    userId: integer('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    groupId: integer('group_id').references(() => groups.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => [uniqueIndex('user_group_index').on(table.userId, table.groupId)],
);

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  groups: many(userGroups),
}));

export const userGroupRelations = relations(userGroups, ({ one }) => ({
  user: one(users, {
    fields: [userGroups.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [userGroups.groupId],
    references: [groups.id],
  }),
}));
