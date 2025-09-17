import path from 'node:path';

import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants';
import { Client } from 'pg';

import * as schema from '@/models/Schema';

import { Env } from './Env';

let client;
let drizzle: any;

// Initialize database connection
async function initializeDB() {
  // Need a database for production? Check out https://www.prisma.io/?via=saasboilerplatesrc
  // Tested and compatible with Next.js Boilerplate
  if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD && (Env.DATABASE_URL || process.env.DATABASE_URL)) {
    client = new Client({
      connectionString: process.env.DATABASE_URL || Env.DATABASE_URL,
    });
    await client.connect();

    drizzle = drizzlePg(client, { schema });
    await migratePg(drizzle, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
  } else {
    // Stores the db connection in the global scope to prevent multiple instances due to hot reloading with Next.js
    const global = globalThis as unknown as { client: PGlite; drizzle: PgliteDatabase<typeof schema> };

    if (!global.client) {
      global.client = new PGlite();
      await global.client.waitReady;

      global.drizzle = drizzlePglite(global.client, { schema });
    }

    drizzle = global.drizzle;
    
    try {
      await migratePglite(global.drizzle, {
        migrationsFolder: path.join(process.cwd(), 'migrations'),
      });
    } catch (error) {
      console.log('Migration error, continuing with existing schema:', error);
    }
  }
}

// Initialize database

// Use a promise to handle async initialization
const dbPromise = initializeDB().then(() => drizzle);

export { dbPromise as db };
