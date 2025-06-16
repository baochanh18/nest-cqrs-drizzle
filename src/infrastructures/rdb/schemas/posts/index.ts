import { relations } from 'drizzle-orm';
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { baseTableColumns } from '../base';
import { users } from '../users';

export const posts = pgTable('posts', {
  ...baseTableColumns(),
  title: varchar({ length: 255 }).notNull(),
  content: varchar({ length: 1000 }).notNull(),
  author_id: integer()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
});

export const postRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.author_id],
    references: [users.id],
  }),
}));
