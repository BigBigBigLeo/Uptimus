import { NextResponse } from 'next/server';
import { checkConnection } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const status = await checkConnection();

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        env: {
            VERCEL: process.env.VERCEL || 'false',
            NODE_ENV: process.env.NODE_ENV,
            HAS_DATABASE_URL: !!process.env.DATABASE_URL,
            DATABASE_URL_PREFIX: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) + '...' : 'none'
        },
        database: status
    });
}
