import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  _prismaClient: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Please add it in Vercel → Settings → Environment Variables.'
    );
  }
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
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
