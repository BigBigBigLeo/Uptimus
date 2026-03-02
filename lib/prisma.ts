import { PrismaClient } from '@prisma/client';

console.log(`[Prisma] Initializing client. NODE_ENV: ${process.env.NODE_ENV}, VERCEL: ${process.env.VERCEL}`);
if (!process.env.DATABASE_URL) {
    console.warn('[Prisma] WARNING: DATABASE_URL is not defined in environment variables.');
} else {
    console.log(`[Prisma] DATABASE_URL detected (prefix: ${process.env.DATABASE_URL.substring(0, 10)}...)`);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Simple connection check helper (can be used in diagnostic routes)
export async function checkConnection() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return { success: true };
    } catch (error: any) {
        console.error('[Prisma] Connection Test Failed:', error.message);
        if (error.message.includes('Can\'t reach database server')) {
            return { success: false, hint: 'Check if your DATABASE_URL is correct and the database is accessible.' };
        }
        if (error.message.includes('password authentication failed')) {
            return { success: false, hint: 'Database password in DATABASE_URL is incorrect.' };
        }
        return { success: false, error: error.message };
    }
}

export default prisma;
