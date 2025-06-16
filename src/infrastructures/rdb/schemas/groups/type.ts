import { createSelectSchema } from 'drizzle-zod';
import { groups } from '.';

export const groupSchema = createSelectSchema(groups);
