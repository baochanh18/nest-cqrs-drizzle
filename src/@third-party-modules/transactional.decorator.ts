import type { ICommandHandler, IEventHandler } from '@nestjs/cqrs';
import type { DrizzleDB } from '~@types';
import { DRIZZLE } from './drizzle';

interface TransactionalHandler {
  db?: DrizzleDB;
}

export function Transactional() {
  return (
    target: ICommandHandler | IEventHandler,
    key: string,
    descriptor: PropertyDescriptor,
  ): void => {
    const originalMethod = descriptor.value as (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: any[]
    ) => Promise<unknown>;

    descriptor.value = new Proxy(originalMethod, {
      apply: async (
        proxyTarget,
        thisArg: TransactionalHandler,

        args,
      ): Promise<unknown> => {
        // Get the injected Drizzle instance
        const { db } = thisArg;
        if (!db) {
          throw new Error(
            'DrizzleDB instance is not available for transaction.',
          );
        }

        // Start transaction and execute method
        return db.transaction(async (tx) => {
          // Temporarily replace the db instance with transaction
          const originalDb = thisArg.db;
          thisArg[DRIZZLE] = tx;
          if (thisArg.db) {
            thisArg.db = tx;
          }

          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await proxyTarget.apply(thisArg, args);
          } finally {
            // Restore original db instance
            thisArg[DRIZZLE] = originalDb;
            if (thisArg.db) {
              thisArg.db = originalDb;
            }
          }
        });
      },
    });
  };
}
