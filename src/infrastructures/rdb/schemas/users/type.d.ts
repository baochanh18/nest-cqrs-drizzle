import { z } from 'zod';
import { userSchema } from '.';

const userSchemaPartial = userSchema.partial();

export type UserEntity = z.infer<typeof userSchema>;
export type UserPureEntity = z.infer<typeof userSchemaPartial>;
