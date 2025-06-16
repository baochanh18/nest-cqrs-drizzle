import { createSelectSchema } from 'drizzle-zod';
import { posts } from '.';

export const postSchema = createSelectSchema(posts);
