import { PrismaClient } from '@prisma/client';

console.log(`[Prisma] Initializing client. NODE_ENV: ${process.env.NODE_ENV}, VERCEL: ${process.env.VERCEL}`);
if (!process.env.DATABASE_URL) {
    console.warn('[Prisma] WARNING: DATABASE_URL is not defined in environment variables.');
} else {
    console.log(`[Prisma] DATABASE_URL detected (prefix: ${process.env.DATABASE_URL.substring(0, 10)}...)`);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
