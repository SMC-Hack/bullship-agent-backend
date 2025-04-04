import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { cfg } from 'configuration';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    useFactory: () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const pool = new Pool({
        connectionString: `${cfg.databaseUrl}?sslmode=no-verify`,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
