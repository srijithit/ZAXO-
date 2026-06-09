import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (typeof window === 'undefined') {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
  });
  prismaInstance = globalForPrisma.prisma || new PrismaClient({ adapter });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} else {
  prismaInstance = null as any;
}

export const prisma = prismaInstance;
