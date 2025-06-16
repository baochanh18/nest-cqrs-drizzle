import { createSelectSchema } from 'drizzle-zod';
import type z from 'zod/v4';
import { posts } from '.';

export const postSchema = createSelectSchema(posts);
export type PostEntity = z.infer<typeof postSchema>;
