import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  _prismaClient: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set.'
    );
  }

  if (url.startsWith('postgres') || url.startsWith('postgresql')) {
    // Dynamic load PG adapter
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } else {
    // Dynamic load SQLite adapter
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const cleanUrl = url.startsWith('file:') ? url.replace('file:', '') : url;
    const adapter = new PrismaBetterSqlite3({ url: cleanUrl });
    return new PrismaClient({ adapter });
  }
}

function getClient(): PrismaClient {
  return (globalForPrisma._prismaClient ??= createPrismaClient());
}

// Lazy proxy — PrismaClient is only instantiated on the first actual DB access,
// NOT when this module is imported. This allows Next.js build to succeed
// even when DATABASE_URL is not set at build time.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getClient() as any)[prop as string];
  },
});
