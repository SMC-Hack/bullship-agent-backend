import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { cfg } from 'src/configuration';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    useFactory: () => {
      const pool = new Pool({
        connectionString: `${cfg.databaseUrl}?sslmode=no-verify`,
      });
      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
