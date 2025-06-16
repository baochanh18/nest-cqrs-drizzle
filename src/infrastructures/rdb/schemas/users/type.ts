import { createSelectSchema } from 'drizzle-zod';
import z from 'zod/v4';
import { users } from '.';
import { groupSchema } from '../groups/type';
import { postSchema } from '../posts/type';

export const userSchema = createSelectSchema(users);
export const userSchemaWithRelations = userSchema.extend({
  groups: groupSchema.array().optional(),
  posts: postSchema.array().optional(),
});

export type UserEntity = z.infer<typeof userSchema>;
