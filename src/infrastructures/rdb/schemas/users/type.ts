import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type z from 'zod/v4';
import { users } from '.';
import { groupSchema } from '../groups/type';
import { postSchema } from '../posts/type';

export const userSchema = createSelectSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const userInsertSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const userSchemaWithRelations = userSchema.extend({
  groups: groupSchema.array().optional(),
  posts: postSchema.array().optional(),
});

export type UserEntity = z.infer<typeof userSchema>;
export type UserInsertEntity = z.infer<typeof userInsertSchema>;
export type UserEntityWithRelations = z.infer<typeof userSchemaWithRelations>;
